import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user';
import { VehicleService } from '../../core/services/vehicle.service';

import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private vehicleService = inject(VehicleService);
  
  userData: any = null;
  vehicles: any[] = [];
  isLoading = true;
  showAddForm = false;
  newVehicle = { licensePlate: '', brand: '', model: '', color: '' };

  ngOnInit() {
    this.loadUserProfile();
    this.loadVehicles();
  }

  loadUserProfile() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) { this.isLoading = false; return; }

    this.userService.getUserProfile(Number(userId)).subscribe({
      next: (data) => { this.userData = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }
formatPlate() {
    let plate = this.newVehicle.licensePlate.toUpperCase().replace(/-/g, '');
    this.newVehicle.licensePlate = plate;
}

isPlateValid(): boolean {
    const plate = this.newVehicle.licensePlate.replace(/-/g, '');
    return /^[A-Z]{3}\d{3,4}$/.test(plate) || /^[A-Z]{4}\d{3,4}$/.test(plate);
}

  loadVehicles() {
    this.vehicleService.getMyVehicles().subscribe({
      next: (data) => this.vehicles = data,
      error: (err) => console.error('Járművek betöltési hiba:', err)
    });
  }

addVehicle() {
    if (!this.newVehicle.licensePlate || !this.newVehicle.brand) {
      alert('Rendszám és márka megadása kötelező!');
      return;
    }

    if (!this.isPlateValid()) {
      alert('Érvénytelen rendszám formátum! Helyes: ABC-1234 vagy AABB-1234');
      return;
    }

    let plate = this.newVehicle.licensePlate.replace(/-/g, '');
    if (plate.length === 6) {
      plate = plate.slice(0, 3) + '-' + plate.slice(3);
    } else if (plate.length === 7 && /^[A-Z]{3}/.test(plate)) {
      plate = plate.slice(0, 3) + '-' + plate.slice(3);
    } else if (plate.length === 7 && /^[A-Z]{4}/.test(plate)) {
      plate = plate.slice(0, 4) + '-' + plate.slice(4);
    } else if (plate.length === 8) {
      plate = plate.slice(0, 4) + '-' + plate.slice(4);
    }

    const vehicleData = { ...this.newVehicle, licensePlate: plate };

    this.vehicleService.addVehicle(vehicleData).subscribe({
      next: () => {
        this.loadVehicles();
        this.newVehicle = { licensePlate: '', brand: '', model: '', color: '' };
        this.showAddForm = false;
      },
      error: () => alert('Hiba a jármű mentésekor!')
    });
}
  setDefaultVehicle(id: number) {
    this.vehicleService.setDefault(id).subscribe({
      next: () => this.loadVehicles()
    });
  }

  deleteVehicle(id: number) {
    if (confirm('Biztosan törölni szeretnéd ezt a járművet?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => this.loadVehicles(),
        error: () => alert('Hiba a törlés során!')
      });
    }
  }
}