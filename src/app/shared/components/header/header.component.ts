import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { RouterModule, Router } from '@angular/router'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {


public authService = inject(AuthService);

private router = inject(Router); 
logout() {
    if (confirm('Biztosan ki szeretnél jelentkezni?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      this.router.navigate(['/']);


    }
  }

  
}
