import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly CHECKOUT_URL = `${environment.apiUrl}/checkout`;
  private readonly BOOKING_URL = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  
   
  createCheckoutSession(spotId: number, bookingData: any): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/create-session`, 
      bookingData, 
      { params: { parkingSpotId: spotId.toString() } }
    );
  }

  
  createExtensionSession(bookingId: number, additionalMinutes: number): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/create-extension-session`,
      null,
      { 
        params: { 
          bookingId: bookingId.toString(),
          additionalMinutes: additionalMinutes.toString()
        } 
      }
    );
  }


  startOnDemandParking(parkingData: any): Observable<any> {
    return this.http.post(`${this.BOOKING_URL}/start`, parkingData); 
  }

  stopOnDemandParking(bookingId: number): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.CHECKOUT_URL}/stop-session?bookingId=${bookingId}`, {});
  }
  stopAndPayOnDemandParking(bookingId: number) {
    return this.http.post(`${environment.apiUrl}/checkout/stop-session?bookingId=${bookingId}`, {});
  }

  getBookingById(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.BOOKING_URL}/${bookingId}`);
  }

  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BOOKING_URL}/user/${userId}`);
  }


  createSubscriptionSession(spotId: number, subscriptionType: string, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/create-subscription-session`,
      data,
      { params: { parkingSpotId: spotId.toString(), subscriptionType } }
    );
}

 cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete(`${this.BOOKING_URL}/${bookingId}`, { responseType: 'text' });
}

  confirmPayment(sessionId: string): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/confirm-payment`, 
      null, 
      { params: { sessionId: sessionId } }
    );
  }
}