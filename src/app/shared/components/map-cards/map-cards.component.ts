import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-cards.component.html',
  styleUrl: './map-cards.component.css',
})
export class MapCardsComponent {
  @Input() spot: any; 
  
  @Output() viewDetails = new EventEmitter<number>(); 
}