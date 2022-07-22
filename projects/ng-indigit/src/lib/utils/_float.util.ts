import { TCustomFloatPoint, TFloatPoint, TInput } from '../types';
import { BASIC_UTIL } from './_basic.util';
import { NUMBER_UTIL } from './_number.util';

export const FLOAT_UTIL: {
  deduplicateFloatPoint: (subject: TInput, floatPoint: TFloatPoint, isSafeSubject?: true) => string;
  sanitize: (subject: TInput, floatPoint: TFloatPoint) => string;
  normalizeFloatPoint: (subject: TInput, floatPoint: TFloatPoint) => string;
  toNumber: (subject: TInput, floatPoint: TFloatPoint) => number;
  customizeFloatPoint: (subject: TInput, floatPoint: TCustomFloatPoint) => string;
  getIntPart: (subject: TInput, floatPoint: TFloatPoint, isSafeSubject?: true) => string;
  getDecimals: (subject: TInput, floatPoint: TFloatPoint, isSafeSubject?: true) => string;
} = {

  deduplicateFloatPoint: (subject, point, isSafeSubject?) => {
    const value = isSafeSubject ? subject as string : BASIC_UTIL.stringify(subject);
    const i = value.indexOf(point);
    return (i === value.lastIndexOf(point))
      ? value
      : value.substring(0, i) + point + value.substring(i + 1).replace(RegExp(point, 'g'), '');
  },

  sanitize: function (subject, point) {
    let value = NUMBER_UTIL.faToEn(BASIC_UTIL.stringify(subject));
    if (!value)
      return '';
    let sign = '';
    if (value[0] === '-') {
      value = value.substring(1);
      sign = '-';
    }
    const regexp = RegExp(`[^\\d${point}]`, 'g');
    return this.deduplicateFloatPoint(`${sign}${value.replace(regexp, '')}`, point, true);
  },

  normalizeFloatPoint: function (subject, point) {
    const value = this.sanitize(subject, point);
    if (point === '.')
      return value;
    const i = value.indexOf(point);
    return (i < 0) ? value : `${value.substring(0, i)}.${value.substring(i + 1)}`;
  },

  toNumber: function (subject, point) {
    return parseFloat(this.normalizeFloatPoint(this.sanitize(subject, point), point));
  },

  customizeFloatPoint: function (subject, point) {
    const value = this.sanitize(subject, '.');
    const i = value.indexOf('.');
    return (i < 0) ? value : `${value.substring(0, i)}${point}${value.substring(i + 1)}`;
  },

  getIntPart: function (subject, point, isSafeSubject?) {
    let value = isSafeSubject ? subject as string : this.sanitize(subject, point);
    if (value[0] === '-')
      value = value.substring(1);
    if (!value)
      return '';
    const i = value.indexOf(point);
    if (!i || (value === point))
      return '0';
    return (i < 0) ? value : value.substring(0, i);
  },

  getDecimals: function (subject, point, isSafeSubject?) {
    const value = isSafeSubject ? subject as string : this.sanitize(subject, point);
    const i = value.indexOf(point);
    return (i > -1) ? value.substring(i + 1) : '';
  }

};
