import { IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter, IPrettyFloatPointIndex, IPrettyFloatValue } from '../../interfaces';
import { DIGIT_GROUP_UTIL, PRETTY_FLOAT_PARAMETER_UTIL, NUMBER_UTIL, PRETTY_FLOAT_UTIL } from '../../utils';
import { TDigitGroupDelimiter, TInput } from '../../types';

export class PrettyFloat {

  private _value!: IPrettyFloatValue;
  private _index!: IPrettyFloatPointIndex;
  private _hasDecimalPart!: boolean;
  private _forcedDecimals!: number;
  private _decimalParams!: IPrettyFloatDecimalPartParameter;
  private _digitGroupParams!: IPrettyFloatDigitGroupParameter;

  constructor(subject: TInput, decimal?: any, digitGroup?: any) {
    this.initValues(subject, decimal, digitGroup);
  }

  get value(): IPrettyFloatValue {
    return this._value;
  }

  set value(value: IPrettyFloatValue) {
    this._value = value;
    this.updateSeparatorIndices();
  }

  get index(): IPrettyFloatPointIndex {
    return this._index;
  }

  get forcedDecimals(): number {
    return this._forcedDecimals;
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

  updateValue(newValue: TInput): void {
    this.value = this._decimalParams.allowDecimal
      ? this.getValueWithDecimals(newValue)
      : this.getValueWithoutDecimals(newValue);
  }

  private set digitGroupParams(digitGroup: any) {
    this._digitGroupParams = PRETTY_FLOAT_PARAMETER_UTIL.digitGroup(digitGroup);
  }

  private set decimalParams(decimal: any) {
    this._decimalParams = PRETTY_FLOAT_PARAMETER_UTIL.decimal(decimal);
  }

  private updateSeparatorIndices(): void {
    this.updateNumberValueSeparatorIndex();
    this.updatePrettyValueSeparatorIndex();
  }

  private updateNumberValueSeparatorIndex(): void {
    this._index.numberIndex = String(this._value?.number).indexOf(this._decimalParams.separator) || -1;
  }

  private updatePrettyValueSeparatorIndex(): void {
    this._index.prettyIndex = this._value.pretty.indexOf(this._decimalParams.separator);
  }

  private initValues(subject: TInput, decimal?: any, digitGroup?: any): void {
    this.setParams(decimal, digitGroup);
    this.value = this._decimalParams.allowDecimal
      ? this.getValueWithDecimals(subject)
      : this.getValueWithoutDecimals(subject);
  }

  private setParams(decimal?: any, digitGroup?: any) {
    if (decimal != null)
      this.decimalParams = decimal;
    if (digitGroup != null)
      this.digitGroupParams = digitGroup;
    this._hasDecimalPart = false;
  }

  private getValueWithoutDecimals(subject: TInput): IPrettyFloatValue {
    const value = NUMBER_UTIL.sanitize(subject);
    const integer = PRETTY_FLOAT_UTIL.getIntegerPart(value, this._decimalParams.separator, this.digitGroupDelimiters);
    if (!value || !integer)
      return { pretty: '', number: null };
    const params = this._digitGroupParams;
    return {
      number: parseInt(integer, 10),
      pretty: params.hasDigitGroups ? DIGIT_GROUP_UTIL.apply(integer, params.integerDigitGroups) : integer
    };
  }

  private getValueWithDecimals(subject: TInput): IPrettyFloatValue {
    const delimiters = this.digitGroupDelimiters;
    const value = PRETTY_FLOAT_UTIL.sanitize(subject, this._decimalParams.separator, delimiters);
    const integer = PRETTY_FLOAT_UTIL.getIntegerPart(value, this._decimalParams.separator, delimiters);
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

  private getDecimals(value: string): string {
    const params = this._decimalParams;
    let decimal = value.substring(value.indexOf(params.separator) + 1);
    this._forcedDecimals = 0;
    while (decimal.length < params.minDigitCount) {
      decimal += '0';
      this._forcedDecimals++;
    }
    while (decimal.length > params.maxDigitCount) {
      decimal = decimal.substring(0, decimal.length - 1);
      this._forcedDecimals--;
    }
    this._hasDecimalPart = !!decimal;
    return decimal;
  }

}
