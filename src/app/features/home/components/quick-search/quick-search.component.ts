import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- EZ FONTOS: *ngIf és *ngFor miatt
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // <-- EZ FONTOS: Navigáció miatt

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // <-- Ne felejtsd el a CommonModule-t!
  templateUrl: './quick-search.component.html',
  styleUrl: './quick-search.component.css'
})
export class QuickSearchComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router); // Router beinjektálása

  showCities = false;
  
  // A városok listája (később akár backendből is jöhet)
  cities = ['Budapest', 'Debrecen', 'Szeged', 'Miskolc', 'Pécs'];

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

  hideCitiesDelayed() {
    setTimeout(() => this.showCities = false, 200);
  }

  onSearch() {
    if (this.searchForm.valid) {
      const formValues = this.searchForm.value;
      console.log('Keresés indítása:', formValues);
    
    this.router.navigate(['/parkolo-kereses'], {
      queryParams: {
        city: formValues.city,
        startDate: formValues.startDate,
        startTime: formValues.startTime,
        endDate: formValues.endDate,
        endTime: formValues.endTime
      }
    });
    } else {
      alert('Kérlek, válaszd ki a várost és a dátumokat a kereséshez!');
    }
  }
}