import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingSpotDto } from '../../shared/components/card/card.component';
import { environment } from '../enviroment';


@Injectable({
  providedIn: 'root' 
})
export class ParkingService {
  
  private apiUrl = `${environment.apiUrl}/parking-spots`; 

  constructor(private http: HttpClient) {}

  searchByCity(cityId: number): Observable<ParkingSpotDto[]> {
    return this.http.get<ParkingSpotDto[]>(`${this.apiUrl}/search?cityId=${cityId}`);
  }

  searchByCityName(cityName: string): Observable<ParkingSpotDto[]> {
    return this.http.get<ParkingSpotDto[]>(`${this.apiUrl}/search?cityName=${cityName}`);
}

  getById(id: number | string): Observable<ParkingSpotDto> {
    return this.http.get<ParkingSpotDto>(`${this.apiUrl}/${id}`);
  }

  
  getSpot(identifier: string): Observable<ParkingSpotDto> {
    return this.http.get<ParkingSpotDto>(`${this.apiUrl}/${identifier}`);
  }

}