import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; 
import { CardComponent, ParkingSpotDto } from '../../shared/components/card/card.component';
import { ParkingService } from '../../core/services/parking';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FormsModule } from '@angular/forms'; 
import { forkJoin } from 'rxjs'; 

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CardComponent, HeaderComponent, FormsModule],
  templateUrl: 'parking-search.component.html',
  styleUrls: ['parking-search.component.css']
})
export class ParkingSearchComponent implements OnInit {
  allSpots: ParkingSpotDto[] = []; 
  parkingSpots: ParkingSpotDto[] = []; 

  searchQuery: string = '';
  isLoading: boolean = true; 

  selectedSort: string = 'recommended'; 
  selectedTypeFilter: string = 'all';
  selectedCityFilter: string = 'all'; 

  cityToIdMap: { [key: string]: number } = {
    'Budapest': 1,
    'Debrecen': 2,
    'Győr': 3,
    'Pécs': 4,
  };

  constructor(
    private parkingService: ParkingService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        const urlCity = params['city'] || '';
        
        if (urlCity && this.cityToIdMap[urlCity]) {
            this.selectedCityFilter = urlCity; 
        } else {
            this.selectedCityFilter = 'all'; 
        }

        this.fetchAllSpots();
    });
  }

  fetchAllSpots() {
    this.isLoading = true;
    const allCityIds = Object.values(this.cityToIdMap); 
    
    const requests = allCityIds.map(id => this.parkingService.searchByCity(id));

    forkJoin(requests).subscribe({
      next: (results) => {
        let combinedSpots = results.flat();
        
        const uniqueIds = new Set();
        this.allSpots = combinedSpots.filter(spot => {
            if (uniqueIds.has(spot.id)) return false;
            uniqueIds.add(spot.id);
            return true;
        });

        this.isLoading = false;
        this.applyFiltersAndSort(); 
      },
      error: (err) => {
        this.isLoading = false;
        this.allSpots = [];
        this.applyFiltersAndSort();
      }
    });
  }

  onCityFilterChange() {
  
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let result = [...this.allSpots]; 

    
    if (this.selectedCityFilter !== 'all') {
      const cityLower = this.selectedCityFilter.toLowerCase();
      result = result.filter(spot => 
        (spot.address && spot.address.toLowerCase().includes(cityLower)) ||
        (spot.name && spot.name.toLowerCase().includes(cityLower))
      );
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
        const q = this.searchQuery.toLowerCase().trim();
        result = result.filter(spot =>
            (spot.name && spot.name.toLowerCase().includes(q)) ||
            (spot.address && spot.address.toLowerCase().includes(q))
        );
    }

    if (this.selectedTypeFilter !== 'all') {
      result = result.filter(spot => {
        const pType = spot.parkingType ? spot.parkingType.toUpperCase() : '';
        if (this.selectedTypeFilter === 'covered') return pType === 'COVERED';
        if (this.selectedTypeFilter === 'open') return pType === 'OUTDOOR';
        return true;
      });
    }

    switch (this.selectedSort) {
      case 'az':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'za':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'price_asc':
        result.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
        break;
    }

    this.parkingSpots = result;
  }

  onSearchChange(query: string) {
      this.searchQuery = query;
      this.applyFiltersAndSort();
  }

  openMapView() {
    this.router.navigate(['/map']);
  }

  handleViewDetails(id: number) {
    this.router.navigate(['/booking', id]); 
  }
}