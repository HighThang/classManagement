import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaFeeComponent } from './tea-fee.component';

describe('TeaFeeComponent', () => {
  let component: TeaFeeComponent;
  let fixture: ComponentFixture<TeaFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaFeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
