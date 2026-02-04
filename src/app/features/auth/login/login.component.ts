import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';  
  isLoading: boolean = false; 

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  continueWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

 onLogin() {
  if (this.loginForm.valid) {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (token: string) => {
       // console.log('Sikeres login! Token:', token);
        localStorage.setItem('token', token);
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error("Login hiba:", err);
        this.isLoading = false;
        this.errorMessage = err.message || "Hibás felhasználónév vagy jelszó!";
       
      }
    });
  } else {
    this.errorMessage = "Kérlek töltsd ki az összes mezőt!";
  }

 }
}