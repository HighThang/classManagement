import { TestBed } from '@angular/core/testing';

import { ClassDetailService } from './class-detail.service';

describe('ClassDetailService', () => {
  let service: ClassDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
