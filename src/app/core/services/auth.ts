import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
      .pipe(
        tap(token => {
          if (token) {
            localStorage.setItem('token', token);
            console.log(' Token saved');
          }
        }),
        catchError(this.handleError)
      );
  }

  // --- JELSZÓ VISSZAÁLLÍTÁS ---
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

  // --- JWT TOKEN KEZELÉS (ÚJ) ---
  
  /**
   * JWT token dekódolása
   */
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Token dekódolási hiba:', error);
      return null;
    }
  }

  /**
   * Bejelentkezett felhasználó ID-ja
   */
  getCurrentUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = this.decodeToken(token);
    if (!decoded) return null;
    
    // userId mező a JWT-ből
    const userIdValue = decoded.userId;
    
    if (userIdValue === null || userIdValue === undefined) {
      return null;
    }
    
    // Ha string, konvertáld számmá
    const userId = typeof userIdValue === 'string' 
      ? parseInt(userIdValue, 10) 
      : userIdValue;
    
    return isNaN(userId) ? null : userId;
  }

  /**
   * Felhasználónév lekérése
   */
  getCurrentUsername(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = this.decodeToken(token);
    return decoded?.sub || decoded?.username || null;
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // --- SEGÉDFUNKCIÓK ---
  private handleError(error: HttpErrorResponse) {
    console.error('HTTP hiba:', error);
    let errorMessage = error.error || 'Hiba történt!';
    return throwError(() => ({ status: error.status, message: errorMessage }));
  }

  logout(): void { 
    localStorage.removeItem('token'); 
  }

  isLoggedIn(): boolean { 
    return !!localStorage.getItem('token'); 
  }
}