import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly API_URL = `${environment.apiUrl}/parking-spots`;

  private mapInstance = new BehaviorSubject<any>(null);
  map$ = this.mapInstance.asObservable();

  constructor(private http: HttpClient) {}

  setMap(map: any) {
    this.mapInstance.next(map);
  }

  getMapStyleUrl(): string {
    return `https://api.maptiler.com/maps/019c869e-0278-7241-83fb-fe4c10f27310/style.json?key=7Mo9PlVhPKdZGr1FvyYI`;
  }

  getMapData(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/parking-spots/map-zones`);
  }
}