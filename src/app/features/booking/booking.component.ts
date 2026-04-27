import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { StripeService } from '../../core/services/stripe.service';
import { BookingService } from '../../core/services/booking.service';
import { ParkingService } from '../../core/services/parking';
import { AuthService } from '../../core/services/auth';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ErrorService } from '../../core/services/error-service';
import { FormErrorComponent } from '../form-error/form-error.component';
import { AlertService } from '../../core/services/alert';
import { VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent,FormErrorComponent],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  spotId!: number;
  selectedSpot?: any;
  isLoading: boolean = false; 
  
  bookingData = {
    licensePlate: '',
    carBrand: '',
    carModel: '',
    carColor: '',
    startTime: '',
    endTime: ''
  };

  @ViewChild('plateCtrl') plateCtrl!: NgModel;
  @ViewChild('brandCtrl') brandCtrl!: NgModel;
  @ViewChild('modelCtrl') modelCtrl!: NgModel;
  @ViewChild('colorCtrl') colorCtrl!: NgModel;

  constructor(
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private bookingService: BookingService, 
    private parkingService: ParkingService,
    private authService: AuthService,
    private router: Router,
    private vehicleService: VehicleService,
    private alertService: AlertService,
    private errorService: ErrorService
  ) {}

notLoggedIn: boolean = false;


  ngOnInit() {
    this.spotId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.authService.isLoggedIn()) {
      this.notLoggedIn = true;
    }
    
    this.parkingService.getById(this.spotId).subscribe({
      next: (spot) => {
        this.selectedSpot = spot;
      },
      error: (err) => console.error('Hiba a betöltéskor:', err)
    });

    if (this.authService.isLoggedIn()) {
      this.vehicleService.getDefaultVehicle().subscribe({
        next: (vehicle: any) => {
          if (vehicle) {
            this.bookingData.licensePlate = vehicle.licensePlate || '';
            this.bookingData.carBrand = vehicle.brand || '';
            this.bookingData.carModel = vehicle.model || '';
            this.bookingData.carColor = vehicle.color || '';
          }
        }
      });
    }
}

  get durationInHours(): number {
    if (!this.bookingData.startTime || !this.bookingData.endTime) return 0;
    const start = new Date(this.bookingData.startTime).getTime();
    const end = new Date(this.bookingData.endTime).getTime();
    const diffMs = end - start;
    return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60)) : 0;
  }

  get totalPrice(): number {
    const hourlyRate = this.selectedSpot?.hourlyRate || 0;
    return this.durationInHours * hourlyRate;
  }


  get parsedFeatures(): string[] {
    if (!this.selectedSpot || !this.selectedSpot.features) return [];
    
    return this.selectedSpot.features
      .split(',')
      .map((f: string) => f.trim()) 
      .filter((f: string) => f.length > 0); 
  }

  getFeatureIcon(feature: string): string {
    const text = feature.toLowerCase();
    if (text.includes('cctv') || text.includes('kamera')) return '📹';
    if (text.includes('0-24')) return '🕒';
    if (text.includes('töltő') || text.includes('elektromos')) return '⚡';
    if (text.includes('őrzött') || text.includes('biztonság')) return '🛡️';
    if (text.includes('mosó')) return '🚿';
    if (text.includes('akadálymentes') || text.includes('mozgáskorlátozott')) return '♿';
    return '✔️'; 
  }

  isFormValid(): boolean {
    const isCarDataValid = !(this.plateCtrl?.invalid || this.brandCtrl?.invalid || this.modelCtrl?.invalid || this.colorCtrl?.invalid);

    return (
      isCarDataValid &&
      this.bookingData.startTime !== '' &&
      this.bookingData.endTime !== '' &&
      this.durationInHours > 0
    );
  }

  buySubscription(type: 'DAILY' | 'MONTHLY') {
    this.plateCtrl?.control?.markAsTouched();
    if (this.plateCtrl?.invalid) {
      return;
    }

    const payload = {
      licensePlate: this.bookingData.licensePlate.trim().toUpperCase(),
      userId: this.authService.getCurrentUserId() ? String(this.authService.getCurrentUserId()) : ''
    };

    this.bookingService.createSubscriptionSession(this.spotId, type, payload).subscribe({
      next: (response: any) => {
        if (response.url) {
          window.location.href = response.url;
        }
      },
      error: (err) => {
        this.errorService.showError('Hiba történt a bérlet vásárlásakor!');
      }
    });
}

  async confirmBooking() {
    this.plateCtrl?.control?.markAsTouched();
    this.brandCtrl?.control?.markAsTouched();
    this.modelCtrl?.control?.markAsTouched();
    this.colorCtrl?.control?.markAsTouched();

    if (this.plateCtrl?.invalid || this.brandCtrl?.invalid || this.modelCtrl?.invalid || this.colorCtrl?.invalid) {
      return; 
    }

    if (!this.bookingData.startTime || !this.bookingData.endTime) {
      alert('Kérlek válassz időpontot!');
      return;
    }


    const payload = {
      ...this.bookingData,
      startTime: new Date(this.bookingData.startTime).toISOString(), 
      endTime: new Date(this.bookingData.endTime).toISOString(),
      licensePlate: this.bookingData.licensePlate.trim().toUpperCase(),
      userId: this.authService.getCurrentUserId() ? String(this.authService.getCurrentUserId()) : ''
    };

    this.bookingService.createCheckoutSession(this.spotId, payload).subscribe({
      next: (response: any) => {
        if (response.url) {
          window.location.href = response.url;
        }
      },
      error: (err) => {
        console.error('Szerver hiba:', err);
        alert('Szerver hiba történt a Stripe indításakor.');
      }
    });
  }

  startOnDemandParking() {
    this.plateCtrl?.control?.markAsTouched();
    this.brandCtrl?.control?.markAsTouched();
    this.modelCtrl?.control?.markAsTouched();
    this.colorCtrl?.control?.markAsTouched();
    
    if (this.plateCtrl?.invalid || this.brandCtrl?.invalid || this.modelCtrl?.invalid || this.colorCtrl?.invalid) {
      return;
    }

    this.isLoading = true;

    const payload = {
      parkingSpotId: this.spotId,
      userId: this.authService.getCurrentUserId(),
      licensePlate: this.bookingData.licensePlate.trim().toUpperCase(),
      carBrand: this.bookingData.carBrand.trim(),
      carModel: this.bookingData.carModel.trim(),
      carColor: this.bookingData.carColor.trim()
    };

    this.bookingService.startOnDemandParking(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/foglalasaim']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorService.showError(err.error?.error || "Hiba történt a parkolás indításakor!");
      }
    });
  }
}