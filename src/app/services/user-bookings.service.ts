import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserBookingsService {
  private readonly URL = 'http://localhost:8080/api/bookings/user/';

  constructor(private http: HttpClient) {}

  getBookingsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}${userId}`);
  }
}