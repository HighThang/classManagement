import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaPaymentComponent } from './tea-payment.component';

describe('TeaPaymentComponent', () => {
  let component: TeaPaymentComponent;
  let fixture: ComponentFixture<TeaPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
