import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuClassDetailComponent } from './stu-class-detail.component';

describe('StuClassDetailComponent', () => {
  let component: StuClassDetailComponent;
  let fixture: ComponentFixture<StuClassDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuClassDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuClassDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
