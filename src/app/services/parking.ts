import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingSpotDto } from '../shared/components/card/card.component';

@Injectable({
  providedIn: 'root' 
})
export class ParkingService {
  
  private apiUrl = 'http://localhost:8080/api/parking-spots'; 

  constructor(private http: HttpClient) {}

  searchByCity(cityId: number): Observable<ParkingSpotDto[]> {
    return this.http.get<ParkingSpotDto[]>(`${this.apiUrl}/search?cityId=${cityId}`);
  }

  // 1. JAVÍTÁS: A getById most már elfogad számot (id) és szöveget (uuid) is!
  // Így a korábbi kódjaid sem romlanak el, amik számot küldenek be.
  getById(id: number | string): Observable<ParkingSpotDto> {
    return this.http.get<ParkingSpotDto>(`${this.apiUrl}/${id}`);
  }

  // 2. ÚJ METÓDUS: Ezt hívtuk meg a map-component.component.ts fájlban a térkép kattintásakor.
  // Technikailag ugyanazt csinálja, mint a fenti, csak kifejezőbb a neve.
  getSpot(identifier: string): Observable<ParkingSpotDto> {
    return this.http.get<ParkingSpotDto>(`${this.apiUrl}/${identifier}`);
  }

}