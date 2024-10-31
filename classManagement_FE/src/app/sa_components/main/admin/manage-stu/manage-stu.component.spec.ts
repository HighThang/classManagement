import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStuComponent } from './manage-stu.component';

describe('ManageStuComponent', () => {
  let component: ManageStuComponent;
  let fixture: ComponentFixture<ManageStuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageStuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
