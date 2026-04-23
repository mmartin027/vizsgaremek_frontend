import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingSpotDto } from '../card/card.component';

@Component({
  selector: 'app-map-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-cards.component.html',
  styleUrl: './map-cards.component.css',
})
export class MapCardsComponent {
@Input() spot!: ParkingSpotDto; 

@Output() focusSpot = new EventEmitter<number>(); 

  @Output() bookSpot = new EventEmitter<number>(); 


  get featureList(): string[] {
    if (!this.spot || !this.spot.features) return [];
    return this.spot.features.split(',').map(f => f.trim());
  }

  onCardClick() {
    this.focusSpot.emit(this.spot.id);
  }

  onButtonClick(event: Event) {
    event.stopPropagation(); 
    this.bookSpot.emit(this.spot.id);
  }
}

