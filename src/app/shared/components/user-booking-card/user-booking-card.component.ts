import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { AlertService } from '../../../core/services/alert';

export interface BookingDto {
  id?: number;
  parkingSpotId?: number;
  parkingSpotName: string;
  parkingSpotAddress?: string;
  startTime: string;
  endTime: string;
  checkInTime?: string;
  hours?: number;
  totalPrice: number;
  licensePlate: string;
  carBrand: string;
  parkingType?:string;
  carModel: string;
  carColor?: string;
  status: string; 
  accessCode?: string;
  userId?: number;
  createdAt?: string;
  checkOutTime?: string;
  qrCode?: string;          
}

@Component({
  selector: 'app-user-booking-card', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-booking-card.component.html',
  styleUrls: ['./user-booking-card.component.css']
})
export class UserBookingCardComponent implements OnInit, OnDestroy { 
  @Input() booking!: BookingDto;
  
  @Output() onExtend = new EventEmitter<BookingDto>();
  @Output() onCancel = new EventEmitter<BookingDto>();
  @Output() onViewDetails = new EventEmitter<BookingDto>();
  @Output() actionOccurred = new EventEmitter<void>(); 
  isQrExpanded: boolean = false;

  isExtending = false;
  
  parkingTimer: string = '00:00:00';
  private timerInterval: any;

  constructor(
    private router: Router, 
    private bookingService: BookingService,
    private alertService: AlertService 
  ) {}

  ngOnInit() {
    console.log('Kártya adata megérkezett:', this.booking);
    if (this.booking && this.booking.status === 'IN_PROGRESS' && this.booking.checkInTime) {
      this.startTimer(this.booking.checkInTime);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(checkInTime: string) {
    const startTime = new Date(checkInTime).getTime();

    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const difference = now - startTime;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const h = hours < 10 ? '0' + hours : hours;
        const m = minutes < 10 ? '0' + minutes : minutes;
        const s = seconds < 10 ? '0' + seconds : seconds;

        this.parkingTimer = `${h}:${m}:${s}`;
      }
    }, 1000);
  }

  async stopOnDemandParking(): Promise<void> {
    if (!this.booking.id) return;

    const confirmMsg = 'Biztosan leállítod a parkolást és kifizeted a díjat?';
    
    const isConfirmed = await this.alertService.confirm('Parkolás leállítása', confirmMsg, 'Igen, leállítás');

    if (isConfirmed) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.parkingTimer = '00:00:00';

      this.bookingService.stopAndPayOnDemandParking(this.booking.id).subscribe({
        next: (stripeResponse: any) => {
          console.log('Stripe link megérkezett:', stripeResponse.url);
          window.location.href = stripeResponse.url; 
        },
        error: (err) => {
          console.error('Hiba a leállításkor / Stripe híváskor:', err);
          this.alertService.error('Hiba történt', 'Hiba történt a leállításkor vagy a fizetés indításakor!');
          this.actionOccurred.emit(); 
        }
      });
    }
  }

  get showEndTime(): boolean {
    if (this.booking.status === 'IN_PROGRESS') {
      return false;
    }
    return true;
  }

  get finalEndTime(): string {
    if (this.booking.checkOutTime && (this.booking.status === 'COMPLETED' || this.booking.status === 'PENDING_PAYMENT')) {
      return this.booking.checkOutTime;
    }
    return this.booking.endTime;
  }

  get liveStatus(): string {
    if (this.booking.status === 'CANCELLED' || this.booking.status === 'CANCELLED_BY_ADMIN') {
      return 'CANCELLED';
    }

    if (this.booking.status === 'IN_PROGRESS') return 'IN_PROGRESS'; 
    if (this.booking.status === 'PENDING_PAYMENT') return 'PENDING_PAYMENT';
    if (this.booking.status === 'COMPLETED') return 'COMPLETED'; 

    const now = new Date();
    const start = new Date(this.booking.startTime);
    const end = new Date(this.booking.endTime);

    if (now > end) {
      return 'EXPIRED'; 
    } else if (now < start) {
      return 'UPCOMING'; 
    } else {
      return 'ACTIVE'; 
    }
  }

  get statusLabel(): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Aktív',
      'IN_PROGRESS': 'Folyamatban', 
      'UPCOMING': 'Hamarosan',
      'EXPIRED': 'Lejárt',
      'CANCELLED': 'Lemondva', 
      'CONFIRMED': 'Visszaigazolva',
      'PENDING_PAYMENT': 'Fizetésre vár', 
      'COMPLETED': 'Befejezett'
    };
    return labels[this.liveStatus] || this.liveStatus;
  }

  canCancel(booking: BookingDto): boolean {
    const status = this.liveStatus;
    if (status === 'CANCELLED' || status === 'COMPLETED' || status === 'EXPIRED' || status === 'PENDING_PAYMENT' || status === 'IN_PROGRESS') {
      return false;
    }
    if (booking.parkingType === 'ON_DEMAND' || booking.parkingType === 'MONTHLY' || booking.parkingType === 'DAILY') {
      return false;
    }
    return true;
  }

  canExtend(booking: BookingDto): boolean {
    return this.liveStatus === 'ACTIVE' || this.liveStatus === 'UPCOMING';
  }

  extendBooking(booking: BookingDto): void {
    if (!this.canExtend(booking)) {
      this.alertService.error('Nem hosszabbítható', 'Ezt a foglalást már nem lehet hosszabbítani, mert lejárt.');
      return;
    }
    this.router.navigate(['/extend-booking', booking.id]);
  }
  
  async cancelBooking(booking: BookingDto): Promise<void> {
    if (!this.canCancel(booking)) {
      this.alertService.error('Nem lemondható', 'Ezt a foglalást már nem lehet lemondani. (Minimum 1 órával a kezdés előtt lehetséges)');
      return;
    }

    const confirmMsg = `Parkoló: ${booking.parkingSpotName}<br>Kezdés: ${new Date(booking.startTime).toLocaleString('hu-HU')}<br><br>A fizetett összeg automatikusan visszatérítésre kerül a kártyádra.`;
    
    const isConfirmed = await this.alertService.confirm('Biztosan lemondod?', confirmMsg, 'Igen, lemondom');

    if (isConfirmed) {
      this.bookingService.cancelBooking(booking.id!).subscribe({
        next: () => {
          this.alertService.success('Lemondva', 'A visszatérítés 5-10 munkanapon belül megjelenik a kártyádon.');
          this.booking.status = 'CANCELLED';
          this.actionOccurred.emit();
        },
        error: (err) => {
          console.error('Törlés hiba:', err);
          this.alertService.error('Hiba', err.error?.error || err.error || 'Nem sikerült lemondani');
        }
      });
    }
  }

  viewDetails(booking: BookingDto): void {
    this.onViewDetails.emit(booking);
  }
  openQrModal() {
    this.isQrExpanded = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeQrModal() {
    this.isQrExpanded = false;
    document.body.style.overflow = 'auto'; 
  }

  copyAccessCode(): void {
    if (this.booking.accessCode) {
      navigator.clipboard.writeText(this.booking.accessCode).then(() => {
        this.alertService.toast('Belépési kód másolva!', 'success');
      });
    }
  }
}