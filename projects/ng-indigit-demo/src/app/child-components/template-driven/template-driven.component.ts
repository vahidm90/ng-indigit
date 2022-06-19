import { Component, Input } from '@angular/core';
import { IDecimalOptionModel } from '../../../interfaces/decimal-option.model';
import { TDigitGroupingParameters } from '../../../interfaces/digit-grouping-option.type';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

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
  set digitGroupingOptions(value: TDigitGroupingParameters) {
    this.digitGrouping = value;
  }

  @Input()
  set allowNegative(value: any) {
    this.negative = coerceBooleanProperty(value);
  }

  decimal!: IDecimalOptionModel;
  digitGrouping!: TDigitGroupingParameters;
  negative!: boolean;
  value!: number;

  constructor() { }

}
