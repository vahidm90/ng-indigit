import { Component, Input } from '@angular/core';
import { IDecimalOptionModel } from '../../../interfaces/decimal-option.model';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { IDigitGroupParameter, TDigitGroupConfig } from 'ng-indigit';

@Component({
  selector: 'app-template-driven',
  templateUrl: './template-driven.component.html',
  styleUrls: ['./template-driven.component.scss']
})
export class TemplateDrivenComponent {

  @Input()
  set decimalOptions(value: IDecimalOptionModel) {
    this.decimal = value;
  }

  @Input()
  set integerDigitGroupingOptions(value: TDigitGroupConfig<boolean | IDigitGroupParameter>) {
    this.integerDigitGrouping = value;
  }

  @Input()
  set decimalDigitGroupingOptions(value: TDigitGroupConfig<boolean | IDigitGroupParameter>) {
    this.decimalDigitGrouping = value;
  }

  @Input()
  set allowNegative(value: any) {
    this.negative = coerceBooleanProperty(value);
  }

  decimal!: IDecimalOptionModel;
  integerDigitGrouping!: TDigitGroupConfig<boolean | IDigitGroupParameter>;
  decimalDigitGrouping!: TDigitGroupConfig<boolean | IDigitGroupParameter>;
  negative!: boolean;
  value!: number;

  constructor() { }

}
