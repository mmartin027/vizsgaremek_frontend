import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // + ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { MapService } from '../../../services/map';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  map!: maplibregl.Map;
  markers: maplibregl.Marker[] = [];
  parkingZones: any[] = [];
  isLoading = true;
  
  // ✅ Ez hiányzott: Ebbe mentjük a kattintott parkoló adatait
  selectedZone: any = null;

  constructor(
    private mapService: MapService, 
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ Segít, hogy a HTML azonnal észrevegye a kattintást
  ) {}

  ngOnInit() {
    this.loadParkingZones();
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
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

      this.map.on('load', () => {
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        this.addMarkersToMap();
      });

      // ✅ Ha a térkép üres részére kattintunk, zárja be a sidebart
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

      // ✅ KATTINTÁS ESEMÉNY A MARKERRE
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // Fontos, hogy ne kattintsunk át a térképre alatta
        this.selectedZone = props; // Betöltjük az adatokat a sidebarba
        this.cdr.detectChanges();   // Frissítjük a HTML-t
        
        this.map.flyTo({ center: coords as [number, number], zoom: 14 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords as [number, number])
        .addTo(this.map);

      this.markers.push(marker);
    });
  }

  // ✅ SIDEBAR KEZELŐ FÜGGVÉNYEK
  closeSidebar() {
    this.selectedZone = null;
    this.cdr.detectChanges();
  }

  bookZone(id: number) {
    this.router.navigate(['/booking', id]);
  }

  getProgressBarColor(): string {
    if (!this.selectedZone) return '#eee';
    const ratio = this.selectedZone.availableSpaces / this.selectedZone.capacity;
    if (ratio > 0.5) return '#10b981';
    if (ratio > 0.2) return '#f59e0b';
    return '#ef4444';
  }
}