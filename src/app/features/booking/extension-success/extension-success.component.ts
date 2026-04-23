import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/enviroment';

@Component({
  selector: 'app-extension-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extension-success.component.html',
  styleUrls: ['./extension-success.component.css']
})
export class ExtensionSuccessComponent implements OnInit {
  isLoading = true;
  booking: any = null;
  error = '';
  
  fallbackDate: Date = new Date();
  isSuccess = false; 
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
        next: (response) => {
          
          const data = response.booking ? response.booking : response;

          this.booking = {
             endTime: data.endTime || data.newEndTime || new Date(),
             hours: data.hours || data.extendedHours || data.duration || 0, 
             totalPrice: data.totalPrice || data.amount || data.price || 0
          };
          
          this.isSuccess = true;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Hiba történt a fizetés megerősítésekor.';
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'Hiányzó fizetési azonosító (session ID).';
      this.isLoading = false;
    }
  }

  goToBookings() {
    this.router.navigate(['/foglalasaim']);
  }
}