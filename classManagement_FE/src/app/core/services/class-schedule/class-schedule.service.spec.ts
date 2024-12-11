import { TestBed } from '@angular/core/testing';

import { ClassScheduleService } from './class-schedule.service';

describe('ClassScheduleService', () => {
  let service: ClassScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
