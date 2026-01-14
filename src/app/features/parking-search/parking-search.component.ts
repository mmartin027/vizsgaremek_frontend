import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { HeaderComponent } from "../../shared/components/header/header.component";

@Component({
  selector: 'parking-search',
  standalone : true,
  imports: [CardComponent, HeaderComponent],
  templateUrl: './parking-search.component.html',
  styleUrl: './parking-search.component.css',
})
export class ParkingSearchComponent {

}
