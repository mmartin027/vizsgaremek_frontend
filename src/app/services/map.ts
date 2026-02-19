import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly apiKey = '7Mo9PlVhPKdZGr1FvyYI'; 
  private readonly styleId = '019c7697-f4e7-7b81-bae6-80e826a9696a';
  private readonly API_URL = 'http://localhost:8080/api/parking-spots';

  constructor(private http: HttpClient) {}

  getMapStyleUrl(): string {
    return `https://api.maptiler.com/maps/${this.styleId}/style.json?key=${this.apiKey}`;
  }

  getParkingZones(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/map-zones`);
  }
}