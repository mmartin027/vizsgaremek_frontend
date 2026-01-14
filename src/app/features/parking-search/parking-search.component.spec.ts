import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingSearchComponent } from './parking-search.component';

describe('ParkingSearchComponent', () => {
  let component: ParkingSearchComponent;
  let fixture: ComponentFixture<ParkingSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
