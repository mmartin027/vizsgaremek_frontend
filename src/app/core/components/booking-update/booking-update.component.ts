import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { StripeService } from '../../../services/stripe.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

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
  quickSelectHours = [1, 2, 3, 4]; 
  
  get additionalMinutes(): number {
    return this.additionalHours * 60;
  }
  
  get newEndTime(): Date | null {
    if (!this.booking) return null;
    const endTime = new Date(this.booking.endTime);
    endTime.setHours(endTime.getHours() + this.additionalHours);
    return endTime;
  }
  
  get newTotalHours(): number {
    if (!this.booking) return 0;
    return this.booking.hours + this.additionalHours;
  }
  
  get additionalPrice(): number {
    if (!this.booking) return 0;
    return this.additionalHours * (this.booking.totalPrice / this.booking.hours); 
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
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.bookingId) {
      alert('Hibás foglalás azonosító!');
      this.router.navigate(['/foglalasaim']);
      return;
    }
    
    this.loadBooking();
  }


  loadBooking() {
    this.isLoading = true;
    
    this.bookingService.getBookingById(this.bookingId).subscribe({
      next: (booking) => {
        console.log('Foglalás betöltve:', booking);
        this.booking = booking;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Hiba a foglalás betöltésekor:', err);
        alert('Nem sikerült betölteni a foglalást!');
        this.router.navigate(['/foglalasaim']);
      }
    });
  }

  /**
   * Óra értékének csökkentése
   */
  decreaseHours() {
    if (this.additionalHours > 1) {
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
  }


  
 async confirmExtension() {
  if (!this.booking) return;

  const confirmMsg = `Biztosan hosszabbítod a foglalást ${this.additionalHours} órával?\n\nExtra díj: ${this.additionalPrice} Ft`;
  
  if (!confirm(confirmMsg)) return;

  console.log(' Hosszabbítás indítása...');

  //  Stripe Session létrehozása
  this.bookingService.createExtensionSession(this.bookingId, this.additionalMinutes).subscribe({
    next: (response: any) => {
      console.log(' Extension session:', response);
      
      if (response.url) {
        console.log('🔄 Átirányítás Stripe-ra');
        window.location.href = response.url;
      } else {
        alert('Hiba: Nincs fizetési URL');
      }
    },
    error: (err) => {
      console.error(' Hiba:', err);
      alert('Hiba: ' + (err.error?.error || err.message));
    }
  });
}
  
  cancel() {
    this.router.navigate(['/foglalasaim']);
  }
}