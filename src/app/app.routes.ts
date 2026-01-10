import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { LoginSuccessComponent } from './core/components/login-success/login-success.component';
import{ ForgotPasswordComponent } from './forgot-password/forgot-password.component';


export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password',  component: ForgotPasswordComponent },
  { path: 'login-success', component: LoginSuccessComponent },
  {path: 'home', component: HomeComponent}
];
