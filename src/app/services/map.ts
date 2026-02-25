import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly apiKey = '7Mo9PlVhPKdZGr1FvyYI'; 
  private readonly API_URL = 'http://localhost:8080/api/parking-spots';

  private mapInstance = new BehaviorSubject<any>(null);
  map$ = this.mapInstance.asObservable();

  constructor(private http: HttpClient) {}

  setMap(map: any) {
    this.mapInstance.next(map);
  }

  getMapStyleUrl(): string {
    return `https://api.maptiler.com/maps/019c869e-0278-7241-83fb-fe4c10f27310/style.json?key=${this.apiKey}`;
  }

  getParkingZones(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/map-zones`);
  }
}