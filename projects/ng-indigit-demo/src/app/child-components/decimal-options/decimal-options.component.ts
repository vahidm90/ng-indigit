import { Component, EventEmitter, Output } from '@angular/core';
import { IDecimalOptionModel } from '../../../interfaces/decimal-option.model';
import { IDecimalPartParameter, TDecimalPartConfig, TFloatPoint } from 'ng-indigit';

@Component({
  selector: 'app-decimal-options',
  templateUrl: './decimal-options.component.html',
  styleUrls: ['./decimal-options.component.scss']
})
export class DecimalOptionsComponent {

  @Output() decimalOptionChange = new EventEmitter<IDecimalOptionModel>();

  allowDecimals: boolean = false;
  allowedFloatPoints: TFloatPoint[] = ['/', '.', ','];
  decimalParams: TDecimalPartConfig<IDecimalPartParameter> = { point: '/', minDigitCount: 0, maxDigitCount: 6 };

  constructor() { }

  setDecimalParams(): void {
    this.decimalOptionChange.emit({ allowDecimal: this.allowDecimals, params: this.decimalParams });
  }

}
