import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecimalOptionsComponent } from './decimal-options.component';

describe('DecimalOptionsComponent', () => {
  let component: DecimalOptionsComponent;
  let fixture: ComponentFixture<DecimalOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DecimalOptionsComponent]
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecimalOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
