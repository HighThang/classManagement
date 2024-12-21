import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaAttendanceComponent } from './tea-attendance.component';

describe('TeaAttendanceComponent', () => {
  let component: TeaAttendanceComponent;
  let fixture: ComponentFixture<TeaAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
