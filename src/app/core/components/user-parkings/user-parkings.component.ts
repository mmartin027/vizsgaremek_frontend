import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // ← ÚJ IMPORT
import { BookingService } from '../../../services/booking.service'; 
import { AuthService } from '../../../services/auth';
import { UserBookingsService } from '../../../services/user-bookings.service';
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
    private router: Router // ← ÚJ DEPENDENCY
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  /**
   * Foglalások betöltése
   */
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
        console.log('✅ Foglalások betöltve:', data);
      },
      error: (err) => {
        console.error('❌ Hiba a foglalások betöltésekor:', err);
        this.errorMessage = 'Nem sikerült betölteni a foglalásokat.';
        this.isLoading = false;
      }
    });
  }

  
  handleExtend(booking: any): void {
    console.log('Hosszabbítás kérve:', booking);
    this.router.navigate(['/extend-booking', booking.id]);
  }

  /**
   * Lemondás kezelése
   */
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
          alert('✅ Foglalás sikeresen lemondva!');
          this.loadBookings(); // Újratöltés
        },
        error: (err) => {
          console.error('❌ Lemondási hiba:', err);
          alert('Hiba történt: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  /**
   * Részletek megtekintése
   */
  handleViewDetails(booking: any): void {
    console.log('Részletek kérve:', booking);
    // Navigálás részletek oldalra (ha van ilyen)
    // this.router.navigate(['/booking-details', booking.id]);
    
    // Vagy modal megnyitása
    alert(`Foglalás részletei:\n\nParkoló: ${booking.parkingSpotName}\nRendszám: ${booking.licensePlate}\nÁr: ${booking.totalPrice} Ft`);
  }

  /**
   * Szűrés aktív foglalásokra
   */
  get activeBookings(): any[] {
    return this.bookings.filter(b => b.status === 'ACTIVE');
  }

 
  get completedBookings(): any[] {
    return this.bookings.filter(b => b.status === 'COMPLETED');
  }

  
  get cancelledBookings(): any[] {
    return this.bookings.filter(b => b.status === 'CANCELLED');
  }
}