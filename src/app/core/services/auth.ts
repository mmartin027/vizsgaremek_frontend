import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.apiUrl}/auth`;
  private forgotUrl = `${environment.apiUrl.replace('/api', '')}/forgotPassword`;

  constructor(private http: HttpClient) {}


register(userData: any): Observable<string> {
  
  return this.http.post(`${this.authUrl}/register`, userData, { responseType: 'text' })
    .pipe(catchError(this.handleError));
}

 
login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(res => {
          
          if (res && res.accessToken && res.refreshToken) {
            localStorage.setItem('token', res.accessToken); 
            localStorage.setItem('refreshToken', res.refreshToken); 
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.authUrl}/refreshtoken`, { refreshToken }).pipe(
      tap(res => {
        if (res && res.accessToken) {

          localStorage.setItem('token', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          console.log('Néma frissítés sikeres! Új kulcs a zsebben.');
        }
      })
    );
  }

  logout(): void { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('refreshToken'); 
  }
verifyEmail(email: string): Observable<any> {
    return this.http.post(`${this.forgotUrl}/verifyMail/${email}`, {}, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  verifyOtp(otp: number, email: string): Observable<any> {
    return this.http.post(`${this.forgotUrl}/verifyOtp/${otp}/${email}`, {}, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  changePassword(email: string, passwordData: any): Observable<any> {
    return this.http.post(`${this.forgotUrl}/changePassword/${email}`, passwordData, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }



private decodeToken(rawToken: string): any {
  try {
    const cleanToken = rawToken.replace(/['"]+/g, '').trim();

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('A token nem 3 részből áll. Eredeti érték:', rawToken);
      return null;
    }

    let payload = parts[1];
    
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    while (payload.length % 4 !== 0) {
      payload += '=';
    }

    const decodedPayload = atob(payload);
    
    const jsonString = decodeURIComponent(
      decodedPayload.split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonString);

  } catch (error) {
    console.error('Kritikus hiba a token visszafejtésekor:', error);
    return null;
  }
}

getCurrentUserId(): number | null {
  const token = localStorage.getItem('token');
  


  if (!token || token.includes('object Object')) {
    return null;
  }

  try {
    const cleanToken = token.replace(/['"]+/g, '').trim();
    const payloadStr = cleanToken.split('.')[1];
    
    if (!payloadStr) {
       return null;
    }

    let base64 = payloadStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const decodedPayload = atob(base64);
    const jsonString = decodeURIComponent(
      decodedPayload.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );

    const decoded = JSON.parse(jsonString);

    if (decoded && decoded.userId !== undefined) {
  
      return Number(decoded.userId);
    } else {
      console.error('3. HIBA: A dekódolt tokenben NINCS userId mező!');
      return null;
    }

  } catch (error) {
    console.error('2. HIBA: A dekódolás elszállt (atob/JSON parse hiba):', error);
    return null;
  }
}
  getCurrentUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    const decoded = this.decodeToken(token);
    return decoded?.sub || null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

 
  getDecodedToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

isAdmin(): boolean {
    const tokenPayload = this.getDecodedToken();
    
    if (!tokenPayload) return false;

    const roles = tokenPayload.roles || tokenPayload.authorities || tokenPayload.role || [];
    
    const isUserAdmin = roles.includes('ROLE_ADMIN');
    
    return isUserAdmin; 
  }
  isLoggedIn(): boolean { 
    return !!this.getToken(); 
  }
  verifyRegistrationOtp(email: string, otp: number): Observable<string> {
    return this.http.post(`${this.authUrl}/verify-registration/${email}/${otp}`, {}, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }
  

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP hiba:', error);
    let errorMessage = error.error?.message || error.error || 'Hiba történt!';
    return throwError(() => ({ status: error.status, message: errorMessage }));
  }
}