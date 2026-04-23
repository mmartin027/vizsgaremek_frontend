import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../core/enviroment';

export interface ParkingSpotDto {
  id: number;
  name: string;
  address: string;
  hourlyRate: number;
  features: string;
  main_Image_Url: string;
  cityName?: string;  
  latitude: number;
  longitude: number;
  capacity: number;
  occupiedSpaces: number;
  availableSpaces: number;
  parkingType?: string; 
}

@Component({
  selector: 'app-parking-card',
  standalone: true,
  imports: [], 
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.css']
})
export class CardComponent {
  @Input() spot!: ParkingSpotDto;
  @Output() viewDetails = new EventEmitter<number>();

  readonly IMAGE_URL = `${environment.apiUrl}/images`;

  get featureList(): string[] {
    if (!this.spot?.features) return [];
    return this.spot.features.split(',').map(f => f.trim());
  }

  get isZone(): boolean {
    return this.spot.parkingType !== 'COVERED' || this.spot.capacity > 9000;
  }

  get isFull(): boolean {
    return this.spot.availableSpaces <= 0;
  }

  onBtnClick() {
    this.viewDetails.emit(this.spot.id);
  }
}