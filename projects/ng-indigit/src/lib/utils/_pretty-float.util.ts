import { TCustomDecimalSeparator, TDecimalSeparator, TDigitGroupDelimiter, TInput } from '../types';
import { BASIC_UTIL } from './_basic.util';
import { NUMBER_UTIL } from './_number.util';

export const PRETTY_FLOAT_UTIL: {
  sanitize: (subject: TInput, separator: TDecimalSeparator, digitGroupDelimiters: TDigitGroupDelimiter[]) => string;
  normalizeSeparator:
    (subject: TInput, separator: TDecimalSeparator, digitGroupDelimiters: TDigitGroupDelimiter[]) => string;
  toNumber: (subject: TInput, separator: TDecimalSeparator, digitGroupDelimiters: TDigitGroupDelimiter[]) => number;
  customizeSeparator:
    (subject: TInput, separator: TCustomDecimalSeparator, digitGroupDelimiters: TDigitGroupDelimiter[]) => string;
  getIntegerPart:
    (subject: TInput, separator: TDecimalSeparator, digitGroupDelimiters: TDigitGroupDelimiter[]) => string;
  getDecimalPart:
    (subject: TInput, separator: TDecimalSeparator, digitGroupDelimiters: TDigitGroupDelimiter[]) => string;
} = {

  sanitize: (subject, separator, d) => {
    let value = NUMBER_UTIL.faToEn(BASIC_UTIL.stringify(subject));
    if (!value)
      return '';
    let sign = '';
    if (value[0] === '-') {
      value = value.substring(1);
      sign = '-';
    }
    let allowedCharacters: string = separator;
    d.map(delimiter => (delimiter === '-') ? '\\-' : delimiter).forEach(delimiter => allowedCharacters += delimiter);
    const regexp = RegExp(`[^\\d${allowedCharacters}]`, 'g');
    value = `${sign}${value.replace(regexp, '')}`;
    const i = value.indexOf(separator);
    return (i === value.lastIndexOf(separator))
      ? value
      : value.substring(0, i) + separator + value.substring(i + 1).replace(RegExp(separator, 'g'), '');
  },

  normalizeSeparator: function (subject, separator, d) {
    const value = this.sanitize(subject, separator, d);
    if (separator === '.')
      return value;
    const i = value.indexOf(separator);
    return (i < 0) ? value : `${value.substring(0, i)}.${value.substring(i + 1)}`;
  },

  toNumber: function (subject, separator, d) {
    return parseFloat(this.normalizeSeparator(this.sanitize(subject, separator, d), separator, d));
  },

  customizeSeparator: function (subject, separator, d) {
    const value = this.sanitize(subject, '.', d);
    const i = value.indexOf('.');
    return (i < 0) ? value : `${value.substring(0, i)}${separator}${value.substring(i + 1)}`;
  },

  getIntegerPart: function (subject, separator, d) {
    const value = this.sanitize(subject, separator, d);
    const i = value.indexOf(separator);
    if (!value)
      return '';
    if (!i || (value === '-') || (value === `-${separator}`))
      return '0';
    return (i < 0) ? value : value.substring(0, i);
  },

  getDecimalPart: function (value, separator, d) {
    const val = this.sanitize(value, separator, d);
    const i = val.indexOf(separator);
    return (i > -1) ? val.substring(i + 1) : '';
  }

};
