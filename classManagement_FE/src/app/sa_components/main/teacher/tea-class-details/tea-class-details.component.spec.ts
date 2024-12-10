import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaClassDetailsComponent } from './tea-class-details.component';

describe('TeaClassDetailsComponent', () => {
  let component: TeaClassDetailsComponent;
  let fixture: ComponentFixture<TeaClassDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaClassDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaClassDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
