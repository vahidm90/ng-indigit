import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BASIC_UTIL, TDigitGroupOption, IPrettyFloatDecimalParam } from 'ng-indigit';

@Component({
  selector: 'app-reactive',
  templateUrl: './reactive.component.html',
  styleUrls: ['./reactive.component.scss']
})
export class ReactiveComponent implements OnInit {

  @Input()
  set decimalOptions(value: Partial<IPrettyFloatDecimalParam>) {
    this.decimal = value;
  }

  @Input()
  set integerDigitGroupingOptions(value: TDigitGroupOption) {
    this.integerDigitGrouping = value;
  }

  @Input()
  set decimalDigitGroupingOptions(value: TDigitGroupOption) {
    this.decimalDigitGrouping = value;
  }

  @Input()
  set allowNegative(value: any) {
    this.negative = BASIC_UTIL.makeBoolean(value);
  }

  decimal!: Partial<IPrettyFloatDecimalParam>;
  integerDigitGrouping!: TDigitGroupOption;
  decimalDigitGrouping!: TDigitGroupOption;
  negative!: boolean;
  formGroup!: UntypedFormGroup;

  constructor(private _formBuilder: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({ value: [null] });
  }

}
