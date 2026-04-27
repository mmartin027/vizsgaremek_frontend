import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { MapService } from '../../core/services/map';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CardComponent, ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../core/services/parking';
import { MapCardsComponent } from '../../shared/components/map-cards/map-cards.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MapCardsComponent,FormsModule],
  templateUrl: './map-component.component.html',
  styleUrls: ['./map-component.component.css']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  map!: maplibregl.Map;
  parkingSpots: ParkingSpotDto[] = [];
  markers: maplibregl.Marker[] = [];
  
  parkingZones: any[] = [];
  filteredZones: any[] = []; 
  
  rawGeoJson: any = null;
  clickedZoneId: string | number | null = null;
  isLoading = true;
  activeMobileView: 'list' | 'map' = 'map';
  selectedZone: any = null;
  searchQuery: string = '';
  allSpots: ParkingSpotDto[] = [];
  filteredSpots: ParkingSpotDto[] = [];
  private searchTimeout: any;



  activeFilter: 'ALL' | 'COVERED' | 'OUTDOOR' = 'ALL'; 

  showMapOnMobile: boolean = true;

selectedCityFilter: string = 'all';

  cityToIdMap: { [key: string]: number } = {
    'Budapest': 1,
    'Pécs': 2,
    'Debrecen': 3,
    'Győr': 4,
  };

  cityCoordinates: { [key: string]: [number, number] } = {
    'Budapest': [19.040, 47.497],
    'Pécs': [18.233, 46.072],
    'Debrecen': [21.625, 47.531],
    'Győr': [17.634, 47.687],
  };

  constructor(
    private mapService: MapService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private parkingService: ParkingService,
    private route: ActivatedRoute

  ) {}

ngOnInit() {
    this.loadMapData(); 

    this.onCityFilterChange();
  }

fetchAllSpots() {
    const allCityIds = Object.values(this.cityToIdMap);
    const requests = allCityIds.map(id => this.parkingService.searchByCity(id));

    forkJoin(requests).subscribe({
      next: (results) => {
        const combinedSpots = results.flat(); 
        
        const uniqueIds = new Set();
        const uniqueSpots = combinedSpots.filter(spot => {
          if (uniqueIds.has(spot.id)) return false;
          uniqueIds.add(spot.id);
          return true;
        });

        this.allSpots = uniqueSpots;
        this.parkingSpots = uniqueSpots;
        this.filteredSpots = uniqueSpots;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Hiba az összes parkoló betöltésekor:', err);
      }
    });
  }


  

focusOnSpot(spotId: number) {
    const targetSpot = this.parkingSpots.find(s => s.id === spotId);
    
    if (targetSpot && targetSpot.latitude && targetSpot.longitude) {
      this.map.flyTo({
        center: [targetSpot.longitude, targetSpot.latitude],
        zoom: 16,
        essential: true,
        speed: 1.2
      });

      if (window.innerWidth < 768) {
        this.setView('map');
      }
    }
  }

onCityFilterChange() {
    if (this.selectedCityFilter === 'all') {
      
      if (this.map) {
        this.map.flyTo({ center: [19.5, 47.1], zoom: 7 });
      }
      
      this.fetchAllSpots();

    } else {
      const cityId = this.cityToIdMap[this.selectedCityFilter];
      if (cityId) {
        this.parkingService.searchByCity(cityId).subscribe(data => {
          this.allSpots = data;
          this.parkingSpots = data;
          this.filteredSpots = data;
          this.cdr.detectChanges();
        });

        const coords = this.cityCoordinates[this.selectedCityFilter];
        if (coords && this.map) {
          this.map.flyTo({ center: coords, zoom: 12, speed: 1.2 });
        }
      }
    }
  }

onSearchChange(query: string) {
  this.searchQuery = query;
  
  if (!query.trim()) {
    this.parkingSpots = [...this.allSpots];
    this.filteredSpots = [...this.allSpots]; 
    this.cdr.detectChanges();
    return;
  }

  const q = query.toLowerCase();
  
  const localResults = this.allSpots.filter(spot =>
    spot.name?.toLowerCase().includes(q) ||
    spot.address?.toLowerCase().includes(q)
  );

  if (localResults.length > 0) {
    this.parkingSpots = localResults;
    this.filteredSpots = localResults; 
    this.cdr.detectChanges();
  } else {
    this.parkingService.searchByCityName(query).subscribe({
      next: (data) => {
        this.parkingSpots = data;
        this.filteredSpots = data; 
        
        if (data.length > 0) {
          const newUniqueSpots = data.filter(ds => !this.allSpots.some(as => as.id === ds.id));
          this.allSpots = [...this.allSpots, ...newUniqueSpots];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.parkingSpots = [];
        this.filteredSpots = [];
        this.cdr.detectChanges();
      }
    });
  }
}
 setFilter(filterType: 'ALL' | 'COVERED' | 'OUTDOOR') {
  this.activeFilter = filterType;

  if (filterType === 'ALL') {
    this.filteredZones = [...this.parkingZones];
  } else if (filterType === 'COVERED') {
    this.filteredZones = this.parkingZones.filter(
      (feature) => feature.properties?.featureKind === 'spot'
    );
  } else if (filterType === 'OUTDOOR') {
    this.filteredZones = this.parkingZones.filter(
      (feature) => feature.properties?.featureKind === 'zone'
    );
  }
  this.refreshMapData();
}

  refreshMapData() {
    if (!this.map) return;
    
    this.closeSidebar();

    if (this.map.getSource('parking-zones-source')) {
      const updatedGeoJson = {
        ...this.rawGeoJson,
        features: this.filteredZones
      };
      (this.map.getSource('parking-zones-source') as maplibregl.GeoJSONSource).setData(updatedGeoJson);
    }

    this.addMarkersToMap();
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

selectNearestZone(userLat: number, userLng: number) {
    if (!this.map || !this.filteredZones.length) return;

    let insideZone: any = null;

    this.filteredZones.forEach((feature: any) => {
      if (feature.geometry?.type === 'Polygon') {
        const coords = feature.geometry.coordinates[0];
        if (this.isPointInPolygon(userLat, userLng, coords)) {
          insideZone = feature;
        }
      }
    });

    if (insideZone) {
      this.selectedZone = insideZone.properties;

      const featureId = insideZone.id as string | number;
      if (featureId !== undefined && featureId !== null) {
        if (this.clickedZoneId !== null) {
          this.map.setFeatureState(
            { source: 'parking-zones-source', id: this.clickedZoneId as any },
            { clicked: false }
          );
        }
        this.clickedZoneId = featureId;
        this.map.setFeatureState(
          { source: 'parking-zones-source', id: this.clickedZoneId as any },
          { clicked: true }
        );
      }

      this.cdr.detectChanges();
    }
}

isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0];
      const xj = polygon[j][1], yj = polygon[j][0];

      const intersect = ((yi > lng) !== (yj > lng))
          && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
}

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; 
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }

  detectCity(lat: number, lng: number): string | null {
    const cities = [
      { name: 'Budapest', lat: 47.497, lng: 19.040, radius: 0.15 },
      { name: 'Pécs', lat: 46.072, lng: 18.233, radius: 0.25 },
      { name: 'Debrecen', lat: 47.531, lng: 21.625, radius: 0.10 },
      { name: 'Győr',     lat: 47.687, lng: 17.634, radius: 0.08 }
    ];

    for (const city of cities) {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < city.radius) {
        return city.name;
      }
    }
    return null;
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

          this.route.queryParams.subscribe(params => {
            if (params['type']) {
              const type = params['type'].toUpperCase() as 'COVERED' | 'OUTDOOR';
              if (type === 'COVERED' || type === 'OUTDOOR') {
                this.setFilter(type);
              }
            }
          });
        }

  if (navigator.geolocation) {
          let userMarker: maplibregl.Marker | null = null;
          let bestAccuracy = 9999;
          
          let lastLat: number | null = null;
          let lastLng: number | null = null;

          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              const userLng = position.coords.longitude;
              const userLat = position.coords.latitude;
              const accuracy = position.coords.accuracy;

              let distanceMoved = 0;
              if (lastLat !== null && lastLng !== null) {
                distanceMoved = this.calculateDistance(lastLat, lastLng, userLat, userLng);
              }

          
              if (!userMarker || distanceMoved > 20 || accuracy < bestAccuracy - 20) {
                
                lastLat = userLat;
                lastLng = userLng;
                
                if (accuracy < bestAccuracy) {
                    bestAccuracy = accuracy;
                }

                if (!userMarker) {
                  const el = document.createElement('div');
                  el.style.width = '16px';
                  el.style.height = '16px';
                  el.style.borderRadius = '50%';
                  el.style.backgroundColor = '#4285F4';
                  el.style.border = '3px solid white';
                  el.style.boxShadow = '0 0 8px rgba(66,133,244,0.5)';

                  userMarker = new maplibregl.Marker({ element: el })
                    .setLngLat([userLng, userLat])
                    .addTo(this.map);
                    
                  this.map.flyTo({ center: [userLng, userLat], zoom: 14 });
                } else {
                  userMarker.setLngLat([userLng, userLat]);
                }

                const detectedCity = this.detectCity(userLat, userLng);
                if (detectedCity) {
                  this.parkingService.searchByCityName(detectedCity).subscribe(data => {
                    if (data.length > 0) {
                      this.parkingSpots = data;
                      this.allSpots = data;
                    }
                  });
                }

                setTimeout(() => {
                  this.selectNearestZone(userLat, userLng);
                }, 1000);
              }

              if (accuracy <= 20) {
                navigator.geolocation.clearWatch(watchId);
              }
            },
            (error) => {
              console.log('Geolokáció nem elérhető:', error.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
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
    }
}

 loadMapData() {
    this.isLoading = true;
    this.mapService.getMapData().subscribe({
      next: (geoJson) => {
        this.rawGeoJson = geoJson;
        this.parkingZones = geoJson.features || [];
        this.filteredZones = [...this.parkingZones]; 
        this.isLoading = false;

        this.route.queryParams.subscribe(params => {
          if (params['type']) {
            const type = params['type'].toUpperCase();
            if (type === 'COVERED' || type === 'OUTDOOR') {
              this.setFilter(type);
            }
          }
        });

        if (this.map && this.map.loaded()) {
          this.renderMapData();
        }
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
}

  renderMapData() {
    if (!this.map.getSource('parking-zones-source')) {
      this.map.addSource('parking-zones-source', {
        type: 'geojson',
        data: {
          ...this.rawGeoJson,
          features: this.filteredZones 
        }
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
            '#26b1cc'   
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            0.6,       
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
            '#1a8b9e'  
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'clicked'], false],
            3,
            2           
          ]
        },
        filter: ['==', '$type', 'Polygon']
      });

const size = 30;
const canvas = document.createElement('canvas');
canvas.width = size;
canvas.height = size;
const ctx = canvas.getContext('2d');

if (ctx) {
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#1a8b9e'; 
  ctx.lineWidth = 2; 
  ctx.stroke();

  if (!this.map.hasImage('zone-circle')) {
  if (!this.map.hasImage('zone-circle')) {
    const imageData = ctx.getImageData(0, 0, size, size);
    
    this.map.addImage('zone-circle', imageData);
  }
  }
}


this.map.addLayer({
    id: 'zones-label',
    type: 'symbol',
    source: 'parking-zones-source',
    layout: {
      'icon-image': 'zone-circle', 
      'icon-allow-overlap': true,
      
      'text-field': ['get', 'zoneCode'],
      'text-size': 14,
      'text-font': ['Open Sans Bold'],
      'text-allow-overlap': true,
      
      'text-anchor': 'center',
      'icon-text-fit': 'none' 
    },
    paint: {
      'text-color': '#1a8b9e', 
     
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
        .setData({
          ...this.rawGeoJson,
          features: this.filteredZones 
        });
    }

    this.addMarkersToMap();
  }

  addMarkersToMap() {
    if (!this.filteredZones.length) {
      this.markers.forEach(m => m.remove());
      this.markers = [];
      return;
    }

    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.filteredZones.forEach((feature) => {
      const kind = feature.properties?.featureKind;
      if (kind !== 'spot') return;

      if (feature.geometry?.type === 'Point') {
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        if (lng === 0 && lat === 0) return;

        const isCovered = feature.properties?.parking_type === 'COVERED';

        const el = document.createElement('div');
        el.className = `custom-marker ${isCovered ? 'marker-covered' : 'marker-outdoor'}`;
        el.innerHTML = isCovered ? '<i class="bi bi-house-door-fill"></i>' : '<span>P</span>';

    el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeSidebar();
          
          const spotId = feature.id || feature.properties?.id;
          
          const fullSpotData = this.allSpots.find(s => Number(s.id) === Number(spotId));
          
          this.selectedZone = fullSpotData || feature.properties;
          
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