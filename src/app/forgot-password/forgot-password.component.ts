  import { Component, inject } from '@angular/core';
  import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';
  import { AuthService } from './../core/services/auth';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html'
  })
  export class ForgotPasswordComponent {
    step = 1; 
    emailForm: FormGroup;
    otpForm: FormGroup;
    passwordForm: FormGroup;
    emailForReset = '';

    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    constructor() {
      this.emailForm = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
      this.otpForm = this.fb.group({ otp: ['', Validators.required] });
      this.passwordForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        repeatPassword: ['', Validators.required]
      });
    }

   
    sendEmail() {
      const email = this.emailForm.value.email;
      this.authService.verifyEmail(email).subscribe({
        next: () => {
          this.emailForReset = email;
          this.step = 2;
        },
        error: () => alert("Hiba: Nincs ilyen email a rendszerben!")
      });
    }

    
    verifyOtp() {
      const otp = this.otpForm.value.otp;
      this.authService.verifyOtp(otp, this.emailForReset).subscribe({
        next: () => this.step = 3,
        error: () => alert("Hibás vagy lejárt kód!")
      });
    }

    
    changePassword() {
      if (this.passwordForm.value.password !== this.passwordForm.value.repeatPassword) {
        alert("A két jelszó nem egyezik!");
        return;
      }
      this.authService.changePassword(this.emailForReset, this.passwordForm.value).subscribe({
        next: () => {
          alert("Sikeres jelszómódosítás!");
          this.router.navigate(['/login']);
        },
        error: () => alert("Hiba történt a mentés során!")
      });
    }
  }