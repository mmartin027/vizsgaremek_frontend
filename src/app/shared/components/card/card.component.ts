import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';



export interface ParkingSpotDto {
  id: number;
  name: string;
  cityName: string;
  address: string;
  hourlyRate: number;
  mainImageUrl: string;
  rating: number;
  ratingCount: number;
  distanceFromCenter: number;
  availableSpaces: number;
  features: string; // Vesszővel elválasztva az adatbázisból: "0-24, CCTV, Töltő"
}


@Component({
  selector: 'app-parking-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.css']
})
export class CardComponent {
  // A szülő komponenstől érkező parkoló adatok
  @Input() spot!: ParkingSpotDto;

  // Esemény a gombnyomáshoz
  @Output() viewDetails = new EventEmitter<number>();

  // Kiszámolt tulajdonság a kényelmes megjelenítéshez
  get featureList(): string[] {
    if (!this.spot?.features) return [];
    return this.spot.features.split(',').map(f => f.trim());
  }

  onBtnClick() {
    this.viewDetails.emit(this.spot.id);
  }
}