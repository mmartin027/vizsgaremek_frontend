import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StripeService } from '../../../services/stripe.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  @Input() bookingDto: any; 
  @Input() parkingSpotId!: number;

  isProcessing = false;
  errorMessage = '';

  constructor(
    private stripeService: StripeService,
    private router: Router
  ) {}

  ngOnInit() {
    
  }

  async handlePayment() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      console.log('Fizetés indítása...');

      
      const response: any = await this.stripeService
        .createSession(this.parkingSpotId, this.bookingDto)
        .toPromise();

      console.log('Session ID:', response.sessionId);

      
      await this.stripeService.redirectToCheckout(response.sessionId);

    } catch (error: any) {
      console.error('Fizetési hiba:', error);
      this.errorMessage = error.message || 'Hiba történt a fizetés során';
      this.isProcessing = false;
    }
  }
}