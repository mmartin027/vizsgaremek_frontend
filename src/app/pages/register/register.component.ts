import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

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
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: ['']
    });

  }

  onSubmit() {
    if (this.registerForm.valid) {
      const data = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone,

        img: "",
        authSecret: "defaultSecret",
        createdAt: new Date(),
        isDeleted: false,
        regToken: "REG" + Date.now()
      };

      this.authService.register(data).subscribe({
        next: (response) => {
          console.log("Backend response received:", response);
          alert("Sikeres regisztráció!");
        },
        error: (err) => {
          console.error("Backend error:", err);
          alert("Hiba történt a regisztráció során!");
        }
      });

    } else {
      console.log("Form invalid!");
      this.registerForm.markAllAsTouched();
    }
  }
}
