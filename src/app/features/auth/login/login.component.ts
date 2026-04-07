import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ErrorService } from '../../../core/services/error-service';
import { environment } from '../../../core/enviroment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false; 

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private errorService = inject(ErrorService); 

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

continueWithGoogle() {
    const baseUrl = environment.apiUrl.replace('/api', '');
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  }
  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => { 
          if (response && response.token) {
            localStorage.setItem('token', response.token); 
          }
          
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error("Login hiba:", err);
          this.isLoading = false;
          
          const msg = err.error?.message || "Hibás felhasználónév vagy jelszó! Kérlek, próbáld újra.";
          this.errorService.showError(msg);
        }
      });
    } else {
      this.errorService.showError("Kérlek, töltsd ki a felhasználónevet és a jelszót a bejelentkezéshez!");
    }
  }
}