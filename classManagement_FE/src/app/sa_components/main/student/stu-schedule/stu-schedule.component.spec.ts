import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuScheduleComponent } from './stu-schedule.component';

describe('StuScheduleComponent', () => {
  let component: StuScheduleComponent;
  let fixture: ComponentFixture<StuScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
