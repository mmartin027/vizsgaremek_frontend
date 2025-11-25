import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';  // <--- fontos import

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService   
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const data = this.registerForm.value;

      this.authService.register(data).subscribe({
        next: (response) => {
          console.log("Backend response received:", response);
          
        },
        error: (err) => {
          console.error("Backend error:", err);
        }
      });
    } else {
      console.log("Form invalid!");
      this.registerForm.markAllAsTouched();
    }
  }
}
