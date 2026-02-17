import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service'; 
import { AuthService } from '../../../services/auth';
import { UserBookingsService } from '../../../services/user-bookings.service';
import { UserBookingCardComponent } from  '../../../shared/components/user-booking-card/user-booking-card.component';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  // Tedd be az imports listába!
  imports: [CommonModule, UserBookingCardComponent], 
  templateUrl: './user-parkings.component.html',
  styleUrl: './user-parkings.component.css'
})
export class MyBookingsComponent implements OnInit {
  bookings: any[] = [];
  isLoading = true;

  constructor(
    private bookingsService: BookingService,
    private authService: AuthService,
    private userBookingsService: UserBookingsService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.userBookingsService.getBookingsByUserId(userId).subscribe({
        next: (data) => {
          this.bookings = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Hiba:', err);
          this.isLoading = false;
        }
      });
    }
  }
}