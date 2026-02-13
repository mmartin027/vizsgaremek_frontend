import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripeService {
  // TESZT KULCS - Ez biztonságos fejlesztéshez
  private publishableKey = 'pk_test_51NWggiClixj4Na1JdOrd3mjgHWJimk2iLVbOeGFGaAUzKVRldWlJswtVZdplozOTAZ6iIHvKlkb7JwdumpEqZq1w00pmONHoaS';

  constructor(private http: HttpClient) {}

  /**
   * 1. Lépés: Session létrehozása a backend-en
   */
  createSession(spotId: number, payload: any): Observable<any> {
    // A parkingSpotId-t URL paraméterként várja a Java kontrollered (@RequestParam)
    return this.http.post(`http://localhost:8080/api/checkout/create-session?parkingSpotId=${spotId}`, payload);
  }

  
  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await loadStripe(this.publishableKey);
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe redirect hiba:', error.message);
        throw new Error(error.message);
      }
    } else {
      throw new Error('Stripe JS nem tölthető be!');
    }
  }
}