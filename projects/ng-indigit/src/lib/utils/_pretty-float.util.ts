import { TCustomFloatPoint, TFloatPoint, TDigitGroupDelimiter, TInput } from '../types';
import { BASIC_UTIL } from './_basic.util';
import { NUMBER_UTIL } from './_number.util';
import { PrettyFloat } from '../classes';

export const PRETTY_FLOAT_UTIL: {
  sanitize: (subject: TInput, floatPoint: TFloatPoint, groupDelimiters: TDigitGroupDelimiter[]) => string;
  normalizeFloatPoint: (subject: TInput, floatPoint: TFloatPoint, groupDelimiters: TDigitGroupDelimiter[]) => string;
  toNumber: (subject: TInput, floatPoint: TFloatPoint, groupDelimiters: TDigitGroupDelimiter[]) => number;
  customizeFloatPoint: (subject: TInput, floatPoint: TCustomFloatPoint, groupDelimiters: TDigitGroupDelimiter[]) => string;
  getIntPart: (subject: TInput, floatPoint: TFloatPoint, groupDelimiters: TDigitGroupDelimiter[]) => string;
  getDecimals: (subject: TInput, floatPoint: TFloatPoint, groupDelimiters: TDigitGroupDelimiter[]) => string;
  findFirstChangedIndex: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
  findFirstChangedIndexFromEnd: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
} = {

  sanitize: (subject, separator, groupDelimiters) => {
    let value = NUMBER_UTIL.faToEn(BASIC_UTIL.stringify(subject));
    if (!value)
      return '';
    let sign = '';
    if (value[0] === '-') {
      value = value.substring(1);
      sign = '-';
    }
    let allowedCharacters: string = separator;
    groupDelimiters.map(d => (d === '-') ? '\\-' : d).forEach(delimiter => allowedCharacters += delimiter);
    const regexp = RegExp(`[^\\d${allowedCharacters}]`, 'g');
    value = `${sign}${value.replace(regexp, '')}`;
    const i = value.indexOf(separator);
    return (i === value.lastIndexOf(separator))
      ? value
      : value.substring(0, i) + separator + value.substring(i + 1).replace(RegExp(separator, 'g'), '');
  },

  normalizeFloatPoint: function (subject, separator, groupDelimiters) {
    const value = this.sanitize(subject, separator, groupDelimiters);
    if (separator === '.')
      return value;
    const i = value.indexOf(separator);
    return (i < 0) ? value : `${value.substring(0, i)}.${value.substring(i + 1)}`;
  },

  toNumber: function (subject, separator, groupDelimiters) {
    return parseFloat(this.normalizeFloatPoint(this.sanitize(subject, separator, groupDelimiters), separator, groupDelimiters));
  },

  customizeFloatPoint: function (subject, separator, groupDelimiters) {
    const value = this.sanitize(subject, '.', groupDelimiters);
    const i = value.indexOf('.');
    return (i < 0) ? value : `${value.substring(0, i)}${separator}${value.substring(i + 1)}`;
  },

  getIntPart: function (subject, separator, groupDelimiters) {
    const value = this.sanitize(subject, separator, groupDelimiters);
    const i = value.indexOf(separator);
    if (!value || (value === '-'))
      return '';
    if (!i || (value === `-${separator}`))
      return '0';
    return (i < 0) ? value : value.substring(0, i);
  },

  getDecimals: function (value, separator, groupDelimiters) {
    const val = this.sanitize(value, separator, groupDelimiters);
    const i = val.indexOf(separator);
    return (i > -1) ? val.substring(i + 1) : '';
  },

  findFirstChangedIndex: function (newSubject, oldSubject) {
    const newValue = newSubject.prettyValue;
    const oldValue = oldSubject.prettyValue;
    const groupDelimiters = newSubject.digitGroupDelimiters;
    let i = 0;
    let j = 0;
    while ((i < newValue.length) && (j < oldValue.length)) {
      if (groupDelimiters.indexOf(newValue[i] as TDigitGroupDelimiter) > -1) {
        i++;
        continue;
      }
      if (groupDelimiters.indexOf(oldValue[j] as TDigitGroupDelimiter) > -1) {
        j++;
        continue;
      }
      if (newValue[i] !== oldValue[j])
        return i;
      i++;
      j++;
    }
    return 0;
  },

  findFirstChangedIndexFromEnd: function (newSubject, oldSubject) {
    const newValue = newSubject.prettyValue;
    const oldValue = oldSubject.prettyValue;
    const groupDelimiters = newSubject.digitGroupDelimiters;
    let i = newValue.length - 1;
    let j = oldValue.length - 1;
    while ((i > -1) && (j > -1)) {
      if (groupDelimiters.indexOf(newValue[i] as TDigitGroupDelimiter) > -1) {
        i--;
        continue;
      }
      if (groupDelimiters.indexOf(oldValue[j] as TDigitGroupDelimiter) > -1) {
        j--;
        continue;
      }
      if (newValue[i] !== oldValue[j])
        return i;
      i--;
      j--;
    }
    return -1;
  }

};
