import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { BookingService } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth';
import { UserBookingsService } from '../../../core/services/user-bookings.service';
import { UserBookingCardComponent } from '../../../shared/components/user-booking-card/user-booking-card.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AlertService } from '../../../core/services/alert'; 

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
  activeTab: 'current' | 'past'  | 'berlet'='current';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private userBookingsService: UserBookingsService,
    private router: Router,
    private alertService: AlertService 
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  get pastBookings(): any[] {
    const now = new Date();
    return this.bookings.filter(booking => {
      if (booking.status === 'CANCELLED' || booking.status === 'CANCELLED_BY_ADMIN' || booking.status === 'COMPLETED') return true;
      if (booking.endTime && new Date(booking.endTime) < now && booking.status !== 'IN_PROGRESS') return true;
      return false;
    });
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
      },
      error: (err) => {
        console.error(' Hiba a foglalások betöltésekor:', err);
        this.errorMessage = 'Nem sikerült betölteni a foglalásokat.';
        this.isLoading = false;
      }
    });
  }
  
  handleExtend(booking: any): void {
    this.router.navigate(['/extend-booking', booking.id]);
  }

 
  async handleCancel(booking: any): Promise<void> {
    
    if (!booking.id) {
      this.alertService.error('Hiba', 'Hibás foglalás azonosító!');
      return;
    }

    const confirmMsg = `Parkoló: ${booking.parkingSpotName}\nRendszám: ${booking.licensePlate}`;
    
    const isConfirmed = await this.alertService.confirm(
      'Foglalás lemondása', 
      confirmMsg, 
      'Igen, lemondom'
    );
    
    if (isConfirmed) {
      this.bookingService.cancelBooking(booking.id).subscribe({
        next: () => {
          this.alertService.success('Siker!', 'A foglalást sikeresen lemondta.');
          this.loadBookings();
        },
        error: (err) => {
          console.error(' Lemondási hiba:', err);
          this.alertService.error('Hiba történt', err.error?.error || err.message);
        }
      });
    }
  }

  getDaysRemaining(endTime: string): number {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getSubscriptionProgress(sub: any): number {
    const start = new Date(sub.startTime).getTime();
    const end = new Date(sub.endTime).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const remaining = end - now;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  }

  handleViewDetails(booking: any): void {
    
    const detailsMsg = `Parkoló: ${booking.parkingSpotName}<br>Rendszám: ${booking.licensePlate}<br>Ár: ${booking.totalPrice} Ft`;
    this.alertService.info('Foglalás részletei', detailsMsg);
  }

  get activeBookings(): any[] {
    return this.bookings.filter(b => b.status === 'ACTIVE');
  }
 
  get completedBookings(): any[] {
    return this.bookings.filter(b => b.status === 'COMPLETED');
  }

  get subscriptionBookings(): any[] {
    return this.bookings.filter(booking => 
      booking.parkingType === 'MONTHLY' || booking.parkingType === 'DAILY'
    );
  }

  get activeSubscriptions(): any[] {
    const now = new Date();
    return this.subscriptionBookings.filter(b => 
      b.status === 'ACTIVE' && new Date(b.endTime) > now
    );
  }

  get upcomingAndActiveBookings(): any[] {
    const now = new Date();
    return this.bookings.filter(booking => {
      if (!booking.endTime) return false;
      if (booking.status === 'CANCELLED' || booking.status === 'CANCELLED_BY_ADMIN') return false;
      if (booking.parkingType === 'MONTHLY' || booking.parkingType === 'DAILY') return false;
      const end = new Date(booking.endTime);
      return end >= now;
    });
  }

  get cancelledBookings(): any[] {
    return this.bookings.filter(b => b.status === 'CANCELLED');
  }
}