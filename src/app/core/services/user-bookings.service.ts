import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroment';

@Injectable({ providedIn: 'root' })
export class UserBookingsService {
  private readonly URL = `${environment.apiUrl}/bookings/user/`;

  constructor(private http: HttpClient) {}

  getBookingsByUserId(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.URL}${userId}`);
  }
}