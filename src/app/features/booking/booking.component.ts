import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../services/stripe.service'; // Ellenőrizd az elérési utat!
import { ParkingService } from '../../services/parking';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    private stripeService: StripeService, // Beinjeltálva
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
    
    this.parkingService.getById(this.spotId).subscribe(spot => {
      this.selectedSpot = spot;
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

  async confirmBooking() {
    if (!this.selectedSpot) return;

    // Payload összeállítása a backend BookingDto-nak megfelelően
    const payload = {
      ...this.bookingData,
      startTime: new Date(this.bookingData.startTime).toISOString(),
      endTime: new Date(this.bookingData.endTime).toISOString(),
      userId: this.authService.getCurrentUserId(),
      amount: this.totalPrice // Itt ellenőrizd, hogy a backend 'amount'-ot vár-e
    };

    console.log('Fizetés indítása...', payload);

    // Meghívjuk a szervizt
    this.stripeService.createSession(this.spotId, payload).subscribe({
      next: async (response: any) => {
        if (response.sessionId) {
          await this.stripeService.redirectToCheckout(response.sessionId);
        } else {
          alert('Hiba: Nem érkezett sessionId a szervertől.');
        }
      },
      error: (err) => {
        console.error('Hiba a folyamat során:', err);
        if (err.status === 401) {
          alert('Bejelentkezés szükséges vagy SecurityConfig hiba!');
        } else {
          alert('Szerver hiba történt a fizetés indításakor.');
        }
      }
    });
  }
}