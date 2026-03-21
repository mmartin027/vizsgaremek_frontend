import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { RouterModule, Router } from '@angular/router'; // A Router-t is importáld!

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {


public authService = inject(AuthService);

private router = inject(Router); // <--- Router bekötése
logout() {
    if (confirm('Biztosan ki szeretnél jelentkezni?')) {
      // Tokenek törlése
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      this.router.navigate(['/']);


    }
  }

  
}
