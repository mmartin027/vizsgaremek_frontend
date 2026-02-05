import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeService } from 'src\app\services\stripe.ts';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {
  @Input() amount: number = 0; 
  @Input() bookingId?: number; 

  isProcessing = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private stripeService: StripeService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      // Stripe card element létrehozása
      await this.stripeService.createCardElement('card-element');
    } catch (error) {
      console.error('Stripe inicializálási hiba:', error);
      this.errorMessage = 'Nem sikerült betölteni a fizetési felületet';
    }
  }

  ngOnDestroy() {
    // Cleanup
    this.stripeService.destroyCardElement();
  }

  async handlePayment() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('💳 Fizetés indítása:', this.amount);

      // 1. Payment Intent létrehozása a backend-en
      const response = await this.stripeService
        .createPaymentIntent(this.amount, 'huf')
        .toPromise();

      console.log('✅ Payment Intent létrehozva:', response.clientSecret);

      const result = await this.stripeService.confirmCardPayment(response.clientSecret);

      if (result.error) {
        console.error('❌ Fizetési hiba:', result.error.message);
        this.errorMessage = result.error.message || 'Fizetési hiba történt';
        this.isProcessing = false;
      } else if (result.paymentIntent?.status === 'succeeded') {
        console.log(' Fizetés sikeres!', result.paymentIntent);
        this.successMessage = 'Fizetés sikeres!';
        
        
        setTimeout(() => {
          this.router.navigate(['/booking-confirmation', this.bookingId]);
        }, 2000);
      }
    } catch (error: any) {
      console.error(' Fizetési hiba:', error);
      this.errorMessage = error.message || 'Hiba történt a fizetés során';
      this.isProcessing = false;
    }
  }
}