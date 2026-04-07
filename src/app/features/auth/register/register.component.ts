import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, RouterLink } from '@angular/router'; 
import { environment } from '../../../core/enviroment';

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
      alert("A két jelszó nem egyezik meg! Kérlek, gépeld be újra.");
      return; //
    }
    
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
          alert("Sikeres regisztráció! Elküldtünk egy 6 jegyű kódot az e-mail címedre.");
          
         
          this.router.navigate(['/verify-email'], { queryParams: { email: data.email } }); 
        },
        error: (err) => {
          console.error("Hiba:", err);
          alert("Hiba történt a regisztráció során!");
        },
      });
  }

}
}
