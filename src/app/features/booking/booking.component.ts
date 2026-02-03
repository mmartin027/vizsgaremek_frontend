import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../services/parking';
import { AuthService } from '../../core/services/auth';
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
    private router: Router
  ) {}

  ngOnInit() {
    // Bejelentkezés ellenőrzés
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
        error: (err) => console.error('Nem sikerült betölteni a parkolót', err)
      });
    }
  }

 confirmBooking() {
  if (!this.selectedSpot) return;

  if (!this.bookingData.licensePlate || !this.bookingData.startTime || !this.bookingData.endTime) {
    alert('Kérlek töltsd ki az összes kötelező mezőt!');
    return;
  }

  const startDate = new Date(this.bookingData.startTime);
  const endDate = new Date(this.bookingData.endTime);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    alert('Érvénytelen dátum formátum!');
    return;
  }

  if (endDate <= startDate) {
    alert('A befejezés időpontja későbbi kell legyen mint a kezdés!');
    return;
  }

  // UserId lekérése a tokenből
  const userId = this.authService.getCurrentUserId();
  

  const payload = {
    parkingSpotId: this.spotId,
    userId: userId, 
    licensePlate: this.bookingData.licensePlate,
    carBrand: this.bookingData.carBrand || '',
    carModel: this.bookingData.carModel || '',
    carColor: this.bookingData.carColor || '',
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString()
  };


  this.bookingService.create(this.spotId, payload).subscribe({
    next: (response) => {
      alert('Sikeres foglalás! Kód: ' + response);
      this.router.navigate(['/home']);
    },
    error: (err) => {
      console.error('Foglalási hiba:', err);
      alert('Hiba: ' + (err.error || err.message));
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
  const serviceFee = 80000
  return (this.durationInHours * hourlyRate) + serviceFee;
}


}