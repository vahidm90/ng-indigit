import { IPrettyFloatDecimalParam, IPrettyFloatDigitGroupParam, IPrettyFloatPointIndex, IPrettyFloatValue } from '../../interfaces';
import { DIGIT_GROUP_UTIL, PRETTY_FLOAT_PARAM_UTIL, NUMBER_UTIL, FLOAT_UTIL, PRETTY_FLOAT_UTIL } from '../../utils';
import { TCustomCharacter, TInput } from '../../types';

const getDigitGroupParams = PRETTY_FLOAT_PARAM_UTIL.digitGroup;
const getDecimalParams = PRETTY_FLOAT_PARAM_UTIL.decimal;
const sanitizeNum = NUMBER_UTIL.sanitize;

export class PrettyFloat {

  private _value!: IPrettyFloatValue;
  private _pointIndex!: IPrettyFloatPointIndex;
  private _hasDecimalPart!: boolean;
  private _forcedDecimals!: number;
  private _trimmedDecimals!: string;
  private _decimalParams!: IPrettyFloatDecimalParam;
  private _digitGroupParams!: IPrettyFloatDigitGroupParam;

  constructor(subject: TInput, decimal?: any, digitGroup?: any) {
    this.initValues(subject, decimal, digitGroup);
  }

  get value(): IPrettyFloatValue {
    return this._value;
  }

  get pointIndex(): IPrettyFloatPointIndex {
    return this._pointIndex;
  }

  get forcedDecimals(): number {
    return (this._decimalParams.isDecimalAllowed && this._hasDecimalPart) ? this._forcedDecimals : 0;
  }

  get trimmedDecimals(): string {
    return this._decimalParams.isDecimalAllowed ? this._trimmedDecimals : '';
  }

  get hasDecimalPart(): boolean {
    return this._hasDecimalPart;
  }

  get digitGroupDelimiters(): TCustomCharacter[] {
    const delimiters: TCustomCharacter[] = [];
    if (!this._digitGroupParams?.hasDigitGroups)
      return delimiters;
    if (this._digitGroupParams.integerPart.groupSize > 0)
      delimiters.push(this._digitGroupParams.integerPart.delimiter);
    if (this._digitGroupParams.decimalPart.groupSize > 0)
      delimiters.push(this._digitGroupParams.decimalPart.delimiter);
    return delimiters;
  }

  get isNegative(): boolean {
    const number = this.value.number;
    return (number != null) && (number < 0);
  }

  get prettyValue(): string {
    return this._value.pretty;
  }

  get numberValue(): number | null {
    return this._value.number;
  }

  get intPart(): number | null {
    const value = Number(this._value.number?.toFixed());
    return Number.isNaN(value) ? null : value;
  }

  get prettyIntPart(): string {
    const prettyInt = this._value.pretty;
    return (this._pointIndex.prettyIndex > -1) ? prettyInt.substring(0, this._pointIndex.prettyIndex) : prettyInt;
  }

  get decimals(): string {
    return this._hasDecimalPart ? `${this._value.number}`.substring(this._pointIndex.numberIndex + 1) : '';
  }

  get prettyDecimals(): string {
    return this._hasDecimalPart ? this._value.pretty.substring(this._pointIndex.prettyIndex + 1) : '';
  }

  get decimalParams(): IPrettyFloatDecimalParam {
    return this._decimalParams;
  }

  get digitGroupParams(): IPrettyFloatDigitGroupParam {
    return this._digitGroupParams;
  }

  clone(): PrettyFloat {
    return new PrettyFloat(this.prettyValue, this.decimalParams, this.digitGroupParams);
  }

  updateIntPartDigitGroupParams(params: any): PrettyFloat {
    this._digitGroupParams = getDigitGroupParams(this._digitGroupParams, { integerPart: params });
    return this.updateValue(this.prettyValue);
  }

  updateDecimalsDigitGroupParams(params: any): PrettyFloat {
    this._digitGroupParams = getDigitGroupParams(this._digitGroupParams, { decimalPart: params });
    return this.updateValue(this.prettyValue);
  }

  updateDigitGroupParams(params: any): PrettyFloat {
    this._digitGroupParams = getDigitGroupParams(this._digitGroupParams, params);
    return this.updateValue(this.prettyValue);
  }

  updateDecimalParams(decimal: any): PrettyFloat {
    this._decimalParams = getDecimalParams(decimal);
    return this.updateValue(this.prettyValue);
  }

  updateValue(newValue: TInput): PrettyFloat {
    this.value = this._decimalParams.isDecimalAllowed
      ? this.getValueWithDecimals(newValue)
      : this.getValueWithoutDecimals(newValue);
    return this;
  }

  private set digitGroupParams(digitGroup: any) {
    this._digitGroupParams = getDigitGroupParams(digitGroup);
  }

  private set decimalParams(decimal: any) {
    this._decimalParams = getDecimalParams(decimal);
  }

  private set value(value: IPrettyFloatValue) {
    this._value = value;
    if (!this._pointIndex)
      this._pointIndex = { prettyIndex: -1, numberIndex: -1 };
    if (!this.decimalParams.isDecimalAllowed)
      return;
    this.updateFloatPointIndices();
  }

  private updateFloatPointIndices(): void {
    this.updateNumberValuePointIndex();
    this.updatePrettyValuePointIndex();
  }

  private updateNumberValuePointIndex(): void {
    this._pointIndex.numberIndex = `${this.numberValue ?? ''}`.indexOf('.');
  }

  private updatePrettyValuePointIndex(): void {
    this._pointIndex.prettyIndex = this.prettyValue.indexOf(this.decimalParams.floatPoint);
  }

  private initValues(subject: TInput, decimal?: any, digitGroup?: any): void {
    this.setParams(decimal, digitGroup);
    this.value = this._decimalParams?.isDecimalAllowed
      ? this.getValueWithDecimals(subject)
      : this.getValueWithoutDecimals(subject);
  }

  private setParams(decimal?: any, digitGroup?: any) {
    this.decimalParams = decimal;
    this.digitGroupParams = digitGroup;
    this._hasDecimalPart = false;
  }

  private getValueWithoutDecimals(subject: TInput): IPrettyFloatValue {
    let value = sanitizeNum(subject);
    while (value[0] === '0')
      value = value.substring(1);
    if (!value)
      return { pretty: '', number: null };
    const params = this._digitGroupParams;
    return {
      number: parseInt(value, 10),
      pretty: params.hasDigitGroups ? DIGIT_GROUP_UTIL.apply(value, params.integerPart) : value
    };
  }

  private getValueWithDecimals(subject: TInput): IPrettyFloatValue {
    this.resetDecimalPartParams();
    const floatPoint = this._decimalParams.floatPoint;
    const value = FLOAT_UTIL.sanitize(subject, floatPoint);
    const intPart = FLOAT_UTIL.getIntPart(value, floatPoint, true);
    if (!value || !intPart)
      return { pretty: '', number: null };
    const decimals = this.getDecimals(value);
    return {
      number: parseFloat(`${intPart}.${decimals}`),
      pretty: PRETTY_FLOAT_UTIL.sanitize(`${intPart}${(decimals.length || (value[value.length - 1] === floatPoint)) ? floatPoint : ''}${decimals}`
        , floatPoint, this._digitGroupParams, true)
    };
  }

  private resetDecimalPartParams(): void {
    this._forcedDecimals = 0;
    this._trimmedDecimals = '';
  }

  private getDecimals(value: string): string {
    const params = this._decimalParams;
    let decimal = FLOAT_UTIL.getDecimals(value, params.floatPoint, true);
    if (params.minDigitCount > 0)
      decimal = this.appendZeroDecimals(decimal);
    if (params.maxDigitCount > -1)
      decimal = this.trimRedundantDecimals(decimal);
    this._hasDecimalPart = !!decimal;
    return decimal;
  }

  private appendZeroDecimals(decimalPart: string): string {
    let decimal = decimalPart;
    while (decimal.length < this._decimalParams.minDigitCount) {
      decimal += '0';
      this._forcedDecimals++;
    }
    return decimal;
  }

  private trimRedundantDecimals(decimalPart: string): string {
    let decimal = decimalPart;
    while (decimal.length > this._decimalParams.maxDigitCount) {
      const lastIndex = decimal.length - 1;
      const lastDigit = decimal[lastIndex];
      if ((lastDigit === '0') && (this._forcedDecimals > 0))
        this._forcedDecimals--;
      else
        this._trimmedDecimals = `${lastDigit}${this._trimmedDecimals}`;
      decimal = decimal.substring(0, lastIndex);
    }
    return decimal;
  }

}
