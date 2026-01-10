import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-success',
  standalone: true,
  template: `<p>Bejelentkezés feldolgozása... kérlek várj.</p>` 
})
export class LoginSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        localStorage.setItem('token', token);
        console.log('Google token sikeresen elmentve!');

        
        this.router.navigate(['/home']);
      } else {
        
        this.router.navigate(['/login']);
      }
    });
  }
}