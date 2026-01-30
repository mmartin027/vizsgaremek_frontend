import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service'; // Ellenőrizd az utat!
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  spotId!: number;
  
  
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
    private router: Router
  ) {}

  ngOnInit() {
    this.spotId = Number(this.route.snapshot.paramMap.get('id'));
  }

  confirmBooking() {
    const payload = {
      ...this.bookingData,
      startTime: new Date(this.bookingData.startTime).toISOString(),
      endTime: new Date(this.bookingData.endTime).toISOString()
    };

    this.bookingService.create(this.spotId, payload).subscribe({
      next: (accessCode) => {
        alert('Sikeres foglalás! Kód: ' + accessCode);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        alert('Hiba történt: ' + err.message);
      }
    });
  }
}