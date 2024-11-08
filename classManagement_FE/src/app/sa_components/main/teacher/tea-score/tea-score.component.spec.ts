import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaScoreComponent } from './tea-score.component';

describe('TeaScoreComponent', () => {
  let component: TeaScoreComponent;
  let fixture: ComponentFixture<TeaScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeaScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeaScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
