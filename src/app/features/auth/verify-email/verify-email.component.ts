import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {

  step = 1; 
  emailForm: FormGroup;
  otpForm: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder); 

  userEmail: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.userEmail = params['email'] || '';
      
      if (this.userEmail) {
        this.step = 2; 
      }
    });
  }

  sendEmail() {
    if (this.emailForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.userEmail = this.emailForm.value.email; 

    this.authService.verifyEmail(this.userEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.step = 2; 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Hiba történt az e-mail küldésekor.";
      }
    });
  }

  verifyCode() {
    if (this.otpForm.invalid) {
      this.errorMessage = "Kérlek, add meg a 6 jegyű kódot!";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const otpValue = this.otpForm.value.otp; 

    this.authService.verifyRegistrationOtp(this.userEmail, Number(otpValue)).subscribe({
      next: (res) => {
        this.isLoading = false;
        alert("Szuper! A fiókod sikeresen hitelesítve lett. Most már bejelentkezhetsz!");
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || "Hibás vagy lejárt kód!";
      }
    });
  }
}