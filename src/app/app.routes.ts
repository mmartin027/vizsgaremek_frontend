import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { LoginSuccessComponent } from './core/components/login-success/login-success.component';
import{ ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ParkingSearchComponent } from './features/parking-search/parking-search.component';
import { BookingComponent } from './features/booking/booking.component';
import { BookingSuccessComponent } from './core/components/booking-success/booking-success.component';
import { PaymentComponent } from './core/components/payment/payment.component'; 
import { MyBookingsComponent } from './core/components/user-parkings/user-parkings.component';
import { BookingUpdateComponent } from './core/components/booking-update/booking-update.component';
import { ExtensionSuccessComponent } from './core/components/extension-success/extension-success.component';
import { MapViewComponent } from './core/components/map-component/map-component.component';


export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'fooldal', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'parkolo-kereses', component: ParkingSearchComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'login-success', component: LoginSuccessComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'checkout/:bookingId/:amount', component: PaymentComponent },
  { path: 'payment-success', component: BookingSuccessComponent }, 
  { path: 'payment-cancel', component: HomeComponent },
  { path: 'user-bookings', component: MyBookingsComponent },
  { path: 'foglalasaim', component: MyBookingsComponent }, 
  { path: 'map', component: MapViewComponent },
  { path: 'extension-success', component: ExtensionSuccessComponent }, 
  { path: 'extend-booking/:id', component: BookingUpdateComponent }, 
  
  { path: '**', redirectTo: 'home' }
];

