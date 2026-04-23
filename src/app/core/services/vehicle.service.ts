import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';


@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  
private url = `${environment.apiUrl}/vehicles`;

    constructor(private http: HttpClient) {}

    getMyVehicles(): Observable<any[]> {
        return this.http.get<any[]>(this.url);
    }

    getDefaultVehicle(): Observable<any> {
        return this.http.get<any>(`${this.url}/default`);
    }

    addVehicle(vehicle: any): Observable<any> {
        return this.http.post(this.url, vehicle);
    }

    setDefault(id: number): Observable<any> {
        return this.http.put(`${this.url}/${id}/default`, {});
    }

    deleteVehicle(id: number): Observable<any> {
        return this.http.delete(`${this.url}/${id}`);
    }

}
