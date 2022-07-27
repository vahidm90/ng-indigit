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
  decimalOptions!: Partial<IPrettyFloatDecimalParam>;
  integerDigitGroupingOptions!: TDigitGroupOption;
  decimalDigitGroupingOptions!: TDigitGroupOption;

  constructor() {}

  applyDecimalOptions(options: Partial<IPrettyFloatDecimalParam>): void {
    this.decimalOptions = { ...this.decimalOptions, ...options };
  }

}
