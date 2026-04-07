import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  private authService = inject(AuthService);
  private userService = inject(UserService);
  
  userData: any = null;
  isLoading: boolean = true;

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      console.error("Nincs bejelentkezett felhasználó!");
      this.isLoading = false;
      return;
    }

    this.userService.getUserProfile(Number(userId)).subscribe({
      next: (data) => {
        this.userData = data;
        this.isLoading = false;
        console.log("Szuper! Profil adatok betöltve:", this.userData);
      },
      error: (err) => {
        console.error("Hiba a profil betöltésekor:", err);
        this.isLoading = false;
      }
    });
  }
}