import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './quick-search.component.html',
  styleUrl: './quick-search.component.css'
})
export class QuickSearchComponent {
  private fb = inject(FormBuilder);
  showCities = false;

  searchForm = this.fb.group({
    city: ['', Validators.required],
    startDate: ['', Validators.required],
    startTime: ['08:00', Validators.required],
    endDate: ['', Validators.required],
    endTime: ['18:00', Validators.required]
  });

  selectCity(name: string) {
    this.searchForm.patchValue({ city: name });
    this.showCities = false;
  }

  onSearch() {
    if (this.searchForm.valid) {
      console.log('Keresés indítása:', this.searchForm.value);
    
    }
  }
}