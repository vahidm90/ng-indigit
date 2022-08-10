import { Component } from '@angular/core';
import { TDigitGroupOption, IPrettyFloatDecimalParam } from 'ng-indigit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  value!: number | null;
  allowNegative: boolean = false;
  decimalOptions!: IPrettyFloatDecimalParam;
  integerDigitGroupingOptions!: TDigitGroupOption;
  decimalDigitGroupingOptions!: TDigitGroupOption;

  constructor() {}

  applyDecimalOptions(options: IPrettyFloatDecimalParam): void {
    this.decimalOptions = { ...this.decimalOptions, ...options };
  }

}
