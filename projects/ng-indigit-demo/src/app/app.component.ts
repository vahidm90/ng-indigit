import { Component } from '@angular/core';
import { IDecimalOptionModel } from '../interfaces/decimal-option.model';
import { IDigitGroupParameter, TDigitGroupConfig } from 'ng-indigit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  value!: number | null;
  allowNegative: boolean = false;
  decimalOptions!: IDecimalOptionModel;
  integerDigitGroupingOptions!: TDigitGroupConfig<boolean | IDigitGroupParameter>;
  decimalDigitGroupingOptions!: TDigitGroupConfig<boolean | IDigitGroupParameter>;

  constructor() {}

  applyDecimalOptions(options: Partial<IDecimalOptionModel>): void {
    this.decimalOptions = { ...this.decimalOptions, ...options };
  }

}
