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


register(userData: any): Observable<string> {
  
  return this.http.post(`${this.authUrl}/register`, userData, { responseType: 'text' })
    .pipe(catchError(this.handleError));
}

 
login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(res => {
          // JAVÍTÁS: Most már accessToken-t és refreshToken-t kapunk a Javaból!
          if (res && res.accessToken && res.refreshToken) {
            localStorage.setItem('token', res.accessToken); // A régi megszokott néven mentjük az Access Tokent
            localStorage.setItem('refreshToken', res.refreshToken); // Új: Elrejtjük a személyit is!
            console.log('Sikeres bejelentkezés! Tokenek elmentve.');
          }
        }),
        catchError(this.handleError)
      );
  }

  // ÚJ METÓDUS: A néma frissítés hívása
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.authUrl}/refreshtoken`, { refreshToken }).pipe(
      tap(res => {
        if (res && res.accessToken) {
           // Kicseréljük a régi Access Tokent a vadonatújra
          localStorage.setItem('token', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          console.log('Néma frissítés sikeres! Új kulcs a zsebben.');
        }
      })
    );
  }

  // JAVÍTÁS: Kijelentkezéskor mindkét tokent a kukába dobjuk!
  logout(): void { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('refreshToken'); 
  }
  // --- JELSZÓ VISSZAÁLLÍTÁS ---
  verifyEmail(email: string): Observable<any> {
    return this.http.post(`${this.forgotUrl}/verifyMail/${email}`, {})
      .pipe(catchError(this.handleError));
  }

  verifyOtp(otp: number, email: string): Observable<any> {
    return this.http.post(`${this.forgotUrl}/verifyOtp/${otp}/${email}`, {})
      .pipe(catchError(this.handleError));
  }

  changePassword(email: string, passwordData: any): Observable<any> {
    return this.http.post(`${this.forgotUrl}/changePassword/${email}`, passwordData)
      .pipe(catchError(this.handleError));
  }

  // --- TOKEN KEZELÉS ---
// auth.service.ts

private decodeToken(rawToken: string): any {
  try {
    // 1. MEGTISZTÍTÁS: Eltávolítjuk a felesleges idézőjeleket és szóközöket!
    const cleanToken = rawToken.replace(/['"]+/g, '').trim();

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('A token nem 3 részből áll. Eredeti érték:', rawToken);
      return null;
    }

    let payload = parts[1];
    
    // 2. URL karakterek cseréje
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // 3. Biztonságos kiegészítés (padding)
    while (payload.length % 4 !== 0) {
      payload += '=';
    }

    // 4. Dekódolás
    const decodedPayload = atob(payload);
    
    // 5. UTF-8 (ékezetes) karakterek biztonságos visszafejtése
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

// auth.service.ts

getCurrentUserId(): number | null {
  const token = localStorage.getItem('token');
  
  // 1. TESZT: Mit lát az Angular a tárolóban?
  console.log('--- JWT DEBUG START ---');
  console.log('1. A localStorage-ból kiolvasott token:', token);

  // Ha nincs token, vagy az a bizonyos [object Object] hiba van benne
  if (!token || token.includes('object Object')) {
    console.error('2. HIBA: A token hiányzik, vagy hibás formátumban lett elmentve!');
    return null;
  }

  try {
    // 3. Tisztítás: levágjuk az esetleges idézőjeleket
    const cleanToken = token.replace(/['"]+/g, '').trim();
    const payloadStr = cleanToken.split('.')[1];
    
    if (!payloadStr) {
       console.error('2. HIBA: A token nem tartalmaz payload részt (nincs pont benne).');
       return null;
    }

    // 4. Biztonságos dekódolás (Base64 URL -> Base64 + Padding)
    let base64 = payloadStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const decodedPayload = atob(base64);
    const jsonString = decodeURIComponent(
      decodedPayload.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );

    const decoded = JSON.parse(jsonString);
    console.log('2. SIKER: A dekódolt token tartalma:', decoded);

    // 5. UserId kinyerése
    if (decoded && decoded.userId !== undefined) {
      console.log('3. SIKER: Kinyert userId:', decoded.userId);
      console.log('--- JWT DEBUG END ---');
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
    // A Spring Security 'sub' mezőbe teszi a nevet
    return decoded?.sub || null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

 
// Ez visszaadja a tokenben lévő adatokat (dekódolja a középső részét)
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

  // Ellenőrzi, hogy a felhasználó admin-e
isAdmin(): boolean {
    const tokenPayload = this.getDecodedToken();
    console.log('1. A token teljes tartalma:', tokenPayload); // <--- Ezt figyeljük!
    
    if (!tokenPayload) return false;

    // Megpróbáljuk megkeresni a jogokat (lehet roles, authorities, vagy role néven is)
    const roles = tokenPayload.roles || tokenPayload.authorities || tokenPayload.role || [];
    console.log('2. A talált jogok:', roles); // <--- Ezt is figyeljük!
    
    // Itt dől el az igazság:
    const isUserAdmin = roles.includes('ROLE_ADMIN');
    console.log('3. Eredmény (Admin-e?):', isUserAdmin);
    
    return isUserAdmin; 
  }
  isLoggedIn(): boolean { 
    return !!this.getToken(); 
  }

  

  private handleError(error: HttpErrorResponse) {
    console.error('HTTP hiba:', error);
    let errorMessage = error.error?.message || error.error || 'Hiba történt!';
    return throwError(() => ({ status: error.status, message: errorMessage }));
  }
}