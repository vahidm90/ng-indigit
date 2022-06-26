import { IFloatDecimalPartParameter, IFloatDigitGroupParameter } from '../../interfaces';
import { FLOAT_UTIL, DIGIT_GROUP_UTIL, FLOAT_PARAMETER_UTIL, NUMBER_UTIL } from '../../utils';
import { TDecimalSeparator, TDigitGroupDelimiter, TInput } from '../../types';

export class Float {

  private _value!: number | null;
  private _prettyValue!: string;
  private _valuePointIndex!: number;
  private _prettyValuePointIndex!: number;
  private _hasDecimalPart!: boolean;
  private _forcedDecimals!: number;
  private _digitGroupDelimiters!: TDigitGroupDelimiter[];
  private _decimalParams!: IFloatDecimalPartParameter;
  private _digitGroupParams!: IFloatDigitGroupParameter;

  constructor(subject: TInput, decimal?: any, digitGroup?: any) {
    this.setValues(subject, decimal, digitGroup);
  }

  get valuePointIndex(): number {
    return this._valuePointIndex;
  }

  get prettyValuePointIndex(): number {
    return this._prettyValuePointIndex;
  }

  get forcedDecimals(): number {
    return this._forcedDecimals;
  }

  get digitGroupDelimiters(): TDigitGroupDelimiter[] {
    return this._digitGroupDelimiters;
  }

  updateSeparatorIndices(): void {
    this.updateValueSeparatorIndex();
    this.updatePrettyValueSeparatorIndex();
  }

  updateValueSeparatorIndex(): void {
    this._valuePointIndex = this._value?.toString().indexOf(this._decimalParams.separator) || -1;
  }

  updatePrettyValueSeparatorIndex(): void {
    this._prettyValuePointIndex = this._prettyValue.indexOf(this._decimalParams.separator);
  }

  private setValues(subject: TInput, decimal?: any, digitGroup?: any): void {
    this.setParams(decimal, digitGroup);
    this.fillDelimiters();
    this._decimalParams.allowDecimal ? this.setDecimalValues(subject) : this.setNonDecimalValues(subject);
  }

  private setParams(decimal?: any, digitGroup?: any) {
    if (decimal != null)
      this.decimalParams = decimal;
    if (digitGroup != null)
      this.digitGroupParams = digitGroup;
  }

  private set digitGroupParams(digitGroup: any) {
    this._digitGroupParams = FLOAT_PARAMETER_UTIL.digitGroup(digitGroup);
  }

  private set decimalParams(decimal: any) {
    this._decimalParams = FLOAT_PARAMETER_UTIL.decimal(decimal);
  }

  private setNonDecimalValues(subject: TInput): void {
    const value = NUMBER_UTIL.sanitize(subject);
    const integer = this.getInteger(value);
    if (!value || !integer) {
      this.nullifyValues();
      return;
    }
    const digitGroupParams = this._digitGroupParams;
    const prettyInt = DIGIT_GROUP_UTIL.add(integer, digitGroupParams.integerDigitGroups);
    this._valuePointIndex = integer.length;
    this._prettyValuePointIndex = prettyInt.length;
    this._hasDecimalPart = false;
    this._value = parseInt(integer, 10);
    this._prettyValue = digitGroupParams.hasDigitGroups ? prettyInt : integer;
  }

  private setDecimalValues(subject: TInput): void {
    const value = FLOAT_UTIL.parse(subject, this._decimalParams.separator);
    const integer = this.getInteger(value);
    if (!value || !integer) {
      this.nullifyValues();
      return;
    }
    const separator = this._decimalParams.separator;
    const decimal = this.getDecimals(value);
    this._hasDecimalPart = !!decimal.length;
    const point = (!this._hasDecimalPart && (value[value.length] === separator)) ? separator : '';
    const digitGroupParams = this._digitGroupParams;
    const prettyInt = DIGIT_GROUP_UTIL.add(integer, digitGroupParams.integerDigitGroups);
    this._valuePointIndex = integer.length;
    this._prettyValuePointIndex = prettyInt.length;
    this._value = parseFloat(`${integer}.${decimal}`);
    this._prettyValue =
      digitGroupParams.hasDigitGroups
        ? `${prettyInt}${point}${DIGIT_GROUP_UTIL.add(decimal, digitGroupParams.decimalDigitGroups)}`
        : `${integer}${point}${decimal}`;
  }

  private nullifyValues(): void {
    this._hasDecimalPart = false;
    this._value = null;
    this._prettyValue = '';
  }

  private fillDelimiters(): void {
    this._digitGroupDelimiters = [];
    if (!this._digitGroupParams.hasDigitGroups)
      return;
    if (this._digitGroupParams.integerDigitGroups.groupSize > 0)
      this._digitGroupDelimiters.push(this._digitGroupParams.integerDigitGroups.delimiter);
    if (this._digitGroupParams.decimalDigitGroups.groupSize > 0)
      this._digitGroupDelimiters.push(this._digitGroupParams.decimalDigitGroups.delimiter);
  }

  private getDecimals(value: string, separator: TDecimalSeparator = this._decimalParams.separator): string {
    let decimal = value.substring(value.indexOf(separator) + 1);
    this._forcedDecimals = 0;
    while (decimal.length < this._decimalParams.minDigitCount) {
      decimal += '0';
      this._forcedDecimals++;
    }
    while (decimal.length > this._decimalParams.maxDigitCount) {
      decimal = decimal.substring(0, decimal.length - 1);
      this._forcedDecimals--;
    }
    return decimal;
  }

  private getInteger(value: string, separator: TDecimalSeparator = this._decimalParams.separator): string {
    if (!value)
      return '';
    if (value === separator)
      return '0';
    const end = value.indexOf(separator);
    return value.substring(0, (end > -1) ? end : undefined);
  }

}
