import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Két különböző alap URL a backend vezérlőihez
  private authUrl = "http://localhost:8080/api/auth";
  private forgotUrl = "http://localhost:8080/forgotPassword";

  constructor(private http: HttpClient) {}

  // --- ALAP FUNKCIÓK ---
  register(userData: any): Observable<string> {
    return this.http.post(`${this.authUrl}/register`, userData, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  login(credentials: any): Observable<string> {
    return this.http.post(`${this.authUrl}/login`, credentials, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // --- JELSZÓ VISSZAÁLLÍTÁS (Ezek hiányoztak!) ---

  verifyEmail(email: string): Observable<string> {
    return this.http.post(`${this.forgotUrl}/verifyMail/${email}`, {}, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  verifyOtp(otp: number, email: string): Observable<string> {
    return this.http.post(`${this.forgotUrl}/verifyOtp/${otp}/${email}`, {}, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  changePassword(email: string, passwordData: any): Observable<string> {
    return this.http.post(`${this.forgotUrl}/changePassword/${email}`, passwordData, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // --- SEGÉDFUNKCIÓK ---
  private handleError(error: HttpErrorResponse) {
    console.error('HTTP hiba:', error);
    let errorMessage = error.error || 'Hiba történt!';
    return throwError(() => ({ status: error.status, message: errorMessage }));
  }

  logout(): void { localStorage.removeItem('token'); }
  isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
}