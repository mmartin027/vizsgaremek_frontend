import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {

  public authService = inject(AuthService);
  private router = inject(Router); 
  private alertService = inject(AlertService); 

  isMenuOpen: boolean = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  async logout() {
    this.closeMenu(); 

    const isConfirmed = await this.alertService.confirm(
      'Kijelentkezés', 
      'Biztosan ki szeretnél jelentkezni?', 
      'Igen, kijelentkezem'
    );

    if (isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      this.router.navigate(['/login']); 
      
      this.alertService.toast('Sikeresen kijelentkeztél!', 'success');
    }
  }
}