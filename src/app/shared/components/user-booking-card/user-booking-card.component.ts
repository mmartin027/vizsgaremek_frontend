import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Ez az interface pontosan a foglalásod adatait tükrözi
export interface BookingDto {
  id?: number;
  parkingSpotId?: number;
  parkingSpotName: string;
  parkingSpotAddress?: string;
  startTime: string;
  endTime: string;
  hours?: number;
  totalPrice: number;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  carColor?: string;
  status: string;
  accessCode?: string;
  userId?: number;
  createdAt?: string;
}

@Component({
  selector: 'app-user-booking-card', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-booking-card.component.html',
  styleUrls: ['./user-booking-card.component.css']
})
export class UserBookingCardComponent {
  @Input() booking!: BookingDto;
  
  // Event emitterek a szülő komponensnek
  @Output() onExtend = new EventEmitter<BookingDto>();
  @Output() onCancel = new EventEmitter<BookingDto>();
  @Output() onViewDetails = new EventEmitter<BookingDto>();

  isExtending = false;

  constructor(private router: Router) {}

  /**
   * Státusz címkék magyar fordítása
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Aktív',
      'CONFIRMED': 'Visszaigazolva',
      'PENDING': 'Fizetésre vár',
      'COMPLETED': 'Befejezett',
      'CANCELLED': 'Lemondva',
      'EXPIRED': 'Lejárt'
    };
    return labels[status] || status;
  }

  /**
   * Ellenőrzi, hogy lehet-e még lemondani a foglalást
   * Szabály: Minimum 1 órával a kezdés előtt
   */
  canCancel(booking: BookingDto): boolean {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Csak aktív foglalást lehet lemondani és legalább 1 órával korábban
    return booking.status === 'ACTIVE' && hoursDiff >= 1;
  }

  /**
   * Ellenőrzi, hogy lehet-e még hosszabbítani
   */
  canExtend(booking: BookingDto): boolean {
    const now = new Date();
    const endTime = new Date(booking.endTime);
    
    return booking.status === 'ACTIVE' && endTime > now;
  }

 
  extendBooking(booking: BookingDto): void {
  console.group('🔍 extendBooking Debug');
  console.log('Booking objektum:', booking);
  console.log('Booking ID:', booking.id);
  console.log('Booking status:', booking.status);
  console.log('Booking endTime:', booking.endTime);
  console.log('Router elérhető?', !!this.router);
  console.groupEnd();

  // Ellenőrzések
  if (!booking) {
    console.error('❌ Booking objektum hiányzik!');
    alert('Hiba: Foglalás adatok hiányoznak');
    return;
  }

  if (!booking.id) {
    console.error('❌ Booking ID hiányzik!');
    alert('Hiba: Foglalás azonosító hiányzik');
    return;
  }

  if (!this.canExtend(booking)) {
    console.warn(' Nem hosszabbítható');
    alert('Ez a foglalás már nem hosszabbítható.');
    return;
  }

  // Navigáció
  console.log(' Navigálás indítása:', `/extend-booking/${booking.id}`);
  
  this.router.navigate(['/extend-booking', booking.id])
    .then(result => {
      console.log(' Navigálás eredmény:', result);
    })
    .catch(error => {
      console.error(' Navigálás hiba:', error);
      alert('Navigálási hiba: ' + error);
    });
}

  
  cancelBooking(booking: BookingDto): void {
    if (!this.canCancel(booking)) {
      alert('Ezt a foglalást már nem lehet lemondani. (Minimum 1 órával a kezdés előtt lehetséges)');
      return;
    }

    const confirmMsg = `Biztosan lemondod ezt a foglalást?\n\nParkoló: ${booking.parkingSpotName}\nKezdés: ${new Date(booking.startTime).toLocaleString('hu-HU')}\n\nA lemondás után visszatérítést kapsz.`;
    
    if (confirm(confirmMsg)) {
      this.onCancel.emit(booking);
    }
  }

  /**
   * Részletek megtekintése
   */
  viewDetails(booking: BookingDto): void {
    this.onViewDetails.emit(booking);
    
    
  }


  getRemainingTime(booking: BookingDto): string {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (now < startTime) {
      const diff = startTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Kezdésig: ${hours}ó ${minutes}p`;
    } else if (now >= startTime && now <= endTime) {
      // Folyamatban van
      const diff = endTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Hátralévő idő: ${hours}ó ${minutes}p`;
    } else {
      // Lejárt
      return 'Lejárt';
    }
  }

 
  copyAccessCode(): void {
    if (this.booking.accessCode) {
      navigator.clipboard.writeText(this.booking.accessCode).then(() => {
        alert('Belépési kód vágólapra másolva: ' + this.booking.accessCode);
      }).catch(err => {
        console.error('Másolás sikertelen:', err);
      });
    }
  }
}