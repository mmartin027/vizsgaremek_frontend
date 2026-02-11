import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripePromise: Promise<Stripe | null>;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;


  private publishableKey = 'pk_test_51...'; // A Stripe Dashboard-ról

  private apiUrl = 'http://localhost:8080/api/checkout'; // Backend URL

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe(this.publishableKey);
  }

  /**
   * Stripe inicializálása
   */
  async initializeStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }

  /**
   * Card Element létrehozása
   */
  async createCardElement(elementId: string): Promise<StripeCardElement | null> {
    const stripe = await this.initializeStripe();
    if (!stripe) return null;

    this.elements = stripe.elements();
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });

    this.cardElement.mount(`#${elementId}`);
    return this.cardElement;
  }

  /**
   * Payment Intent létrehozása a backend-en
   */
  createPaymentIntent(amount: number, currency: string = 'huf'): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-payment-intent`, {
      amount,
      currency
    });
  }

  /**
   * Fizetés megerősítése
   */
  async confirmCardPayment(clientSecret: string): Promise<any> {
    const stripe = await this.initializeStripe();
    if (!stripe || !this.cardElement) {
      throw new Error('Stripe nincs inicializálva');
    }

    return stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement
      }
    });
  }


  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }
}