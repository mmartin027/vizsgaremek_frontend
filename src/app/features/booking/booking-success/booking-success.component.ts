import { Component, OnInit, OnDestroy } from '@angular/core'; // <-- OnDestroy import hozzáadva
import { ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/enviroment';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-success.component.html',
  styleUrls: ['./booking-success.component.css']
})
export class BookingSuccessComponent implements OnInit, OnDestroy { 
  isLoading = true;
  accessCode = '';
  error = '';
  countdown = 10;
  private timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,      
    private http: HttpClient 
  ) {}

  ngOnInit() { 
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (sessionId) {
      this.http.post<any>(
        `${environment.apiUrl}/checkout/confirm-payment?sessionId=${sessionId}`, 
        {}
      ).subscribe({
        next: (res) => {
          console.log('Backend válasz:', res);
          this.accessCode = res.accessCode; 
          this.isLoading = false;
          
          this.startCountdown();
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

  startCountdown() {
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.goHome();
      }
    }, 1000);
  }

  goHome() {
    if (this.timer) {
      clearInterval(this.timer); 
    }
    this.router.navigate(['/foglalasaim']);  
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}