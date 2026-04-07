import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { CardComponent, ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../core/services/parking';
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
  searchCity: string = ''; 

  cityToIdMap: { [key: string]: number } = {
    'Budapest': 1,
    'Debrecen': 2,
    'Szeged': 3,
    'Miskolc': 4,
    'Pécs': 5
  };

  constructor(
    private parkingService: ParkingService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchCity = params['city'] || '';

     
      const cityId = this.cityToIdMap[this.searchCity] || 1;

      this.parkingService.searchByCity(cityId).subscribe(data => {
        this.parkingSpots = data;
      });
    });
  }

  openMapView() {
    this.router.navigate(['/map']);
  }

  handleViewDetails(id: number) {
    this.router.navigate(['/booking', id]); 
  }
}