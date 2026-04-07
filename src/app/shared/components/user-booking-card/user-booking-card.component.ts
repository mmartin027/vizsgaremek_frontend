import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
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
  carModel: string;
  carColor?: string;
  status: string; 
  accessCode?: string;
  userId?: number;
  createdAt?: string;
  checkOutTime?: string;
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

  isExtending = false;
  
  parkingTimer: string = '00:00:00';
  private timerInterval: any;

  constructor(private router: Router, private bookingService: BookingService) {}

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

 
  stopOnDemandParking(): void {
    if (!this.booking.id) return;

    const confirmMsg = 'Biztosan leállítod a parkolást és kifizeted a díjat?';
    if (confirm(confirmMsg)) {
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
          alert('Hiba történt a leállításkor vagy a fizetés indításakor!');
          this.actionOccurred.emit(); 
        }
      });
    }
  }

  get liveStatus(): string {
    if (this.booking.status === 'CANCELLED') return 'CANCELLED';
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
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (this.liveStatus === 'ACTIVE' || this.liveStatus === 'UPCOMING') && hoursDiff >= 1;
  }

  canExtend(booking: BookingDto): boolean {
    return this.liveStatus === 'ACTIVE' || this.liveStatus === 'UPCOMING';
  }

  extendBooking(booking: BookingDto): void {
    if (!this.canExtend(booking)) {
      alert('Ezt a foglalást már nem lehet hosszabbítani, mert lejárt.');
      return;
    }
    this.router.navigate(['/extend-booking', booking.id]);
  }

  cancelBooking(booking: BookingDto): void {
    if (!this.canCancel(booking)) {
      alert('Ezt a foglalást már nem lehet lemondani. (Minimum 1 órával a kezdés előtt lehetséges)');
      return;
    }

    const confirmMsg = `Biztosan lemondod ezt a foglalást?\n\nParkoló: ${booking.parkingSpotName}\nKezdés: ${new Date(booking.startTime).toLocaleString('hu-HU')}\n\nA lemondás után visszatérítést kapsz.`;
    if (confirm(confirmMsg)) {
      this.onCancel.emit(booking);
    }
  }

  viewDetails(booking: BookingDto): void {
    this.onViewDetails.emit(booking);
  }

  copyAccessCode(): void {
    if (this.booking.accessCode) {
      navigator.clipboard.writeText(this.booking.accessCode).then(() => {
        alert('Belépési kód vágólapra másolva: ' + this.booking.accessCode);
      });
    }
  }
}