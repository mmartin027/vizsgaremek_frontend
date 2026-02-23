import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCardsComponent } from './map-cards.component';

describe('MapCardsComponent', () => {
  let component: MapCardsComponent;
  let fixture: ComponentFixture<MapCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapCardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
