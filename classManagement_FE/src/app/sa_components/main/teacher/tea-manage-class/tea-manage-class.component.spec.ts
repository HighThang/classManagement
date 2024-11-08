import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaManageClassComponent } from './tea-manage-class.component';

describe('TeaManageClassComponent', () => {
  let component: TeaManageClassComponent;
  let fixture: ComponentFixture<TeaManageClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaManageClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaManageClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
