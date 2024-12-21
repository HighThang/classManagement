import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaScheduleComponent } from './tea-schedule.component';

describe('TeaScheduleComponent', () => {
  let component: TeaScheduleComponent;
  let fixture: ComponentFixture<TeaScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
