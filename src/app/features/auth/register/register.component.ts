import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required], 
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['']
    });
  }

  continueWithGoogle() {
  // Mindig a backend OAuth kezdőpontjára irányítunk
  window.location.href = 'http://localhost:8080/oauth2/authorization/google';
}

  onSubmit() {
    if (this.registerForm.valid) {
      const data = {
        ...this.registerForm.value, 
        img: "",
        authSecret: "defaultSecret",
        createdAt: new Date(),
        isDeleted: false,
        regToken: "REG" + Date.now()
      };

      this.authService.register(data).subscribe({
        next: (response) => {
          console.log("Sikeres regisztráció:", response);
          alert("Sikeres regisztráció!");
          this.router.navigate(['/login']); 
        },
        error: (err) => {
          console.error("Hiba:", err);
          alert("Hiba történt a regisztráció során!");
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}