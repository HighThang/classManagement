import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaCourseComponent } from './tea-course.component';

describe('TeaCourseComponent', () => {
  let component: TeaCourseComponent;
  let fixture: ComponentFixture<TeaCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaCourseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
