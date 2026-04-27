import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { StripeService } from '../../../core/services/stripe.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-booking-update',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './booking-update.component.html',
  styleUrls: ['./booking-update.component.css']
})
export class BookingUpdateComponent implements OnInit {
  bookingId!: number;
  booking: any = null;
  isLoading = true;
  
  additionalHours = 4; 
  additionalMinutes: number | null = null; 
  quickSelectHours = [1, 2, 3, 4]; 
  
  get totalExtensionMinutes(): number {
    return (this.additionalHours * 60) + (this.additionalMinutes || 0);
  }
  
  get newEndTime(): Date | null {
    if (!this.booking) return null;
    const endTime = new Date(this.booking.endTime);
    endTime.setMinutes(endTime.getMinutes() + this.totalExtensionMinutes);
    return endTime;
  }

  get newTotalHours(): number {
    if (!this.booking) return 0;
    return this.booking.hours + (this.totalExtensionMinutes / 60);
  }

  get currentHourlyRate(): number {
    if (!this.booking) return 0;
    
    if (this.booking.parkingSpot && this.booking.parkingSpot.hourlyRate) {
        return this.booking.parkingSpot.hourlyRate;
    } 
    const validHours = this.booking.hours > 0 ? this.booking.hours : 1; 
    return this.booking.totalPrice / validHours;
  }
  
  get additionalPrice(): number {
    return (this.totalExtensionMinutes / 60) * this.currentHourlyRate;
  }
  
  get newTotalPrice(): number {
    if (!this.booking) return 0;
    return this.booking.totalPrice + this.additionalPrice;
  }

  get remainingTime(): string {
    if (!this.booking) return '';
    const now = new Date();
    const endTime = new Date(this.booking.endTime);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Lejárt';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ó ${minutes}p`;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private stripeService: StripeService,
    private alertService: AlertService 
  ) {}

  ngOnInit() {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.bookingId) {
      this.alertService.error('Hiba', 'Hibás foglalás azonosító!');
      this.router.navigate(['/foglalasaim']);
      return;
    }
    
    this.loadBooking();
  }

  loadBooking() {
    this.isLoading = true;
    
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.isLoading = false;
      },
      error: (err) => {
        this.alertService.error('Hiba', 'Nem sikerült betölteni a foglalást!');
        this.router.navigate(['/foglalasaim']);
      }
    });
  }

  get statusInfo(): string {
    if (!this.booking || !this.booking.startTime || !this.booking.endTime) {
      return '';
    }

    const now = new Date(); 
    const start = new Date(this.booking.startTime);
    const end = new Date(this.booking.endTime);

    if (now > end) {
      return 'Lejárt'; 
    } 
    else if (now < start) {
      return 'Még hátra van'; 
    } 
    else {
      return 'Aktív';
    }
  }

  decreaseHours() {
    if (this.additionalHours > 0) { 
      this.additionalHours--;
    }
  }

  increaseHours() {
    if (this.additionalHours < 24) {
      this.additionalHours++;
    }
  }

  selectQuickHours(hours: number) {
    this.additionalHours = hours;
    this.additionalMinutes = null; 
  }

  validateMinutes() {
    if (this.additionalMinutes !== null) {
      if (this.additionalMinutes > 59) {
        this.additionalMinutes = 59;
      } else if (this.additionalMinutes < 0) {
        this.additionalMinutes = 0;
      }
    }
  }

  async confirmExtension(): Promise<void> {
    if (!this.booking) return;
    
    if (this.totalExtensionMinutes <= 0) {
      this.alertService.error('Hiba', 'Kérlek adj meg egy érvényes hosszabbítási időt!');
      return;
    }

    let timeString = '';
    if (this.additionalHours > 0) timeString += `${this.additionalHours} órával `;
    if (this.additionalMinutes && this.additionalMinutes > 0) {
      if (this.additionalHours > 0) timeString += 'és ';
      timeString += `${this.additionalMinutes} perccel`;
    }

    const confirmMsg = `Biztosan hosszabbítod a foglalást ${timeString.trim()}? Extra díj: <b>${Math.round(this.additionalPrice)} Ft</b>`;
    
    const isConfirmed = await this.alertService.confirm(
      'Hosszabbítás', 
      confirmMsg, 
      'Fizetés és megerősítés'
    );

    if (isConfirmed) {
      this.bookingService.createExtensionSession(this.bookingId, this.totalExtensionMinutes).subscribe({
        next: (response: any) => {
          if (response.url) {
            window.location.href = response.url;
          } else {
            this.alertService.error('Hiba', 'Nincs fizetési URL');
          }
        },
        error: (err) => {
          this.alertService.error('Szerver hiba', err.error?.error || err.message);
        }
      });
    }
  }
  
  cancel() {
    this.router.navigate(['/foglalasaim']);
  }
}