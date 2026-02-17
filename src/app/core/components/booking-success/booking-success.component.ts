import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-success.component.html',
  styleUrls: ['./booking-success.component.css']
})
export class BookingSuccessComponent implements OnInit {
  isLoading = true;
  accessCode = '';
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
        next: (res) => {
          console.log('Backend válasz:', res);
          this.accessCode = res.accessCode; 
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Hiba a confirm-payment során:', err);
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
    this.router.navigate(['/']);  // 👈 Főoldalra navigálás
  }
}