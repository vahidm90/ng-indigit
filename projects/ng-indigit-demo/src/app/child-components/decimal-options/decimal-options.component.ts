import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TCustomCharacter, IPrettyFloatDecimalParam } from 'ng-indigit';

@Component({
  selector: 'app-decimal-options',
  templateUrl: './decimal-options.component.html',
  styleUrls: ['./decimal-options.component.scss']
})
export class DecimalOptionsComponent implements OnInit {

  @Output() decimalOptionChange = new EventEmitter<Partial<IPrettyFloatDecimalParam>>();

  allowedFloatPoints: TCustomCharacter[] = ['/', '.', ','];
  decimalParams: Partial<IPrettyFloatDecimalParam> = {
    isDecimalAllowed: false,
    floatPoint: '/',
    minDigitCount: 0,
    maxDigitCount: 6
  };

  constructor() { }

  ngOnInit(): void {
    this.setDecimalParams();
  }

  setDecimalParams(): void {
    this.decimalOptionChange.emit(this.decimalParams);
  }

}
