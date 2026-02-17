import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../services/stripe.service';
import { BookingService } from '../../services/booking.service'; 
import { ParkingService } from '../../services/parking';
import { AuthService } from '../../services/auth';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  spotId!: number;
  selectedSpot?: any;
  
  bookingData = {
    licensePlate: '',
    carBrand: '',
    carModel: '',
    carColor: '',
    startTime: '',
    endTime: ''
  };

  constructor(
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private bookingService: BookingService, 
    private parkingService: ParkingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.spotId = Number(this.route.snapshot.paramMap.get('id'));
    
    this.parkingService.getById(this.spotId).subscribe({
      next: (spot) => {
        this.selectedSpot = spot;
        console.log('Parkolóhely betöltve:', spot);
      },
      error: (err) => console.error('Hiba a betöltéskor:', err)
    });
  }

  get durationInHours(): number {
    if (!this.bookingData.startTime || !this.bookingData.endTime) return 0;
    const start = new Date(this.bookingData.startTime).getTime();
    const end = new Date(this.bookingData.endTime).getTime();
    const diffMs = end - start;
    return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;
  }

  get totalPrice(): number {
    const hourlyRate = this.selectedSpot?.hourlyRate || 0;
    return this.durationInHours * hourlyRate;
  }

  isFormValid(): boolean {
    return (
      this.bookingData.licensePlate.trim().length >= 4 && 
      this.bookingData.carBrand.trim() !== '' &&
      this.bookingData.carModel.trim() !== '' &&
      this.bookingData.carColor.trim() !== '' &&
      this.bookingData.startTime !== '' &&
      this.bookingData.endTime !== '' &&
      this.durationInHours > 0
    );
  }

 async confirmBooking() {
  if (!this.bookingData.startTime || !this.bookingData.endTime) {
    alert('Kérlek válassz időpontot!');
    return;
  }


  const formattedStartTime = new Date(this.bookingData.startTime).toISOString();
  const formattedEndTime = new Date(this.bookingData.endTime).toISOString();

  const payload = {
    ...this.bookingData,
    startTime: formattedStartTime, // Most már: "2026-02-16T22:30:00.000Z"
    endTime: formattedEndTime,
    licensePlate: this.bookingData.licensePlate.toUpperCase(),
    userId: this.authService.getCurrentUserId()
  };

  console.log('Küldött adatok (Instant formátumban):', payload);

  this.bookingService.createCheckoutSession(this.spotId, payload).subscribe({
    next: (response: any) => {
      if (response.url) {
        window.location.href = response.url;
      }
    },
    error: (err) => {
      console.error('Szerver hiba:', err);
      alert('Szerver hiba történt a Stripe indításakor.');
    }
  });
}
}