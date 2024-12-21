import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuCourseComponent } from './stu-course.component';

describe('StuCourseComponent', () => {
  let component: StuCourseComponent;
  let fixture: ComponentFixture<StuCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
