import { TCustomCharacter, TInput } from '../types';
import { BASIC_UTIL } from './_basic.util';
import { NUMBER_UTIL } from './_number.util';

const deduplicateFloatPoint: (subject: TInput, floatPoint: TCustomCharacter, isSafeSubject?: true) => string
  = (subject, point, isSafeSubject?) => {
  const value = isSafeSubject ? subject as string : BASIC_UTIL.stringify(subject);
  const i = value.indexOf(point);
  return (i === value.lastIndexOf(point))
    ? value
    : value.substring(0, i) + point + value.substring(i + 1).replace(RegExp(point, 'g'), '');
};

const sanitize: (subject: TInput, floatPoint: TCustomCharacter) => string = (subject, point) => {
  let value = NUMBER_UTIL.faToEn(BASIC_UTIL.stringify(subject));
  if (!value)
    return '';
  let sign = '';
  if (value[0] === '-') {
    value = value.substring(1);
    sign = '-';
  }
  const regexp = RegExp(`[^\\d\\${point}]`, 'g');
  return deduplicateFloatPoint(`${sign}${value.replace(regexp, '')}`, point, true);
};

export const FLOAT_UTIL: {
  sanitize: (subject: TInput, floatPoint: TCustomCharacter) => string;
  getIntPart: (subject: TInput, floatPoint: TCustomCharacter, isSafeSubject?: true) => string;
  getDecimals: (subject: TInput, floatPoint: TCustomCharacter, isSafeSubject?: true) => string;
} = {

  sanitize: (subject, point) => sanitize(subject, point),

  getIntPart: (subject, point, isSafeSubject?) => {
    let value = isSafeSubject ? subject as string : sanitize(subject, point);
    if (value[0] === '-')
      value = value.substring(1);
    if (!value)
      return '';
    const i = value.indexOf(point);
    if (!i || (value === point))
      return '0';
    value = (i < 0) ? value : value.substring(0, i);
    while ((value[0] === '0') && (value.length > 1))
      value = value.substring(1);
    return value;
  },

  getDecimals: (subject, point, isSafeSubject?) => {
    const value = isSafeSubject ? subject as string : sanitize(subject, point);
    const i = value.indexOf(point);
    return (i > -1) ? value.substring(i + 1) : '';
  }

};
