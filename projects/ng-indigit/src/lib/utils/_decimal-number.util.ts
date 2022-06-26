import { TCustomDecimalSeparator, TDecimalSeparator, TInput } from '../types';
import { BASIC_UTIL } from './_basic.util';
import { NUMBER_UTIL } from './_number.util';

export const FLOAT_UTIL: {
  sanitize: (subject: TInput, separator: TDecimalSeparator) => string;
  parse: (subject: TInput, separator: TDecimalSeparator) => string;
  normalizeSeparator: (subject: TInput, separator: TCustomDecimalSeparator) => string;
  customizeSeparator: (subject: TInput, separator: TCustomDecimalSeparator) => string;
  getIntegerPart: (subject: TInput, separator: TDecimalSeparator) => string;
  getDecimalPart: (subject: TInput, separator: TDecimalSeparator) => string
} = {

  sanitize: (s, d) => NUMBER_UTIL.faToEn(BASIC_UTIL.stringify(s))?.replace(RegExp(`[^\\d${d}]`, 'g'), '') || '',

  parse: function (s, d) {
    const value = this.sanitize(s, d);
    const i = value.indexOf(d);
    return (i === value.lastIndexOf(d))
      ? value
      : value.substring(0, i) + d + value.substring(i + 1).replace(RegExp(d, 'g'), '');
  },

  normalizeSeparator: function (subject, separator) {
    const value = this.parse(subject, separator);
    const i = value.indexOf(separator);
    return (i < 0) ? value : `${value.substring(0, i)}.${value.substring(i + 1)}`;
  },

  customizeSeparator: function (subject, separator) {
    const value = this.parse(subject, '.');
    const i = value.indexOf('.');
    return (i < 0) ? value : `${value.substring(0, i)}${separator}${value.substring(i + 1)}`;
  },

  getIntegerPart: function (subject, separator) {
    const value = this.parse(subject, separator);
    const i = value.indexOf(separator);
    return (i < 0) ? value : value.substring(0, i);
  },

  getDecimalPart: function (value, separator) {
    const val = this.parse(value, separator);
    const i = val.indexOf(separator);
    return (i > -1) ? val.substring(i + 1) : '';
  }

};
