import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../services/parking';
import { HeaderComponent } from '../../shared/components/header/header.component';


@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, CardComponent, HeaderComponent], // Itt importáld a kártya komponenst!
  templateUrl: 'parking-search.component.html',
  styleUrls: ['parking-search.component.css']
})
export class ParkingSearchComponent implements OnInit {
  parkingSpots: ParkingSpotDto[] = [];

  constructor(private parkingService: ParkingService) {}

  ngOnInit() {
    // Itt hívod meg a backendet a város ID alapján
    this.parkingService.searchByCity(1).subscribe(data => {
      this.parkingSpots = data;
    });
  }

  handleViewDetails(id: number) {
    console.log('Részletek megtekintése a következőhöz:', id);
    // Itt navigálhatsz tovább a részletek oldalra: this.router.navigate(['/details', id]);
  }
}