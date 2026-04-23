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
import { ContactComponent } from './features/contact/contact.component';
import { VerifyEmailComponent } from './features/auth/verify-email/verify-email.component';
import { AboutComponent } from './pages/about/about.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'fooldal', pathMatch: 'full' },
  { path: 'fooldal', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'login-success', component: LoginSuccessComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'parkolo-kereses', component: ParkingSearchComponent },
  { path: 'map', component: MapViewComponent },
  { path: 'booking/:id', component: BookingComponent },
  { path: 'checkout/:bookingId/:amount', component: PaymentComponent },
  { path: 'payment-success', component: BookingSuccessComponent }, 
  { path: 'payment-cancel', component: HomeComponent },
  { path: 'extend-booking/:id', component: BookingUpdateComponent }, 
  { path: 'extension-success', component: ExtensionSuccessComponent }, 
  { path: 'user-profile', component: ProfileComponent },
  { path: 'user-bookings', component: MyBookingsComponent },
  { path: 'foglalasaim', component: MyBookingsComponent }, 
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'rolunk', component: AboutComponent },
  { path: 'aszf', component: TermsComponent },
  { path: 'adatvedelem', component: PrivacyComponent },
    { path: 'kapcsolat', component: ContactComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cookie', redirectTo: '/adatvedelem' }, 
  { path: 'gyik', redirectTo: '/fooldal' },
  { path: '**', redirectTo: 'fooldal' }
];