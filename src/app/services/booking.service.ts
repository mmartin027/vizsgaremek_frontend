import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly CHECKOUT_URL = 'http://localhost:8080/api/checkout';
  private readonly BOOKING_URL = 'http://localhost:8080/api/booking'; 

  constructor(private http: HttpClient) {}

 
  createCheckoutSession(spotId: number, bookingData: any): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/create-session`, 
      bookingData, 
      { params: { parkingSpotId: spotId.toString() } }
    );
  }

  
  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BOOKING_URL}/user/${userId}`);
  }


  confirmPayment(sessionId: string): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/confirm-payment`, 
      null, 
      { params: { sessionId: sessionId } }
    );
  }
}