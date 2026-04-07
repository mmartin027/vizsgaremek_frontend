import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private readonly API_URL = `${environment.apiUrl}0/zones`;

  constructor(private http: HttpClient) {}

  getZoneByMapId(mapId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/map/${mapId}`);
  }

  getAllZones(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }
}