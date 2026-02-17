import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBookingCardComponent } from './user-booking-card.component';

describe('UserBookingCardComponent', () => {
  let component: UserBookingCardComponent;
  let fixture: ComponentFixture<UserBookingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBookingCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserBookingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
