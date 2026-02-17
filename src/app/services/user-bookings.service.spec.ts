import { TestBed } from '@angular/core/testing';

import { UserBookingsService } from './user-bookings.service';

describe('UserBookingsService', () => {
  let service: UserBookingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserBookingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
