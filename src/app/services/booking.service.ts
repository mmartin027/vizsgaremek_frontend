import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly CHECKOUT_URL = 'http://localhost:8080/api/checkout';
  private readonly BOOKING_URL = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  /**
   * Stripe Checkout Session létrehozása foglaláshoz
   */
  createCheckoutSession(spotId: number, bookingData: any): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/create-session`, 
      bookingData, 
      { params: { parkingSpotId: spotId.toString() } }
    );
  }

  /**
   *  ÚJ: Stripe Checkout Session létrehozása HOSSZABBÍTÁSHOZ
   */
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

  getBookingById(bookingId: number): Observable<any> {
    return this.http.get<any>(`${this.BOOKING_URL}/${bookingId}`);
  }

  getUserBookings(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BOOKING_URL}/user/${userId}`);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.http.delete<any>(`${this.BOOKING_URL}/${bookingId}`);
  }

  confirmPayment(sessionId: string): Observable<any> {
    return this.http.post<any>(
      `${this.CHECKOUT_URL}/confirm-payment`, 
      null, 
      { params: { sessionId: sessionId } }
    );
  }
}