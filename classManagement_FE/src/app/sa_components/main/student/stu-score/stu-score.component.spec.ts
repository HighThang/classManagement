import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuScoreComponent } from './stu-score.component';

describe('StuScoreComponent', () => {
  let component: StuScoreComponent;
  let fixture: ComponentFixture<StuScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
