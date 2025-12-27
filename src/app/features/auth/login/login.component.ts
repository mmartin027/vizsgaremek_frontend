import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // RouterLink kell a regisztrációhoz való ugráshoz
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // Ugyanaz a logika, mint a regisztrációnál
  continueWithGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (token: string) => {
          localStorage.setItem('token', token); // JWT mentése
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error("Login hiba:", err);
          alert("Hibás felhasználónév vagy jelszó!");
        }
      });
    }
  }
}