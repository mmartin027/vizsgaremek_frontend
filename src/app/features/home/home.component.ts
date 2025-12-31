import { Component } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { QuickSearchComponent } from './components/quick-search/quick-search.component';

@Component({
  selector: 'home',
  imports: [HeroSectionComponent, QuickSearchComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
