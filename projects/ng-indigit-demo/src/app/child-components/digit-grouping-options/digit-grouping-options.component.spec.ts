import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitGroupingOptionsComponent } from './digit-grouping-options.component';

describe('DigitGroupingOptionsComponent', () => {
  let component: DigitGroupingOptionsComponent;
  let fixture: ComponentFixture<DigitGroupingOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DigitGroupingOptionsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitGroupingOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
