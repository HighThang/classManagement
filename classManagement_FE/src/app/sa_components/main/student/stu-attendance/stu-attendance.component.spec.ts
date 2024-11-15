import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuAttendanceComponent } from './stu-attendance.component';

describe('StuAttendanceComponent', () => {
  let component: StuAttendanceComponent;
  let fixture: ComponentFixture<StuAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
