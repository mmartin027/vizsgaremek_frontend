import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin-service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'] 
})
export class AdminComponent implements OnInit {

  bookings: any[] = [];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.adminService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        console.log('Foglalások sikeresen betöltve:', this.bookings);
      },
      error: (err) => {
        console.error('Hiba történt az adatok lekérésekor', err);
      }
    });
  }

  cancelBooking(id: number): void {
    if (confirm('Biztosan törölni szeretnéd ezt a foglalást?')) {
      this.adminService.cancelBooking(id).subscribe({
        next: (response) => {
          alert('Foglalás sikeresen törölve!');
          this.loadBookings(); 
        },
        error: (err) => {
          alert('Hiba történt a törlés során!');
        }
      });
    }
  }
}