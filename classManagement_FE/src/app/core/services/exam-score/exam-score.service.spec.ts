import { TestBed } from '@angular/core/testing';

import { ExamScoreService } from './exam-score.service';

describe('ExamScoreService', () => {
  let service: ExamScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
