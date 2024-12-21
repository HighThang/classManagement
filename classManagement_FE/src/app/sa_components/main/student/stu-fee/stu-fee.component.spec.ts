import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StuFeeComponent } from './stu-fee.component';

describe('StuFeeComponent', () => {
  let component: StuFeeComponent;
  let fixture: ComponentFixture<StuFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StuFeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StuFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
