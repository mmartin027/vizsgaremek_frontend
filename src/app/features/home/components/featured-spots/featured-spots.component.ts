import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ParkingService } from '../../../../core/services/parking';
import { ParkingSpotDto } from '../../../../shared/components/card/card.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'featured-spots',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './featured-spots.component.html',
  styleUrl: './featured-spots.component.css',
})
export class FeaturedSpotsComponent implements OnInit {
  spots: ParkingSpotDto[] = [];

  constructor(
    private parkingService: ParkingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.parkingService.searchByCity(1).subscribe(data => {
      this.spots = data.slice(0, 3);
    });
  }

  onViewDetails(id: number) {
    this.router.navigate(['/booking', id]);
  }
}