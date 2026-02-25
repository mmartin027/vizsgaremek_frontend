import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // + ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { MapService } from '../../../services/map';
import { ZoneService } from '../../../services/zone-service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { BookingService } from '../../../services/booking.service';
import { CardComponent,ParkingSpotDto } from '../../../shared/components/card/card.component';
import { ParkingService } from '../../../services/parking';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, HeaderComponent,CardComponent],
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  map!: maplibregl.Map;
    parkingSpots: ParkingSpotDto[] = [];
  markers: maplibregl.Marker[] = [];
  parkingZones: any[] = [];
  isLoading = true;
  
  selectedZone: any = null;

  constructor(
    private mapService: MapService, 
    private zoneService: ZoneService,
    private router: Router,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private parkingService: ParkingService,
  ) {}

  ngOnInit() {
    this.loadParkingZones();
     this.parkingService.searchByCity(1).subscribe(data => {
        this.parkingSpots = data;
  }

      
)  }
  
  handleViewDetails(id: number) {
    this.router.navigate(['/booking', id]); 
  }


ngAfterViewInit() {
  setTimeout(() => {
    const container = document.getElementById('map');
    if (container) {
      this.initMap();
    } else {
      console.error("Hiba: A 'map' id-jú elem nem található a HTML-ben!");
    }
  }, 300); 
}

  ngOnDestroy() {
    if (this.map) this.map.remove();
  }

  initMap() {
    try {
      this.map = new maplibregl.Map({
        container: 'map',
        style: this.mapService.getMapStyleUrl(),
        center: [19.0402, 47.4979],
        zoom: 12
      });

this.mapService.setMap(this.map);



this.map.on('click', (e) => {
  const features = this.map.queryRenderedFeatures(e.point);
  
  if (features.length > 0) {
    console.log('Minden réteg a kattintás alatt:', features.map(f => f.layer.id));
    
    const zoneFeature = features.find(f => f.properties && (f.properties['Zone'] || f.properties['zone']));

    if (zoneFeature) {
      const mapId = zoneFeature.properties['Zone'] || zoneFeature.properties['zone'];
      console.log('Talált zóna kód:', mapId);

      this.zoneService.getZoneByMapId(mapId).subscribe({
        next: (data) => {
          this.selectedZone = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('SQL hiba:', err)
      });
    }
  } else {
    console.log('Üres területre kattintottál');
    this.closeSidebar();
  }
});

this.map.on('mouseenter', 'zones-layer', () => {
  this.map.getCanvas().style.cursor = 'pointer';
});

this.map.on('mouseleave', 'zones-layer', () => {
  this.map.getCanvas().style.cursor = '';
});

      this.map.on('load', () => {
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        this.addMarkersToMap();
      });

      //  Ha a térkép üres részére kattintunk, zárja be a sidebart
      this.map.on('click', () => {
        this.closeSidebar();
      });

    } catch (error) {
      console.error('Térkép hiba:', error);
    }
  }

  loadParkingZones() {
    this.isLoading = true;
    this.mapService.getParkingZones().subscribe({
      next: (geoJson) => {
        this.parkingZones = geoJson.features || [];
        this.isLoading = false;
        if (this.map && this.map.loaded()) this.addMarkersToMap();
      },
      error: (err) => {
        console.error('Backend hiba:', err);
        this.isLoading = false;
      }
    });
  }

  addMarkersToMap() {
    if (!this.parkingZones.length) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.parkingZones.forEach((zone) => {
      const coords = zone.geometry.coordinates;
      const props = zone.properties;

      const free = props.availableSpaces;
      const total = props.capacity;
      const percent = total > 0 ? (free / total) * 100 : 0;
      
      let color = '#10b981'; 
      if (percent < 20) color = '#ef4444'; 
      else if (percent < 50) color = '#f59e0b'; 

      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = color;
      el.innerHTML = `<span>${props.zoneName?.charAt(0) || 'P'}</span>`;

      el.addEventListener('click', (e) => {
        e.stopPropagation(); 
        this.selectedZone = props; 
        this.cdr.detectChanges();   
        
        this.map.flyTo({ center: coords as [number, number], zoom: 14 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords as [number, number])
        .addTo(this.map);

      this.markers.push(marker);
    });
  }

  closeSidebar() {
    this.selectedZone = null;
    this.cdr.detectChanges();
  }

  bookZone(id: number) {
    this.router.navigate(['/booking', id]);
  }

onBook(zoneId: number) {
    if (zoneId) {
      
      this.router.navigate(['/booking', zoneId]);
    }
  }

  getProgressBarColor(): string {
    if (!this.selectedZone) return '#eee';
    const ratio = this.selectedZone.availableSpaces / this.selectedZone.capacity;
    if (ratio > 0.5) return '#10b981';
    if (ratio > 0.2) return '#f59e0b';
    return '#ef4444';
  }
}