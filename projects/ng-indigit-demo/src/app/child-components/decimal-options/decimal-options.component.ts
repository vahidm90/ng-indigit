import { Component, EventEmitter, Output } from '@angular/core';
import { DecimalParameters, DecimalSeparator } from 'ng-indigit';
import { IDecimalOptionModel } from '../../../interfaces/decimal-option.model';

@Component({
  selector: 'app-decimal-options',
  templateUrl: './decimal-options.component.html',
  styleUrls: ['./decimal-options.component.scss']
})
export class DecimalOptionsComponent {

  @Output() decimalOptionChange = new EventEmitter<Partial<IDecimalOptionModel>>();

  allowDecimals: boolean = false;
  allowedDecimalSeparators: DecimalSeparator[] = ['/', '.', ','];
  decimalParams: DecimalParameters = { decimalSeparator: '/', minDecimalDigits: 0, maxDecimalDigits: 6 };

  constructor() { }

  setDecimalParams(): void {
    this.decimalOptionChange.emit({ allowDecimal: this.allowDecimals, params: this.decimalParams });
  }

}
