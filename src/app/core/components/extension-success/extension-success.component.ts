import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-extension-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div *ngIf="isLoading">
        <div class="spinner"></div>
        <h2>Hosszabbítás feldolgozása...</h2>
      </div>
      
      <div *ngIf="!isLoading && booking">
        <div class="icon"></div>
        <h2>Sikeres hosszabbítás!</h2>
        <p>Új befejezés: {{ booking.endTime | date:'yyyy. MM. dd. HH:mm' }}</p>
        <p>Összesen: {{ booking.hours }} óra</p>
        <p>Új végösszeg: {{ booking.totalPrice | number }} Ft</p>
        <button (click)="goToBookings()">Vissza a foglalásokhoz</button>
      </div>
      
      <div *ngIf="error">
        <div class="icon">❌</div>
        <h2>Hiba</h2>
        <p>{{ error }}</p>
        <button (click)="goToBookings()">Vissza</button>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 80px auto; padding: 40px; text-align: center; }
    .spinner { width: 50px; height: 50px; border: 4px solid #f3f4f6; border-top-color: #3b82f6; 
                border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .icon { font-size: 80px; margin: 20px; }
    button { margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; 
             border: none; border-radius: 8px; cursor: pointer; }
  `]
})
export class ExtensionSuccessComponent implements OnInit {
  isLoading = true;
  booking: any = null;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    
    if (sessionId) {
      this.http.post<any>(
        `http://localhost:8080/api/checkout/confirm-payment?sessionId=${sessionId}`,
        {}
      ).subscribe({
        next: (response) => {
          this.booking = response.booking;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Hiba történt';
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'Hiányzó session ID';
      this.isLoading = false;
    }
  }

  goToBookings() {
    this.router.navigate(['/foglalasaim']);
  }
}