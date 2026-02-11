import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Szükséges a backend híváshoz
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Szervizek és komponensek importálása
import { BookingService } from '../../services/booking.service'; 
import { ParkingService } from '../../services/parking';
import { AuthService } from '../../core/services/auth';
import { ParkingSpotDto } from '../../shared/components/card/card.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, HeaderComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  spotId!: number;
  selectedSpot?: ParkingSpotDto; 
  
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
    private bookingService: BookingService,
    private parkingService: ParkingService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient // Injektálva a közvetlen API híváshoz
  ) {}

  ngOnInit() {
    // 1. Ellenőrizzük, be van-e jelentkezve a felhasználó
    if (!this.authService.isLoggedIn()) {
      alert('A foglaláshoz be kell jelentkezned!');
      this.router.navigate(['/login']);
      return;
    }
    
    this.spotId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.spotId) {
      this.parkingService.getById(this.spotId).subscribe({
        next: (spot) => {
          this.selectedSpot = spot;
        },
        error: (err) => {
          console.error('Nem sikerült betölteni a parkolót', err);
          alert('Hiba a parkolóhely adatainak lekérésekor.');
        }
      });
    }
  }

  
  confirmBooking() {
    if (!this.selectedSpot) return;

    // Alapvető validációk
    if (!this.bookingData.licensePlate || !this.bookingData.startTime || !this.bookingData.endTime) {
      alert('Kérlek töltsd ki az összes kötelező mezőt!');
      return;
    }

    const startDate = new Date(this.bookingData.startTime);
    const endDate = new Date(this.bookingData.endTime);

    if (endDate <= startDate) {
      alert('A befejezés időpontja későbbi kell legyen mint a kezdés!');
      return;
    }

    const userId = this.authService.getCurrentUserId();

    const stripeRequest = {
      parkingSpotId: this.spotId,
      userId: userId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      licensePlate: this.bookingData.licensePlate,
      carBrand: this.bookingData.carBrand || '',
      carModel: this.bookingData.carModel || '',
      carColor: this.bookingData.carColor || '',
      amount: this.totalPrice, 
      currency: 'huf',
      name: `Parkolás: ${this.selectedSpot.address}`,
      quantity: 1
    };

    console.log('Fizetési folyamat indítása...', stripeRequest);

    this.http.post<any>('http://localhost:8080/api/booking/checkout', stripeRequest)
      .subscribe({
        next: (response) => {
          if (response.sessionURL) {
            console.log('Átirányítás a Stripe Checkout oldalra...');
            // Átirányítjuk a júzert a Stripe biztonságos felületére
            window.location.href = response.sessionURL;
          } else {
            alert('Hiba: A szerver nem küldött fizetési URL-t.');
          }
        },
        error: (err) => {
          console.error('Stripe hiba:', err);
          alert('Nem sikerült elindítani a fizetést: ' + (err.error?.message || err.message));
        }
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
    const serviceFee = 800; 
    return (this.durationInHours * hourlyRate) + serviceFee;
  }
}