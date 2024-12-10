import { TestBed } from '@angular/core/testing';

import { ClassAttendanceService } from './class-attendance.service';

describe('ClassAttendanceService', () => {
  let service: ClassAttendanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassAttendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
