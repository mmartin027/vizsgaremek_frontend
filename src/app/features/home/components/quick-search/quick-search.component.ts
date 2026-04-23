import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth'; 

@Component({
  selector: 'app-quick-search', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.css']
})
export class QuickSearchComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);

  userName: string = 'VENDÉG';

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
    }
  }

  navigateToMap(parkingType: string) {
    this.router.navigate(['/map'], { 
      queryParams: { type: parkingType } 
    });
  }
}