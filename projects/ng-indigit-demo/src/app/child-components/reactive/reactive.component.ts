import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IDecimalOptionModel } from '../../../interfaces/decimal-option.model';
import { TDigitGroupingParameters } from '../../../interfaces/digit-grouping-option.type';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

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
  formGroup!: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formGroup = this._formBuilder.group({ value: [null] });
  }

}
