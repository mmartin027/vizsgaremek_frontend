import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Ez az interface pontosan a foglalásod adatait tükrözi
export interface BookingDto {
  parkingSpotName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  status: string;
  accessCode?: string;
}

@Component({
  selector: 'app-user-booking-card', // Ez lesz a hívóneve a HTML-ben
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-booking-card.component.html',
  styleUrls: ['./user-booking-card.component.css']
})
export class UserBookingCardComponent {
  @Input() booking!: BookingDto;

  // Segédfüggvény a státusz színezéséhez
  getStatusLabel(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'Visszaigazolva';
      case 'PENDING': return 'Fizetésre vár';
      case 'CANCELLED': return 'Lemondva';
      default: return status;
    }
  }
}