import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TCustomCharacter, IDigitGroupParam, TDigitGroupOption, TFloatPart } from 'ng-indigit';

@Component({
  selector: 'app-digit-grouping-options',
  templateUrl: './digit-grouping-options.component.html',
  styleUrls: ['./digit-grouping-options.component.scss']
})
export class DigitGroupingOptionsComponent implements OnInit {

  allowedDigitGroupDelimiters: TCustomCharacter[] = [',', ' ', '`', '-'];
  enableDigitGrouping: boolean = false;
  integerIsGrouped: boolean = false;
  decimalIsGrouped: boolean = false;
  decimalDigitGroupingParams: IDigitGroupParam = { groupSize: 3, delimiter: ' ' };
  integerDigitGroupingParams: IDigitGroupParam = { groupSize: 3, delimiter: ',' };

  @Output() integerDigitGroupingOptionsChange = new EventEmitter<TDigitGroupOption>();
  @Output() decimalDigitGroupingOptionsChange = new EventEmitter<TDigitGroupOption>();

  constructor() { }

  ngOnInit(): void {
    this.updateParams();
  }

  toggleDigitGroupingParams(): void {
    this.updateParams();
  }

  emitChanges(part: TFloatPart): void {
    this[`${part}DigitGroupingOptionsChange`].emit((this.enableDigitGrouping && this[`${part}IsGrouped`])
      ? { ...this[`${part}DigitGroupingParams`] }
      : false);
  }

  private updateParams(): void {
    const parts: TFloatPart[] = ['integer', 'decimal'];
    parts.forEach(p => this.emitChanges(p));
  }

}
