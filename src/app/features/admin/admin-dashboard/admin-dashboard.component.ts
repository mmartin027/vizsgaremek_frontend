import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import * as maplibregl from 'maplibre-gl';
import { BookingComponent } from '../../booking/booking.component';
import { AlertService } from '../../../core/services/alert'; 

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
  activeTab: string = 'users';
  
  users: any[] = [];
  parkingSpots: any[] = [];
  bookings: any[] = []; 
  zones: any[] = []; 

  cities = [
    { id: 1, name: 'Budapest' },
    { id: 2, name: 'Pécs' },
    { id: 3, name: 'Debrecen' },
    { id: 4, name: 'Győr' }
  ];

  newZone: any = { name: '', zoneCode: '', hourlyRate: 0, polygonData: '', features: '', cityId: null };
newSpot: any = { name: '', address: '', hourlyRate: 0, capacity: 0, features: '', parkingType: 'COVERED', isActive: true, latitude: null, longitude: null, cityId: null };

  newZoneFile: File | null = null;
  newSpotFile: File | null = null;

  adminService = inject(AdminService);
  router = inject(Router);
  alertService = inject(AlertService); 

  map: any;
  marker?: maplibregl.Marker;
  polygonCoords: number[][] = [];
  mapTilerKey = '7Mo9PlVhPKdZGr1FvyYI'; 
  
  renderedSpotMarkers: maplibregl.Marker[] = []; 

  editingSpotId: number | null = null;
  editingFeatures: string = '';
  editingZoneId: number | null = null;
  editingZoneFeatures: string = '';
  editingSpotPriceId: number | null = null;
  editingSpotPriceValue: number = 0;
  
  editingZonePriceId: number | null = null;
  editingZonePriceValue: number = 0;

  ngOnInit(): void {
    this.loadUsers();
    this.loadParkingSpots();
    this.loadBookings(); 
    this.loadZones(); 
  }

  switchTab(tabName: string) {
    this.activeTab = tabName;
    
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.marker = undefined;
      this.polygonCoords = [];
      this.renderedSpotMarkers = []; 
    }
    
    if (tabName === 'zones') {
      setTimeout(() => this.initZoneMap(), 100);
    } else if (tabName === 'parkingSpots') {
      setTimeout(() => this.initSpotMap(), 100);
    }
  }

  initZoneMap() {
    this.map = new maplibregl.Map({
      container: 'admin-map-zones', 
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.mapTilerKey}`,
      center: [18.2323, 46.0727],
      zoom: 13
    });

    this.map.on('load', () => {
      const existingFeatures = this.zones
        .filter(z => z.polygonData) 
        .map(z => {
          try {
            const geometry = JSON.parse(z.polygonData);
            return {
              type: 'Feature',
              properties: { name: z.name },
              geometry: geometry
            };
          } catch (e) {
            return null;
          }
        }).filter(f => f !== null);

      this.map.addSource('existing-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: existingFeatures as any }
      });

      this.map.addLayer({ 
        id: 'existing-zones-fill', 
        type: 'fill', 
        source: 'existing-zones', 
        paint: { 'fill-color': '#888888', 'fill-opacity': 0.4 } 
      });
      
      this.map.addLayer({ 
        id: 'existing-zones-line', 
        type: 'line', 
        source: 'existing-zones', 
        paint: { 'line-color': '#555555', 'line-width': 2 } 
      });

      this.map.addSource('zone-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this.map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone-source', paint: { 'fill-color': '#26b1cc', 'fill-opacity': 0.4 } });
      this.map.addLayer({ id: 'zone-outline', type: 'line', source: 'zone-source', paint: { 'line-color': '#1a8b9e', 'line-width': 3 } });
    });

    this.map.on('click', (e: any) => {
      this.polygonCoords.push([e.lngLat.lng, e.lngLat.lat]);
      let drawCoords = [...this.polygonCoords];
      if (drawCoords.length > 2) drawCoords.push(drawCoords[0]); 

      const geojson: any = { type: 'Feature', geometry: { type: drawCoords.length < 3 ? 'LineString' : 'Polygon', coordinates: drawCoords.length < 3 ? drawCoords : [drawCoords] } };
      const source = this.map.getSource('zone-source') as maplibregl.GeoJSONSource;
      if (source) source.setData(geojson);
    });
  }

  initSpotMap() {
    this.map = new maplibregl.Map({
      container: 'admin-map-spots', 
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.mapTilerKey}`,
      center: [18.2323, 46.0727],
      zoom: 13
    });

    this.map.on('load', () => {
      this.refreshSpotMarkers(); 
    });

    this.map.on('click', (e: any) => {
      const lngLat = e.lngLat;
      this.newSpot.longitude = lngLat.lng;
      this.newSpot.latitude = lngLat.lat;

      if (!this.marker) {
        this.marker = new maplibregl.Marker({ color: "#FF0000", draggable: true })
          .setLngLat([lngLat.lng, lngLat.lat])
          .addTo(this.map);
          
        this.marker.on('dragend', () => {
          const pos = this.marker!.getLngLat();
          this.newSpot.longitude = pos.lng;
          this.newSpot.latitude = pos.lat;
        });
      } else {
        this.marker.setLngLat([lngLat.lng, lngLat.lat]);
      }
    });
  }


  onNewZoneFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) this.newZoneFile = file;
  }

  removeNewZoneFile(event: Event) {
    event.stopPropagation();
    this.newZoneFile = null;
  }

  onNewSpotFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) this.newSpotFile = file;
  }

  removeNewSpotFile(event: Event) {
    event.stopPropagation();
    this.newSpotFile = null;
  }



  addZone() {
    if (!this.newZone.name || this.polygonCoords.length < 3) {
      this.alertService.error('Hiba', 'Kérlek add meg a zóna nevét, és rajzolj egy legalább 3 pontból álló területet!');
      return;
    }
    
    this.newZone.polygonData = JSON.stringify(this.polygonCoords); 
    
    this.adminService.addZone(this.newZone).subscribe({
      next: (createdZone: any) => {
        if (this.newZoneFile && createdZone && createdZone.id) {
          this.adminService.uploadZoneImage(createdZone.id, this.newZoneFile).subscribe({
            next: () => {
              this.alertService.success('Siker', 'Zóna és kép elmentve!');
              this.resetZoneForm();
            },
            error: () => {
              this.alertService.error('Részleges hiba', 'Zóna elmentve, de a képet nem sikerült feltölteni!');
              this.resetZoneForm();
            }
          });
        } else {
          this.alertService.success('Siker', 'Zóna elmentve (Kép nélkül)!');
          this.resetZoneForm();
        }
      },
      error: (err) => this.alertService.error('Hiba', 'Nem sikerült elmenteni a zónát!')
    });
  }

  resetZoneForm() {
    this.newZone = { name: '', zoneCode: '', hourlyRate: 0, polygonData: '', features: '' };
    this.newZoneFile = null;
    this.clearPolygon();
    this.loadZones();
  }

  addSpot() {
    if (!this.newSpot.name || !this.newSpot.latitude || !this.newSpot.cityId) {
      this.alertService.error('Hiányzó adatok', 'Kérlek töltsd ki a nevet, válaszd ki a várost, és tegyél le egy gombostűt a térképre!')
      ;
      return;
    }

    const payload = { ...this.newSpot, city: { id: Number(this.newSpot.cityId) } };

    // 1. Parkoló mentése
    this.adminService.addParkingSpot(payload).subscribe({
      next: (createdSpot: any) => {
        // 2. Kép feltöltése (ha van)
        if (this.newSpotFile && createdSpot && createdSpot.id) {
          this.adminService.uploadSpotImage(createdSpot.id, this.newSpotFile).subscribe({
            next: () => {
              this.alertService.success('Siker', 'Parkolóhely és kép elmentve!');
              this.resetSpotForm();
            },
            error: () => {
              this.alertService.error('Részleges hiba', 'Parkoló elmentve, de a képet nem sikerült feltölteni!');
              this.resetSpotForm();
            }
          });
        } else {
          this.alertService.success('Siker', 'Parkolóhely hozzáadva (Kép nélkül)!');
          this.resetSpotForm();
        }
      },
      error: (err) => this.alertService.error('Hiba', 'Hiba történt a mentéskor!')
    });
  }

  resetSpotForm() {
    this.newSpot = { name: '', address: '', hourlyRate: 0, capacity: 0, features: '', isActive: true, latitude: null, longitude: null, cityId: null };
    this.newSpotFile = null;
    if (this.marker) { this.marker.remove(); this.marker = undefined; }
    this.loadParkingSpots();
  }


  onZoneImageSelected(event: any, zoneId: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.adminService.uploadZoneImage(zoneId, file).subscribe({
        next: () => {
          this.alertService.success('Szuper!', 'A zóna képe sikeresen frissítve.');
          this.loadZones();
        },
        error: () => this.alertService.error('Hiba', 'Hiba történt a képfeltöltés során!')
      });
    }
  }

  onSpotImageSelected(event: any, spotId: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.adminService.uploadSpotImage(spotId, file).subscribe({
        next: () => {
          this.alertService.success('Szuper!', 'A parkoló képe sikeresen frissítve.');
          this.loadParkingSpots();
        },
        error: () => this.alertService.error('Hiba', 'Hiba történt a képfeltöltés során!')
      });
    }
  }


  refreshSpotMarkers() {
    if (!this.map) return;
    this.renderedSpotMarkers.forEach(m => m.remove());
    this.renderedSpotMarkers = [];
    this.parkingSpots.forEach(spot => this.createSpotMarker(spot));
  }

  startEditSpotPrice(spot: any) {
    this.editingSpotPriceId = spot.id;
    this.editingSpotPriceValue = spot.hourlyRate;
  }

  saveSpotPrice(spotId: number) {
    this.adminService.updateSpotPrice(spotId, this.editingSpotPriceValue).subscribe({
      next: () => { 
        this.alertService.success('Kész', 'Parkoló ára sikeresen frissítve!'); 
        this.editingSpotPriceId = null;
        this.loadParkingSpots(); 
      },
      error: () => this.alertService.error('Hiba', 'Sikertelen ármódosítás!')
    });
  }

  startEditZonePrice(zone: any) {
    this.editingZonePriceId = zone.id;
    this.editingZonePriceValue = zone.hourlyRate;
  }

  saveZonePrice(zoneId: number) {
    this.adminService.updateZonePrice(zoneId, this.editingZonePriceValue).subscribe({
      next: () => { 
        this.alertService.success('Kész', 'Zóna ára sikeresen frissítve!'); 
        this.editingZonePriceId = null;
        this.loadZones(); 
      },
      error: () => this.alertService.error('Hiba', 'Sikertelen ármódosítás!')
    });
  }

  createSpotMarker(spot: any) {
    if (!spot.latitude || !spot.longitude || !this.map) return;

    const el = document.createElement('div');
    el.className = 'existing-spot-marker';
    const isCovered = spot.parkingType === 'COVERED';
    
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.borderRadius = '50%';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.color = 'white';
    el.style.fontSize = '12px';
    el.style.fontWeight = 'bold';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    
    if (isCovered) {
      el.style.backgroundColor = '#0284c7'; 
      el.innerHTML = '<i class="bi bi-house-door-fill"></i>';
    } else {
      el.style.backgroundColor = '#10b981'; 
      el.innerHTML = 'P';
    }

    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(`<strong>${spot.name}</strong><br>${spot.address || 'Nincs cím'}`);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([Number(spot.longitude), Number(spot.latitude)])
      .setPopup(popup)
      .addTo(this.map);
      
    this.renderedSpotMarkers.push(marker); 
  }

  clearPolygon() {
    this.polygonCoords = [];
    const source = this.map.getSource('zone-source') as maplibregl.GeoJSONSource;
    if (source) source.setData({ type: 'FeatureCollection', features: [] });
  }

  loadUsers() { 
    this.adminService.getAllUsers().subscribe({ next: (data) => this.users = data }); 
  }

  loadParkingSpots() { 
    this.adminService.getAllParkingSpots().subscribe({ 
      next: (data) => {
        this.parkingSpots = data;
        if (this.activeTab === 'parkingSpots' && this.map) {
          this.refreshSpotMarkers();
        }
      } 
    }); 
  }

  loadBookings() { 
    this.adminService.getAllBookings().subscribe({ 
      next: (data: any) => this.bookings = data.content.filter((b: any) => b.status !== 'CANCELLED_BY_ADMIN')
    }); 
  }

  loadZones() { 
    this.adminService.getAllZones().subscribe({ next: (data) => this.zones = data }); 
  }

  async deleteSpot(id: number) {
    const isConfirmed = await this.alertService.confirm('Törlés', 'Biztosan törlöd ezt a parkolóhelyet?', 'Törlés');
    if (isConfirmed) {
      this.adminService.deleteParkingSpot(id).subscribe({
        next: () => { 
          this.alertService.success('Törölve', 'A parkolóhely eltávolítva.');
          this.loadParkingSpots(); 
        },
        error: () => this.alertService.error('Hiba', 'Nem sikerült a törlés!')
      });
    }
  }

  async deleteZone(id: number) {
    const isConfirmed = await this.alertService.confirm('Törlés', 'Biztosan törlöd ezt a zónát?', 'Törlés');
    if (isConfirmed) {
      this.adminService.deleteZone(id).subscribe({
        next: () => { 
          this.alertService.success('Siker', 'Zóna törölve.');
          this.loadZones(); 
        },
        error: () => this.alertService.error('Hiba', 'Hiba a zóna törlésekor!')
      });
    }
  }

  async deleteUser(id: number) {
    const isConfirmed = await this.alertService.confirm('Felhasználó törlése', 'Biztosan törölni szeretnéd ezt a felhasználót? (Inaktívvá válik)', 'Törlés');
    if (isConfirmed) {
      this.adminService.deleteUser(id).subscribe({
        next: () => { 
          this.alertService.success('Siker', 'Felhasználó törölve!'); 
          this.loadUsers(); 
        },
        error: (err) => this.alertService.error('Hiba', 'Hiba történt: ' + (err.error || err.message))
      });
    }
  }

  async updateUserRole(userId: number, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;
    
    const isConfirmed = await this.alertService.confirm('Szerepkör váltás', `Biztosan módosítod a jogosultságot erre: ${newRole}?`, 'Módosítás');
    if (isConfirmed) {
      this.adminService.updateUserRole(userId, newRole).subscribe({
        next: () => {
          this.alertService.success('Siker', 'Jogosultság módosítva!');
          this.loadUsers();
        },
        error: () => {
          this.alertService.error('Hiba', 'Nem sikerült a módosítás!');
          this.loadUsers(); 
        }
      });
    } else {
      this.loadUsers(); // Visszaállítja a dropdown-t az eredeti értékre
    }
  }

  async cancelBooking(id: number) {
    const isConfirmed = await this.alertService.confirm('Lemondás', 'Biztosan le szeretnéd mondani ezt a foglalást?', 'Lemondás');
    if (isConfirmed) {
      this.adminService.cancelBooking(id).subscribe({
        next: () => {
          this.alertService.success('Siker', 'Foglalás lemondva!');
          this.loadBookings(); 
        },
        error: () => this.alertService.error('Hiba', 'Nem sikerült a lemondás!')
      });
    }
  }

  saveFeatures(spotId: number) {
    this.adminService.updateSpotFeatures(spotId, this.editingFeatures).subscribe({
      next: () => { 
        this.alertService.success('Kész', 'Szolgáltatások frissítve!'); 
        this.editingSpotId = null;
        this.loadParkingSpots(); 
      },
      error: () => this.alertService.error('Hiba', 'Sikertelen mentés!')
    });
  }

  saveZoneFeatures(zoneId: number) {
    this.adminService.updateZoneFeatures(zoneId, this.editingZoneFeatures).subscribe({
      next: () => { 
        this.alertService.success('Kész', 'Zóna jellemzők frissítve!'); 
        this.editingZoneId = null;
        this.loadZones(); 
      },
      error: () => this.alertService.error('Hiba', 'Sikertelen mentés!')
    });
  }

  startEditFeatures(spot: any) {
    this.editingSpotId = spot.id;
    this.editingFeatures = spot.features || '';
  }

  startEditZoneFeatures(zone: any) {
    this.editingZoneId = zone.id;
    this.editingZoneFeatures = zone.features || '';
  }

  goToFrontend() { 
    this.router.navigate(['/']); 
  }

  async logout() {
    const isConfirmed = await this.alertService.confirm('Kijelentkezés', 'Biztosan ki szeretnél jelentkezni?', 'Kijelentkezés');
    if (isConfirmed) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      this.router.navigate(['/login']);
    }
  }

  getUserRole(user: any): string {
    if (user.role) return user.role;
    if (user.roles && user.roles.length > 0) return user.roles[0].name || user.roles[0];
    return 'USER';
  }
}