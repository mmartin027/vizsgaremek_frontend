import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // 1. EZ KELL!
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
        <p>A fizetés rendben lezajlott, a foglalást rögzítettük.</p>
        <button (click)="goHome()">Vissza a főoldalra</button>
      </div>
      
      <div *ngIf="error" class="error">
        <h2>❌ Hiba történt</h2>
        <p>{{ error }}</p>
        <button (click)="goHome()">Vissza a főoldalra</button>
      </div>
    </div>
  `,
  styles: [`
    .success-container { max-width: 600px; margin: 50px auto; padding: 30px; text-align: center; border: 1px solid #ddd; border-radius: 8px; }
    .error { color: red; }
    .success { color: green; }
    button { margin-top: 20px; padding: 10px 20px; cursor: pointer; }
  `]
})
export class BookingSuccessComponent implements OnInit {
  isLoading = true;
  accessCode = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private http: HttpClient 
  ) {}

  ngOnInit() { 
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (sessionId) {
      // Itt hívjuk meg a backendet
      this.http.post<any>(`http://localhost:8080/api/booking/confirm-booking?sessionId=${sessionId}`, {})
        .subscribe({
          next: (res) => {
            console.log('Backend válasz:', res);
            this.accessCode = res.accessCode; 
            this.isLoading = false;
            
        
          },
          error: (err) => {
            console.error('Hiba a confirm-booking során:', err);
            this.error = 'A fizetés sikerült, de a foglalást nem tudtuk rögzíteni. Kérjük, vegye fel a kapcsolatot az ügyfélszolgálattal!';
            this.isLoading = false;
          }
        });
    } else {
      this.error = 'Nem található érvényes fizetési azonosító.';
      this.isLoading = false;
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}