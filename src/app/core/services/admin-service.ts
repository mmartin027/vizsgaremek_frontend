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

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`); 
  }

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

  getAllZones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/zones`); 
  }

  addZone(zone: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/zones`, zone);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, { responseType: 'text' });
  }

  updateSpotFeatures(spotId: number, features: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/parking-spots/${spotId}/features`, { features });
  }

  updateZoneFeatures(zoneId: number, features: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/zones/${zoneId}/features`, { features });
  }

deleteZone(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/zones/${id}`, { responseType: 'text' });
}

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role: role }, { responseType: 'text' });
  }


  uploadSpotImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/parking-spots/${id}/image`, formData);
  }

  uploadZoneImage(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/zones/${id}/image`, formData);
  }
updateSpotPrice(id: number, price: number) {
  return this.http.put(`${this.apiUrl}/parking-spots/${id}/price?price=${price}`, {});
}

updateZonePrice(id: number, price: number) {
  return this.http.put(`${this.apiUrl}/zones/${id}/price?price=${price}`, {});
}
}