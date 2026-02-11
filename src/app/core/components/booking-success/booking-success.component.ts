import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../../services/booking.service';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-container">
      <div *ngIf="isLoading" class="loading">
        <h2>⏳ Foglalás létrehozása...</h2>
        <p>Kérjük várjon...</p>
      </div>
      
      <div *ngIf="!isLoading && accessCode" class="success">
        <h2>✅ Sikeres foglalás!</h2>
        <p>Hozzáférési kód: <strong>{{ accessCode }}</strong></p>
        <p>Átirányítás...</p>
      </div>
      
      <div *ngIf="error" class="error">
        <h2>❌ Hiba történt</h2>
        <p>{{ error }}</p>
        <button (click)="goHome()">Vissza a főoldalra</button>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      max-width: 600px;
      margin: 50px auto;
      padding: 30px;
      text-align: center;
    }
    .error { color: red; }
    .success { color: green; }
  `]
})
export class BookingSuccessComponent implements OnInit {
  isLoading = true;
  accessCode = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  async ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    
    if (!sessionId) {
      this.error = 'Hiányzó session ID';
      this.isLoading = false;
      return;
    }

    try {
      const result = await this.bookingService.confirmBooking(sessionId).toPromise();
      
      if (result.success) {
        this.accessCode = result.accessCode;
        this.isLoading = false;
        
        // 3 másodperc múlva átirányítás
        setTimeout(() => {
          this.router.navigate(['/booking-confirmation', this.accessCode]);
        }, 3000);
      } else {
        this.error = 'Foglalás létrehozása sikertelen';
        this.isLoading = false;
      }
    } catch (err: any) {
      this.error = err.error?.error || 'Ismeretlen hiba történt';
      this.isLoading = false;
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}