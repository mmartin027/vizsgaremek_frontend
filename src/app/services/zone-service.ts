import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  // A backend végpontod, amit az előbb csináltunk a Controllerben
  private readonly API_URL = 'http://localhost:8080/api/zones';

  constructor(private http: HttpClient) {}

  getZoneByMapId(mapId: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/map/${mapId}`);
  }

  // Ha esetleg az összes zónát le akarod kérni egy listához
  getAllZones(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }
}