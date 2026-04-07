import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedSpotsComponent } from './featured-spots.component';

describe('FeaturedSpotsComponent', () => {
  let component: FeaturedSpotsComponent;
  let fixture: ComponentFixture<FeaturedSpotsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedSpotsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedSpotsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
