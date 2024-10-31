import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTeaComponent } from './manage-tea.component';

describe('ManageTeaComponent', () => {
  let component: ManageTeaComponent;
  let fixture: ComponentFixture<ManageTeaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageTeaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageTeaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
