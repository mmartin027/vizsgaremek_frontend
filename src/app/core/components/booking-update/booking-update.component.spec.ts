import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingUpdateComponent } from './booking-update.component';

describe('BookingUpdateComponent', () => {
  let component: BookingUpdateComponent;
  let fixture: ComponentFixture<BookingUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
