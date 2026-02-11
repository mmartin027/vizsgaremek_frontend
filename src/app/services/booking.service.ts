import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly API_URL = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  create(spotId: number, data: any): Observable<string> {
    return this.http.post(`${this.API_URL}/parkingspot/${spotId}`, data, { responseType: 'text' });
  }


confirmBooking(sessionId: string) {
  return this.http.post<any>(
    `${this.API_URL}/booking/confirm-booking`,
    null,
    { params: { sessionId } }
  );
}
  
}