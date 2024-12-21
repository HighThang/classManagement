import { TestBed } from '@angular/core/testing';

import { CheckJoinClassRequestService } from './check-join-class-request.service';

describe('CheckJoinClassRequestService', () => {
  let service: CheckJoinClassRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckJoinClassRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
