import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../core/services/booking.service';
import { StripeService } from '../../../core/services/stripe.service';
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

    if (this.booking.parkingSpot && this.booking.parkingSpot.hourlyRate) {
        return this.additionalHours * this.booking.parkingSpot.hourlyRate;
    }
    
    
    const validHours = this.booking.hours > 0 ? this.booking.hours : 1; 
    const calculatedHourlyRate = this.booking.totalPrice / validHours;
    
    return this.additionalHours * calculatedHourlyRate;
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
        console.log('--- FOGLALÁS ADATOK A BACKENDRŐL ---');
        console.log('Teljes objektum:', booking);
        console.log('Kezdési idő mező (startTime):', booking.startTime);
        console.log('Kezdési idő mező (startDate):', booking.startDate);
        console.log('Befejezési idő mező (endTime):', booking.endTime);
        console.log('-----------------------------------');
        
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

  this.bookingService.createExtensionSession(this.bookingId, this.additionalMinutes).subscribe({
    next: (response: any) => {
      console.log(' Extension session:', response);
      
      if (response.url) {
        console.log(' Átirányítás Stripe-ra');
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