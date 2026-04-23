import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-success',
  templateUrl: './login-success.component.html'
})
export class LoginSuccessComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      
      const token = params['token'];
      const refreshToken = params['refreshToken'];

      if (token && refreshToken) {
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        this.router.navigate(['/home']); 
      } else if (token) {
        localStorage.setItem('token', token);
        this.router.navigate(['/home']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}