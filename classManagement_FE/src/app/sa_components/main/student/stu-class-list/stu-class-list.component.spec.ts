import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuClassListComponent } from './stu-class-list.component';

describe('StuClassListComponent', () => {
  let component: StuClassListComponent;
  let fixture: ComponentFixture<StuClassListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuClassListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuClassListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
