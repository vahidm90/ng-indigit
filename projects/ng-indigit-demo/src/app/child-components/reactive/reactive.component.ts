import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IDecimalOptionModel } from '../../../interfaces/decimal-option.model';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { IDigitGroupParameter, TDigitGroupConfig } from 'ng-indigit';

@Component({
  selector: 'app-reactive',
  templateUrl: './reactive.component.html',
  styleUrls: ['./reactive.component.scss']
})
export class ReactiveComponent implements OnInit {

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
  formGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({ value: [null] });
  }

}
