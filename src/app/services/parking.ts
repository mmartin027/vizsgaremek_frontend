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

getById(id: number): Observable<ParkingSpotDto> {
    return this.http.get<ParkingSpotDto>(`${this.apiUrl}/${id}`);
  }

  }