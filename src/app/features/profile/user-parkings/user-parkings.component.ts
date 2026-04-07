import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth';
import { UserBookingsService } from '../../../core/services/user-bookings.service';
import { UserBookingCardComponent } from '../../../shared/components/user-booking-card/user-booking-card.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, UserBookingCardComponent, HeaderComponent], 
  templateUrl: './user-parkings.component.html',
  styleUrl: './user-parkings.component.css'
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private userBookingsService: UserBookingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }


  loadBookings(): void {
    const userId = this.authService.getCurrentUserId();
    
    if (!userId) {
      this.errorMessage = 'Nem vagy bejelentkezve!';
      this.isLoading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.userBookingsService.getBookingsByUserId(userId).subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
        console.log(' Foglalások betöltve:', data);
      },
      error: (err) => {
        console.error(' Hiba a foglalások betöltésekor:', err);
        this.errorMessage = 'Nem sikerült betölteni a foglalásokat.';
        this.isLoading = false;
      }
    });
  }

  
  handleExtend(booking: any): void {
    console.log('Hosszabbítás kérve:', booking);
    this.router.navigate(['/extend-booking', booking.id]);
  }


  


  handleCancel(booking: any): void {
    console.log('Lemondás kérve:', booking);
    
    if (!booking.id) {
      alert('Hibás foglalás azonosító!');
      return;
    }

    const confirmMsg = `Biztosan lemondod ezt a foglalást?\n\nParkoló: ${booking.parkingSpotName}\nRendszám: ${booking.licensePlate}`;
    
    if (confirm(confirmMsg)) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => {
          alert(' Foglalás sikeresen lemondva!');
          this.loadBookings();
        },
        error: (err) => {
          console.error(' Lemondási hiba:', err);
          alert('Hiba történt: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  
  handleViewDetails(booking: any): void {
    console.log('Részletek kérve:', booking);
 
    alert(`Foglalás részletei:\n\nParkoló: ${booking.parkingSpotName}\nRendszám: ${booking.licensePlate}\nÁr: ${booking.totalPrice} Ft`);
  }


  get activeBookings(): any[] {
    return this.bookings.filter(b => b.status === 'ACTIVE');
  }

 
  get completedBookings(): any[] {
    return this.bookings.filter(b => b.status === 'COMPLETED');
  }

    get upcomingAndActiveBookings(): any[] {
    const now = new Date();
    
    return this.bookings.filter(booking => {
      if (!booking.endTime) return false;
      
      const end = new Date(booking.endTime);
      
      return end >= now; 
    });
  }


  get cancelledBookings(): any[] {
    return this.bookings.filter(b => b.status === 'CANCELLED');
  }
}