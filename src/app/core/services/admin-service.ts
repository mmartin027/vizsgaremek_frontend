import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  // --- FELHASZNÁLÓK ---
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`); 
  }

  // --- PARKOLÓK ---
  getAllParkingSpots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/parking-spots`);
  }

  addParkingSpot(spotData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/parking-spots`, spotData);
  }

  deleteParkingSpot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/parking-spots/${id}`, { responseType: 'text' });
  }

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings`);
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${id}`, { responseType: 'text' });
  }

// --- ZÓNÁK (ZONES) VÉGPONTOK ---

  getAllZones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/zones`); 
  }

  addZone(zone: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/zones`, zone);
  }

  deleteZone(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/zones/${id}`);
  }

}