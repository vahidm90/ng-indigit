import { TCustomFloatPoint, TFloatPoint, TDigitGroupDelimiter, TInput } from '../types';
import { PrettyFloat } from '../classes';
import { IPrettyFloatDigitGroupParameter } from '../interfaces';
import { FLOAT_UTIL } from './_float.util';
import { DIGIT_GROUP_UTIL } from './_digit-group.util';

export const PRETTY_FLOAT_UTIL: {
  sanitize: (subject: TInput
    , floatPoint: TFloatPoint
    , digitGroup?: IPrettyFloatDigitGroupParameter
    , isSafeSubject?: true) => string;
  normalizeFloatPoint: (subject: TInput
    , floatPoint: TFloatPoint
    , digitGroup?: IPrettyFloatDigitGroupParameter
    , isSafeSubject?: true) => string;
  toNumber: (subject: TInput, floatPoint: TFloatPoint, digitGroup?: IPrettyFloatDigitGroupParameter) => number;
  customizeFloatPoint: (subject: TInput, floatPoint: TCustomFloatPoint, digitGroup?: IPrettyFloatDigitGroupParameter) => string;
  getIntPart: (subject: TInput, floatPoint: TFloatPoint, digitGroup?: IPrettyFloatDigitGroupParameter) => string;
  getDecimals: (subject: TInput, floatPoint: TFloatPoint, digitGroup?: IPrettyFloatDigitGroupParameter) => string;
  findFirstChangedIndex: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
  findFirstChangedIndexFromEnd: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
} = {

  sanitize: (subject, point, digitGroup?, isSafeSubject?) => {
    const value = isSafeSubject ? subject as string : FLOAT_UTIL.sanitize(subject, point);
    const sign = (value[0] === '-') ? '-' : '';
    const intPart = FLOAT_UTIL.getIntPart(value, point, true);
    if (!intPart)
      return '';
    const decimals = FLOAT_UTIL.getDecimals(value, point, true);
    const pointChar = (decimals.length || (value[value.length - 1] === point)) ? point : '';
    return digitGroup?.hasDigitGroups
      ? `${sign}${DIGIT_GROUP_UTIL.apply(intPart
        , digitGroup.integerDigitGroups
        , true)}${pointChar}${DIGIT_GROUP_UTIL.apply(decimals, digitGroup.decimalDigitGroups, true)}`
      : `${sign}${intPart}${pointChar}${decimals}`;
  },

  normalizeFloatPoint: function (subject, point, digitGroup?, isSafeSubject?) {
    const value = isSafeSubject ? subject as string : this.sanitize(subject, point, digitGroup);
    if (point === '.')
      return value;
    const i = value.indexOf(point);
    return (i < 0) ? value : `${value.substring(0, i)}.${value.substring(i + 1)}`;
  },

  toNumber: function (subject, point, digitGroup?) {
    return parseFloat(this.normalizeFloatPoint(this.sanitize(subject, point, digitGroup), point, digitGroup, true));
  },

  customizeFloatPoint: function (subject, point, digitGroup?) {
    const value = this.sanitize(subject, '.', digitGroup);
    const i = value.indexOf('.');
    return (i < 0) ? value : `${value.substring(0, i)}${point}${value.substring(i + 1)}`;
  },

  getIntPart: function (subject, point, digitGroup?) {
    const value = this.sanitize(subject, point, digitGroup);
    return FLOAT_UTIL.getIntPart(value, point, true);
  },

  getDecimals: function (subject, point, digitGroup?) {
    const value = this.sanitize(subject, point, digitGroup);
    return FLOAT_UTIL.getDecimals(value, point, true);
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
    return newValue.length;
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
    return i;
  }

};
