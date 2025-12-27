import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-success',
  standalone: true,
  template: `<p>Bejelentkezés feldolgozása... kérlek várj.</p>` // Vagy egy spinner
})
export class LoginSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    // 1. Megnézzük az URL paramétereket (?token=...)
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        // 2. Elmentjük a tokent a localStorage-ba
        localStorage.setItem('token', token);
        console.log('Google token sikeresen elmentve!');

        // 3. Átirányítjuk a felhasználót a tényleges főoldalra
        this.router.navigate(['/home']);
      } else {
        // Ha nincs token, hiba történt, irány a login
        this.router.navigate(['/login']);
      }
    });
  }
}