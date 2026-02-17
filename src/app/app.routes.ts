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
  {path:'user-bookings',component:MyBookingsComponent}
];

