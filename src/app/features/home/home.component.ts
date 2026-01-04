import { Component } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { QuickSearchComponent } from './components/quick-search/quick-search.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'home',
  imports: [HeaderComponent,HeroSectionComponent, QuickSearchComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
