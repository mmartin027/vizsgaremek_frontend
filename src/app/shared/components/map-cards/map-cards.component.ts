import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../services/map';
import { ZoneService } from '../../../services/zone-service';

@Component({
  selector: 'map-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-cards.component.html',
  styleUrl: './map-cards.component.css',
})
export class MapCardsComponent implements OnInit {
  selectedZone: any = null;

  constructor(
    private mapService: MapService,
    private zoneService: ZoneService
  ) {}

  ngOnInit(): void {
    // Figyeljük, mikor jön létre a térkép
    this.mapService.map$.subscribe(map => {
      if (map) {
        this.setupMapClick(map);
      }
    });
  }

  setupMapClick(map: any) {
    map.on('click', 'zones-layer', (e: any) => {
      const mapId = e.features[0].properties.id;

      this.zoneService.getZoneByMapId(mapId).subscribe({
        next: (data) => {
          this.selectedZone = data;
        },
        error: () => {
          this.selectedZone = null;
        }
      });
    });
  }
}