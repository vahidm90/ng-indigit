import { Component, EventEmitter, Output } from '@angular/core';
import { DetailedDigitGroupingParameters, DigitGroupDelimiter } from 'ng-indigit';
import { TDigitGroupingParameters } from '../../../interfaces/digit-grouping-option.type';

@Component({
  selector: 'app-digit-grouping-options',
  templateUrl: './digit-grouping-options.component.html',
  styleUrls: ['./digit-grouping-options.component.scss']
})
export class DigitGroupingOptionsComponent {

  digitGroupingParams!: TDigitGroupingParameters;
  allowedDigitGroupDelimiters: DigitGroupDelimiter[] = [',', ' ', '`', '-'];
  enableDigitGrouping: boolean = true;
  enableIntDigitGrouping: boolean = true;
  enableDecimalDigitGrouping: boolean = false;
  decimalDigitGroupingParams: DetailedDigitGroupingParameters = { groupSize: 3, delimiter: ' ' };
  intDigitGroupingParams: DetailedDigitGroupingParameters = { groupSize: 3, delimiter: ',' };

  @Output() digitGroupingOptionsChange = new EventEmitter<TDigitGroupingParameters>();

  constructor() { }

  refreshDigitGroupingParams(): void {
    const decimalParams: DetailedDigitGroupingParameters | boolean
      = this.enableDecimalDigitGrouping ? { ...this.decimalDigitGroupingParams } : false;
    const intParams: DetailedDigitGroupingParameters | boolean
      = this.enableIntDigitGrouping ? { ...this.intDigitGroupingParams } : false;
    this.digitGroupingParams
      = this.enableDigitGrouping ? { decimalDigitGroups: decimalParams, integerDigitGroups: intParams } : false;
  }

}
