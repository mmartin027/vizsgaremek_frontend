import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private publishableKey = 'pk_test_51NWggiClixj4Na1JdOrd3mjgHWJimk2iLVbOeGFGaAUzKVRldWlJswtVZdplozOTAZ6iIHvKlkb7JwdumpEqZq1w00pmONHoaS';

  constructor(private http: HttpClient) {}

  createSession(spotId: number, payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/checkout/create-session?parkingSpotId=${spotId}`, payload);
  }

  async redirectToCheckout(sessionId: string, checkoutUrl?: string): Promise<void> {
    console.log('Átirányítás indítása...', { sessionId, checkoutUrl });

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

   
    if (sessionId) {
      const stripeCheckoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;
      window.location.href = stripeCheckoutUrl;
    } else {
      console.error('Hiba: Se sessionId, se checkoutUrl nem érkezett!');
    }
  }
}