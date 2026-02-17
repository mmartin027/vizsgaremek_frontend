import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../../../services/stripe.service';
import { BookingService } from '../../../services/booking.service'; 
import { ParkingService } from '../../../services/parking';
import { AuthService } from '../../../services/auth';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: 'user-parkings.component.html',
  styleUrls: ['./user-parkings.component.css']
})
export class UserParkingsComponent implements OnInit {
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
    // 1. Bejelentkezés ellenőrzése
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. ID kinyerése az URL-ből
    this.spotId = Number(this.route.snapshot.paramMap.get('id'));

    // 3. Parkolóhely adatainak lekérése
    this.parkingService.getById(this.spotId).subscribe({
      next: (spot) => {
        this.selectedSpot = spot;
        console.log('Betöltött parkoló:', spot);
      },
      error: (err) => console.error('Hiba a parkoló lekérésekor:', err)
    });
  }

  // Időtartam számítása órában
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

  // Form validációs metódus 
  isFormValid(): boolean {
    const now = new Date().getTime();
    const start = new Date(this.bookingData.startTime).getTime();

    return (
      this.bookingData.licensePlate.trim().length >= 4 && 
      this.bookingData.carBrand.trim() !== '' &&
      this.bookingData.carModel.trim() !== '' &&
      this.bookingData.carColor.trim() !== '' &&
      this.bookingData.startTime !== '' &&
      this.bookingData.endTime !== '' &&
      this.durationInHours > 0 &&
      start >= (now - 60000) // Engedünk 1 perc csúszást a kitöltés miatt
    );
  }

  async confirmBooking() {
    console.log('Foglalás indítása...');

    if (!this.selectedSpot || !this.isFormValid()) {
      alert('Kérjük, tölts ki minden mezőt megfelelően!');
      return;
    }

    // Payload összeállítása a backend számára
    const payload = {
      licensePlate: this.bookingData.licensePlate.toUpperCase(),
      carBrand: this.bookingData.carBrand,
      carModel: this.bookingData.carModel,
      carColor: this.bookingData.carColor,
      startTime: new Date(this.bookingData.startTime).toISOString(),
      endTime: new Date(this.bookingData.endTime).toISOString(),
      userId: this.authService.getCurrentUserId()
    };

    console.log('Küldendő adatok:', payload);

    // Stripe Session kérése a backendtől
    this.bookingService.createCheckoutSession(this.spotId, payload).subscribe({
      next: async (response: any) => {
        console.log('Backend válasz (Session ID):', response.sessionId);
        if (response.sessionId) {
          // Átirányítás a Stripe fizetési oldalára
          await this.stripeService.redirectToCheckout(response.sessionId);
        } else {
          alert('Hiba: Nem érkezett fizetési azonosító.');
        }
      },
      error: (err) => {
        console.error('Hiba a foglalás során:', err);
        alert(err.status === 401 ? 'Lejárt a munkamenet, jelentkezz be újra!' : 'Szerver hiba történt a fizetés indításakor.');
      }
    });
  }
}