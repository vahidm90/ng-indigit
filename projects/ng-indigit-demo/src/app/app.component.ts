import { Component } from '@angular/core';
import { IDecimalOptionModel } from '../interfaces/decimal-option.model';
import { TDigitGroupingParameters } from '../interfaces/digit-grouping-option.type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  value!: number | null;
  allowNegative: boolean = false;
  decimalOptions!: IDecimalOptionModel;
  digitGroupingOptions!: TDigitGroupingParameters;

  constructor() {}

  applyDecimalOptions(options: Partial<IDecimalOptionModel>): void {
    this.decimalOptions = { ...this.decimalOptions, ...options };
  }

}
