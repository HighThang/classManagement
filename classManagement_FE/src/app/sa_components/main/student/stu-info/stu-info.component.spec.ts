import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuInfoComponent } from './stu-info.component';

describe('StuInfoComponent', () => {
  let component: StuInfoComponent;
  let fixture: ComponentFixture<StuInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
