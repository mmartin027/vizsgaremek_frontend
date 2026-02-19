import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router'; 
import { CardComponent, ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../services/parking';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CardComponent, HeaderComponent], 
  templateUrl: 'parking-search.component.html',
  styleUrls: ['parking-search.component.css']
})
export class ParkingSearchComponent implements OnInit {
  parkingSpots: ParkingSpotDto[] = [];

  constructor(
    private parkingService: ParkingService,
    private router: Router 
  ) {}

  ngOnInit() {
    this.parkingService.searchByCity(1).subscribe(data => {
      this.parkingSpots = data;
    });
  }

 

openMapView() {
    this.router.navigate(['/map']);
  }

  handleViewDetails(id: number) {
    this.router.navigate(['/booking', id]); 
  }

}