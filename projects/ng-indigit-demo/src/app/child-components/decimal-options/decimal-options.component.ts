import { Component, EventEmitter, Output } from '@angular/core';
import { TCustomCharacter, IPrettyFloatDecimalParam } from 'ng-indigit';

@Component({
  selector: 'app-decimal-options',
  templateUrl: './decimal-options.component.html',
  styleUrls: ['./decimal-options.component.scss']
})
export class DecimalOptionsComponent {

  @Output() decimalOptionChange = new EventEmitter<IPrettyFloatDecimalParam>();

  allowedFloatPoints: TCustomCharacter[] = ['/', '.', ','];
  decimalParams: IPrettyFloatDecimalParam = {
    isDecimalAllowed: false,
    floatPoint: '/',
    minDigitCount: 0,
    maxDigitCount: 6
  };

  constructor() { }

  setDecimalParams(): void {
    this.decimalOptionChange.emit(this.decimalParams);
  }

}
