import { Component, Input } from '@angular/core';
import { TDigitGroupOption, BASIC_UTIL, IPrettyFloatDecimalParam } from 'ng-indigit';

@Component({
  selector: 'app-template-driven',
  templateUrl: './template-driven.component.html',
  styleUrls: ['./template-driven.component.scss']
})
export class TemplateDrivenComponent {

  @Input()
  set decimalOptions(value: IPrettyFloatDecimalParam) {
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

  decimal!: IPrettyFloatDecimalParam;
  integerDigitGrouping!: TDigitGroupOption;
  decimalDigitGrouping!: TDigitGroupOption;
  negative!: boolean;
  value!: number;

  constructor() { }

}
