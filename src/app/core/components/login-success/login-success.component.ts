import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html'
})
export class LoginSuccessComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // Feliratkozunk a URL "hash" (#) részére
    this.route.fragment.subscribe(fragment => {
      
      if (fragment) {
       
        const urlParams = new URLSearchParams(fragment);
        const token = urlParams.get('token');

        if (token) {
          console.log(' Sikeresen elkapva a token a hash-ből!');
          
          localStorage.setItem('token', token);
          
          this.router.navigate(['/home']); 
        } else {
          console.error('Nincs token a hash-ben!');
          this.router.navigate(['/login']);
        }
      }
    });
  }
}