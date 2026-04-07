import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { LoginSuccessComponent } from './features/auth/login-success/login-success.component';
import{ ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ParkingSearchComponent } from './features/parking-search/parking-search.component';
import { BookingComponent } from './features/booking/booking.component';
import { BookingSuccessComponent } from './features/booking/booking-success/booking-success.component';
import { PaymentComponent } from './features/booking/payment/payment.component'; 
import { MyBookingsComponent } from './features/profile/user-parkings/user-parkings.component';
import { BookingUpdateComponent } from './features/booking/booking-update/booking-update.component';
import { ExtensionSuccessComponent } from './features/booking/extension-success/extension-success.component';
import { MapViewComponent } from './features/map-view/map-component.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { adminGuard } from './core/guards/admin-guard';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email.component';

export const routes: Routes = [
  { path: '', redirectTo: 'fooldal', pathMatch: 'full' },
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
  {path: 'admin',component: AdminDashboardComponent,canActivate: [adminGuard] },
  {path:'user-profile',component: ProfileComponent},
  { path: 'verify-email', component: VerifyEmailComponent },

  
  { path: '**', redirectTo: 'home' }
];

