import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin-service';
import * as maplibregl from 'maplibre-gl';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  
  activeTab: string = 'users'; 
  
  users: any[] = [];
  parkingSpots: any[] = [];
  bookings: any[] = []; 
  zones: any[] = []; 

  newZone: any = { name: '', zoneCode: '', hourlyRate: 0, mapId: '', polygonData: '' };
  newSpot: any = { name: '', address: '', hourlyRate: 0, capacity: 0, isActive: true, latitude: null, longitude: null, zoneId: null };

  adminService = inject(AdminService);
  router = inject(Router);

  // Térkép változók
  map: any;
  marker?: maplibregl.Marker;
  polygonCoords: number[][] = [];
  mapTilerKey = '7Mo9PlVhPKdZGr1FvyYI'; 

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
      this.map.addSource('zone-source', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this.map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone-source', paint: { 'fill-color': '#26b1cc', 'fill-opacity': 0.4 } });
      this.map.addLayer({ id: 'zone-outline', type: 'line', source: 'zone-source', paint: { 'line-color': '#1a8b9e', 'line-width': 3 } });
    });

    this.map.on('click', (e: any) => {
      this.polygonCoords.push([e.lngLat.lng, e.lngLat.lat]);
      let drawCoords = [...this.polygonCoords];
      if (drawCoords.length > 2) drawCoords.push(drawCoords[0]); // Alakzat bezárása

      const geojson: any = { type: 'Feature', geometry: { type: drawCoords.length < 3 ? 'LineString' : 'Polygon', coordinates: drawCoords.length < 3 ? drawCoords : [drawCoords] } };
      const source = this.map.getSource('zone-source') as maplibregl.GeoJSONSource;
      if (source) source.setData(geojson);
    });
  }

  // ---  A PARKOLÓ TÉRKÉP (Gombostű) ---
  initSpotMap() {
    this.map = new maplibregl.Map({
      container: 'admin-map-spots', 
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.mapTilerKey}`,
      center: [18.2323, 46.0727],
      zoom: 13
    });

    this.map.on('click', (e: any) => {
      const lngLat = e.lngLat;
      this.newSpot.longitude = lngLat.lng;
      this.newSpot.latitude = lngLat.lat;

      if (!this.marker) {
        this.marker = new maplibregl.Marker({ color: "#FF0000" }).setLngLat([lngLat.lng, lngLat.lat]).addTo(this.map);
      } else {
        this.marker.setLngLat([lngLat.lng, lngLat.lat]);
      }
    });
  }

  clearPolygon() {
    this.polygonCoords = [];
    const source = this.map.getSource('zone-source') as maplibregl.GeoJSONSource;
    if (source) source.setData({ type: 'FeatureCollection', features: [] });
  }

  // --- ADATOK LEKÉRÉSE ---
  loadUsers() { this.adminService.getAllUsers().subscribe({ next: (data) => this.users = data }); }
  loadParkingSpots() { this.adminService.getAllParkingSpots().subscribe({ next: (data) => this.parkingSpots = data }); }
  loadBookings() { this.adminService.getAllBookings().subscribe({ next: (data) => this.bookings = data }); }
  loadZones() { this.adminService.getAllZones().subscribe({ next: (data) => this.zones = data }); }

  // --- ZÓNÁK MENTÉSE ÉS TÖRLÉSE ---
  addZone() {
    if (!this.newZone.name || this.polygonCoords.length < 3) {
      alert('Kérlek add meg a zóna nevét, és rajzolj egy legalább 3 pontból álló területet!');
      return;
    }
    this.newZone.polygonData = JSON.stringify(this.polygonCoords); 
    
    this.adminService.addZone(this.newZone).subscribe({
      next: () => {
        alert('Zóna mentve! 🎉');
        this.loadZones();
        this.newZone = { name: '', zoneCode: '', hourlyRate: 0, mapId: '', polygonData: '' };
        this.clearPolygon();
      },
      error: (err) => alert('Hiba a zóna mentésekor!')
    });
  }

  deleteZone(id: number) {
    if (confirm('Biztosan törlöd ezt a zónát?')) {
      this.adminService.deleteZone(id).subscribe({
        next: (msg) => { alert(msg); this.loadZones(); },
        error: (err) => alert('Hiba a zóna törlésekor!')
      });
    }
  }

  // --- PARKOLÓK MENTÉSE ÉS TÖRLÉSE ---
  addSpot() {
    if (!this.newSpot.name || !this.newSpot.latitude) {
      alert('Töltsd ki a nevet, és tegyél le egy gombostűt a térképre!');
      return;
    }
    this.adminService.addParkingSpot(this.newSpot).subscribe({
      next: () => {
        alert('Parkoló mentve! 🎉');
        this.loadParkingSpots();
        this.newSpot = { name: '', address: '', hourlyRate: 0, capacity: 0, isActive: true, latitude: null, longitude: null, zoneId: null };
        if (this.marker) { this.marker.remove(); this.marker = undefined; }
      },
      error: (err) => alert('Hiba a parkoló mentésekor!')
    });
  }

  deleteSpot(id: number) {
    if (confirm('Biztosan törlöd ezt a parkolóhelyet?')) {
      this.adminService.deleteParkingSpot(id).subscribe({
        next: (msg) => { alert(msg); this.loadParkingSpots(); },
        error: (err) => alert('Hiba a törlés során!')
      });
    }
  }

 
  cancelBooking(id: number) {
    if (confirm('Biztosan le szeretnéd mondani/törölni ezt a foglalást?')) {
      this.adminService.cancelBooking(id).subscribe({
        next: (response) => { alert(response); this.loadBookings(); },
        error: (err) => alert(err.error || 'Hiba történt a foglalás törlésekor!')
      });
    }
  }

  goToFrontend() { 
    this.router.navigate(['/']); 
  }

  logout() {
    if (confirm('Biztosan ki szeretnél jelentkezni?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      this.router.navigate(['/login']);
    }
  }
} 