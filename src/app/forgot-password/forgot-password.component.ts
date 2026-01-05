import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Ez kell az ngModel-hez

@Component({
  selector: 'forgot-password',
  standalone: true, 
  imports: [FormsModule], // HttpClient ide NEM kell, csak a modulok/komponensek
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  emailInput: string = '';
  message: string = ''; // Visszajelzés a felhasználónak
  isError: boolean = false;

  private http = inject(HttpClient);

  onSubmit() {
    if (!this.emailInput) return;

    const apiUrl = 'http://localhost:8080/api/auth/forgot-password';
    
    // Itt küldjük el a kérést
    this.http.post(apiUrl, { email: this.emailInput }, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Siker:', response);
        this.message = 'Ha a cím létezik, elküldtük a jelszó-visszaállítási linket!';
        this.isError = false;
      },
      error: (error) => {
        console.error('Hiba:', error);
        this.message = 'Hiba történt a küldés során. Kérjük próbálja újra!';
        this.isError = true;
      }
    });
  }
}