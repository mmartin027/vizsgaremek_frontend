import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router'; 
import { environment } from '../../../core/enviroment';
import { FormErrorComponent } from '../../form-error/form-error.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormErrorComponent, HeaderComponent], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required], 
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_again : ['', [Validators.required, Validators.minLength(6)]],
      phone: ['']
    });
  }

  continueWithGoogle() {
    const baseUrl = environment.apiUrl.replace('/api', '');
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  }

  onSubmit() {
    const password = this.registerForm.get('password')?.value;
    const passwordAgain = this.registerForm.get('password_again')?.value;

    if (password !== passwordAgain) {
      this.alertService.error("Hiba", "A két jelszó nem egyezik meg! Kérlek, gépeld be újra.");
      return; 
    }
    
    if (this.registerForm.valid) {
      
      const { password_again, ...validUserData } = this.registerForm.value;

      const data = {
        ...validUserData, 
        img: "",
        authSecret: "defaultSecret",
        createdAt: new Date(),
        isDeleted: false,
        regToken: "REG" + Date.now()
      };

      this.authService.register(data).subscribe({
        next: (response) => {
          this.alertService.success("Sikeres regisztráció!", "Elküldtünk egy 6 jegyű kódot az e-mail címedre.");
          this.router.navigate(['/verify-email'], { queryParams: { email: data.email } }); 
        },
        error: (err) => {
          this.alertService.error("Sikertelen regisztráció", "Hiba történt a regisztráció során!");
        },
      });
    } else {
      this.alertService.info("Hiányzó adatok", "Kérlek tölts ki minden kötelező mezőt helyesen!");
    }
  }
}