import { Component, Input, Output, EventEmitter } from '@angular/core';


export interface ParkingSpotDto {
  id: number;
  name: string;
  address: string;
  hourlyRate: number;
  features: string;
  main_Image_Url: string;
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



  readonly IMAGE_URL = 'http://localhost:8080/images';

  get featureList(): string[] {
    if (!this.spot?.features) return [];
    return this.spot.features.split(',').map(f => f.trim());
  }

 

  onBtnClick() {
    this.viewDetails.emit(this.spot.id);
  }
}