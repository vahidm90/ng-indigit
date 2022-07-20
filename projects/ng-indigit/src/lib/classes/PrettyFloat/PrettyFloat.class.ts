import { IFloatPartDigitGroupConfig, IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter, IPrettyFloatPointIndex, IPrettyFloatValue } from '../../interfaces';
import { DIGIT_GROUP_UTIL, PRETTY_FLOAT_PARAMETER_UTIL, NUMBER_UTIL, PRETTY_FLOAT_UTIL } from '../../utils';
import { TDigitGroupDelimiter, TDigitGroupParameterFloatPartKey, TFloatPart, TInput } from '../../types';

export class PrettyFloat {

  private _value!: IPrettyFloatValue;
  private _pointIndex!: IPrettyFloatPointIndex;
  private _hasDecimalPart!: boolean;
  private _forcedDecimals!: number;
  private _trimmedDecimals!: string;
  private _decimalParams!: IPrettyFloatDecimalPartParameter;
  private _digitGroupParams!: IPrettyFloatDigitGroupParameter;

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
    return (this._decimalParams.allowDecimal && this._hasDecimalPart) ? this._forcedDecimals : 0;
  }

  get trimmedDecimals(): string {
    return this._decimalParams.allowDecimal ? this._trimmedDecimals : '';
  }

  get hasDecimalPart(): boolean {
    return this._hasDecimalPart;
  }

  get digitGroupDelimiters(): TDigitGroupDelimiter[] {
    const delimiters: TDigitGroupDelimiter[] = [];
    if (!this._digitGroupParams.hasDigitGroups)
      return delimiters;
    if (this._digitGroupParams.integerDigitGroups.groupSize > 0)
      delimiters.push(this._digitGroupParams.integerDigitGroups.delimiter);
    if (this._digitGroupParams.decimalDigitGroups.groupSize > 0)
      delimiters.push(this._digitGroupParams.decimalDigitGroups.delimiter);
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
    return this._hasDecimalPart
      ? Number(NUMBER_UTIL.sanitize(this._value.pretty.substring(0, this._pointIndex.prettyIndex)))
      : this._value.number;
  }

  get prettyIntPart(): number | null {
    const value = Number(this._hasDecimalPart
      ? this._value.pretty.substring(0, this._pointIndex.prettyIndex)
      : this._value.pretty);
    return Number.isNaN(value) ? null : value;
  }

  get decimals(): string {
    return this._hasDecimalPart
      ? NUMBER_UTIL.sanitize(this._value.pretty.substring(this._pointIndex.prettyIndex + 1))
      : '';
  }

  get prettyDecimals(): string {
    return this._hasDecimalPart
      ? this._value.pretty.substring(0, this._pointIndex.prettyIndex)
      : this._value.pretty;
  }

  get decimalParams(): IPrettyFloatDecimalPartParameter {
    return this._decimalParams;
  }

  get digitGroupParams(): IPrettyFloatDigitGroupParameter {
    return this._digitGroupParams;
  }

  clone(): PrettyFloat {
    return new PrettyFloat(this.prettyValue, { ...this._decimalParams }, { ...this._digitGroupParams });
  }

  updateDigitGroupParams(params: IFloatPartDigitGroupConfig): PrettyFloat {
    const otherPart: TFloatPart = (params.part === 'decimal') ? 'integer' : 'decimal';
    this._digitGroupParams = PRETTY_FLOAT_PARAMETER_UTIL.digitGroup(params, {
      part: otherPart,
      params: this._digitGroupParams[(otherPart + 'DigitGroups') as TDigitGroupParameterFloatPartKey]
    });
    return this.updateValue(this.numberValue);
  }

  updateDecimalParams(decimal: any): PrettyFloat {
    this._decimalParams = PRETTY_FLOAT_PARAMETER_UTIL.decimal(decimal);
    return this.updateValue(this.numberValue);
  }

  updateValue(newValue: TInput): PrettyFloat {
    this.value = this._decimalParams.allowDecimal
      ? this.getValueWithDecimals(newValue)
      : this.getValueWithoutDecimals(newValue);
    return this;
  }

  private set digitGroupParams(digitGroup: any) {
    this._digitGroupParams = PRETTY_FLOAT_PARAMETER_UTIL.digitGroup(digitGroup);
  }

  private set decimalParams(decimal: any) {
    this._decimalParams = PRETTY_FLOAT_PARAMETER_UTIL.decimal(decimal);
  }

  private set value(value: IPrettyFloatValue) {
    this._value = value;
    if (!this._pointIndex)
      this._pointIndex = { prettyIndex: -1, numberIndex: -1 };
    if (!this.decimalParams.allowDecimal)
      return;
    this.updateFloatPointIndices();
  }

  private updateFloatPointIndices(): void {
    this.updateNumberValuePointIndex();
    this.updatePrettyValuePointIndex();
  }

  private updateNumberValuePointIndex(): void {
    this._pointIndex.numberIndex = String(this._value?.number).indexOf(this._decimalParams.separator) || -1;
  }

  private updatePrettyValuePointIndex(): void {
    this._pointIndex.prettyIndex = this._value.pretty.indexOf(this._decimalParams.separator);
  }

  private initValues(subject: TInput, decimal?: any, digitGroup?: any): void {
    this.setParams(decimal, digitGroup);
    this.value = this._decimalParams.allowDecimal
      ? this.getValueWithDecimals(subject)
      : this.getValueWithoutDecimals(subject);
  }

  private setParams(decimal?: any, digitGroup?: any) {
    this.decimalParams = decimal;
    this.digitGroupParams = digitGroup;
    this._hasDecimalPart = false;
  }

  private getValueWithoutDecimals(subject: TInput): IPrettyFloatValue {
    const value = NUMBER_UTIL.sanitize(subject);
    const integer = PRETTY_FLOAT_UTIL.getIntPart(value, this._decimalParams.separator, this.digitGroupDelimiters);
    if (!value || !integer)
      return { pretty: '', number: null };
    const params = this._digitGroupParams;
    return {
      number: parseInt(integer, 10),
      pretty: params.hasDigitGroups ? DIGIT_GROUP_UTIL.apply(integer, params.integerDigitGroups) : integer
    };
  }

  private getValueWithDecimals(subject: TInput): IPrettyFloatValue {
    this.resetDecimalPartParams();
    const delimiters = this.digitGroupDelimiters;
    const value = PRETTY_FLOAT_UTIL.sanitize(subject, this._decimalParams.separator, delimiters);
    const integer = PRETTY_FLOAT_UTIL.getIntPart(value, this._decimalParams.separator, delimiters);
    if (!value || !integer)
      return { pretty: '', number: null };
    const separator = this._decimalParams.separator;
    const decimal = this.getDecimals(value);
    const point = (!decimal.length && (value[value.length - 1] === separator)) ? separator : '';
    const digitGroupParams = this._digitGroupParams;
    return {
      number: parseFloat(`${integer}.${decimal}`),
      pretty: digitGroupParams.hasDigitGroups
        ? `${DIGIT_GROUP_UTIL.apply(integer, digitGroupParams.integerDigitGroups)}${point}${DIGIT_GROUP_UTIL.apply(decimal, digitGroupParams.decimalDigitGroups)}`
        : `${integer}${point}${decimal}`
    };
  }

  private resetDecimalPartParams(): void {
    this._forcedDecimals = 0;
    this._trimmedDecimals = '';
  }

  private getDecimals(value: string): string {
    const params = this._decimalParams;
    const pointIndex = value.indexOf(params.separator);
    if ((pointIndex < 0) || (pointIndex === (value.length - 1)))
      return '';
    let decimal = value.substring(pointIndex + 1);
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
