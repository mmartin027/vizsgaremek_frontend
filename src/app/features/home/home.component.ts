import { Component } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { QuickSearchComponent } from './components/quick-search/quick-search.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FaqComponent } from './components/faq/faq.component';
import { FeaturedSpotsComponent } from './components/featured-spots/featured-spots.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { FooterComponent } from '../../shared/components/footer/footer.component'

@Component({
  selector: 'home',
  imports: [HeaderComponent,HeroSectionComponent, QuickSearchComponent,FaqComponent,FeaturedSpotsComponent,HowItWorksComponent,FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

}
