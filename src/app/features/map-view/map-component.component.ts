import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { MapService } from '../../core/services/map';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CardComponent, ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../core/services/parking';
import { MapCardsComponent } from '../../shared/components/map-cards/map-cards.component';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CardComponent, MapCardsComponent],
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  map!: maplibregl.Map;
  parkingSpots: ParkingSpotDto[] = [];
  markers: maplibregl.Marker[] = [];
  parkingZones: any[] = [];
  rawGeoJson: any = null;
  clickedZoneId: string | number | null = null;
  isLoading = true;
  activeMobileView: 'list' | 'map' = 'map';
  selectedZone: any = null;

  constructor(
    private mapService: MapService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private parkingService: ParkingService,
  ) {}

  ngOnInit() {
    this.loadMapData();
    this.parkingService.searchByCity(1).subscribe(data => {
      this.parkingSpots = data;
    });
  }

setView(view: 'list' | 'map') {
    this.activeMobileView = view;
    

    if (view === 'map') {
      setTimeout(() => {
        if (this.map) {
          this.map.resize();
        }
      }, 50);
    }
  }

  handleViewDetails(id: number) {
  if (id) {
    console.log('Navigáció a parkolóhoz, ID:', id);
    this.router.navigate(['/booking', id]);
  } else {
    console.error('Hiba: Nincs parkoló ID!');
  }
}
  ngAfterViewInit() {
    setTimeout(() => {
      const container = document.getElementById('map');
      if (container) {
        this.initMap();
      } else {
        console.error("Hiba: A 'map' id-jú elem nem található!");
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
        center: [18.227, 46.075],
        zoom: 13
      });

      this.mapService.setMap(this.map);

      this.map.on('load', () => {
        this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
        if (this.rawGeoJson) {
          this.renderMapData();
        }
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLng = position.coords.longitude;
      const userLat = position.coords.latitude;

      const el = document.createElement('div');
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#4285F4';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 8px rgba(66,133,244,0.5)';

      new maplibregl.Marker({ element: el })
        .setLngLat([userLng, userLat])
        .addTo(this.map);

      this.map.flyTo({ center: [userLng, userLat], zoom: 14 });
    },
    (error) => {
      console.log('Geolokáció nem elérhető:', error.message);
    }
  );
}
      });

      this.map.on('click', (e) => {
        if (this.map.getLayer('zones-fill')) {
          const features = this.map.queryRenderedFeatures(e.point, { layers: ['zones-fill'] });
          if (!features.length) {
            this.closeSidebar();
          }
        } else {
          this.closeSidebar();
        }
      });
    } catch (error) {
      console.error('Térkép hiba:', error);
    }
  }


  loadMapData() {
    this.isLoading = true;
    this.mapService.getMapData().subscribe({
      next: (geoJson) => {
        this.rawGeoJson = geoJson;
        this.parkingZones = geoJson.features || [];
        this.isLoading = false;

        if (this.map && this.map.loaded()) {
          this.renderMapData();
        }
      },
      error: (err) => {
        console.error('Térkép adat betöltési hiba:', err);
        this.isLoading = false;
      }
    });
  }

  renderMapData() {
    if (!this.map.getSource('parking-zones-source')) {
      this.map.addSource('parking-zones-source', {
        type: 'geojson',
        data: this.rawGeoJson
      });

      this.map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'parking-zones-source',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            '#f59e0b',
            '#8b5cf6'
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            0.7,
            0.3
          ]
        },
        filter: ['==', '$type', 'Polygon']
      });

      this.map.addLayer({
        id: 'zones-line',
        type: 'line',
        source: 'parking-zones-source',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            '#d97706',
            '#7c3aed'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            3,
            1.5
          ]
        },
        filter: ['==', '$type', 'Polygon']
      });

  
      this.map.on('click', 'zones-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const featureId = feature.id;

          if (featureId !== undefined && featureId !== null) {
            if (this.clickedZoneId !== null) {
              this.map.setFeatureState(
                { source: 'parking-zones-source', id: this.clickedZoneId },
                { clicked: false }
              );
            }
            this.clickedZoneId = featureId;
            this.map.setFeatureState(
              { source: 'parking-zones-source', id: this.clickedZoneId },
              { clicked: true }
            );
          }

          this.selectedZone = feature.properties;
          this.cdr.detectChanges();
        }
      });

      this.map.on('mouseenter', 'zones-fill', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'zones-fill', () => {
        this.map.getCanvas().style.cursor = '';
      });

    } else {
      (this.map.getSource('parking-zones-source') as maplibregl.GeoJSONSource)
        .setData(this.rawGeoJson);
    }

    this.addMarkersToMap();
  }


  addMarkersToMap() {
    if (!this.parkingZones.length) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.parkingZones.forEach((feature) => {
      const kind = feature.properties?.featureKind;
      if (kind !== 'spot') return;

      if (feature.geometry?.type === 'Point') {
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        if (lng === 0 && lat === 0) return;

        const el = document.createElement('div');
        el.className = 'custom-marker covered-marker';
        el.innerHTML = `<span>P</span>`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeSidebar();
          this.selectedZone = feature.properties;
          this.cdr.detectChanges();
          this.map.flyTo({ center: [lng, lat], zoom: 15 });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(this.map);

        this.markers.push(marker);
      }
    });
  }

  closeSidebar() {
    this.selectedZone = null;
    if (this.clickedZoneId !== null && this.map) {
      this.map.setFeatureState(
        { source: 'parking-zones-source', id: this.clickedZoneId },
        { clicked: false }
      );
      this.clickedZoneId = null;
    }
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
    if (!this.selectedZone || !this.selectedZone.capacity) return '#eee';
    const available = this.selectedZone.availableSpaces || 0;
    const ratio = available / this.selectedZone.capacity;
    if (ratio > 0.5) return '#10b981';
    if (ratio > 0.2) return '#f59e0b';
    return '#ef4444';
  }
}