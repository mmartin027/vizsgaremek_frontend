import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService } from '../../../core/services/error-service';
@Component({
  selector: 'app-global-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-error.component.html',
  styleUrls: ['./global-error.component.css']
})
export class GlobalErrorComponent implements OnInit {
  errorService = inject(ErrorService);
  errorMessage: string | null = null;

  ngOnInit() {
   
    this.errorService.errorMessage$.subscribe(msg => {
      this.errorMessage = msg;
    });
  }

  closeError() {
    this.errorService.clearError(); 
  }
}