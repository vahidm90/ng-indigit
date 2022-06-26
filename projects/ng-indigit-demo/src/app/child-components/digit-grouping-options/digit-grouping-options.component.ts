import { Component, EventEmitter, Output } from '@angular/core';
import { IDigitGroupParameter, TDigitGroupConfig, TDigitGroupDelimiter } from 'ng-indigit';
import { TFloatPart } from '../../../../../ng-indigit/src/lib/types';

@Component({
  selector: 'app-digit-grouping-options',
  templateUrl: './digit-grouping-options.component.html',
  styleUrls: ['./digit-grouping-options.component.scss']
})
export class DigitGroupingOptionsComponent {

  decimalDigitGroupingConfig!: TDigitGroupConfig<boolean | IDigitGroupParameter>;
  integerDigitGroupingConfig!: TDigitGroupConfig<boolean | IDigitGroupParameter>;
  allowedDigitGroupDelimiters: TDigitGroupDelimiter[] = [',', ' ', '`', '-'];
  enableDigitGrouping: boolean = true;
  integerIsGrouped: boolean = true;
  decimalIsGrouped: boolean = false;
  decimalDigitGroupingParams: IDigitGroupParameter = { groupSize: 3, delimiter: ' ' };
  integerDigitGroupingParams: IDigitGroupParameter = { groupSize: 3, delimiter: ',' };

  @Output() integerDigitGroupingOptionsChange = new EventEmitter<TDigitGroupConfig<boolean | IDigitGroupParameter>>();
  @Output() decimalDigitGroupingOptionsChange = new EventEmitter<TDigitGroupConfig<boolean | IDigitGroupParameter>>();

  constructor() { }

  toggleDigitGroupingParams(): void {
    const parts: TFloatPart[] = ['integer', 'decimal'];
    parts.forEach(p => {
      this[`${p}IsGrouped`] = this.enableDigitGrouping;
      this.refreshDigitGroupingParams(p);
    });
  }

  refreshDigitGroupingParams(part: TFloatPart): void {
    this[`${part}DigitGroupingConfig`] = this[`${part}IsGrouped`] ? { ...this[`${part}DigitGroupingParams`] } : false;
    this[`${part}DigitGroupingOptionsChange`].emit(this[`${part}DigitGroupingConfig`]);
  }

}
