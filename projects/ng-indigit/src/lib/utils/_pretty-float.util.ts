import { TCustomCharacter, TInput } from '../types';
import { PrettyFloat } from '../classes';
import { IPrettyFloatDigitGroupParam } from '../interfaces';
import { FLOAT_UTIL } from './_float.util';
import { DIGIT_GROUP_UTIL } from './_digit-group.util';

const sanitize:
    (subject: TInput, floatPoint: TCustomCharacter, digitGroup?: IPrettyFloatDigitGroupParam, isSafeSubject?: true)
        => string
    = (subject, point, digitGroup?, isSafeSubject?) => {
  const value = isSafeSubject ? subject as string : FLOAT_UTIL.sanitize(subject, point);
  const sign = (value[0] === '-') ? '-' : '';
  const intPart = FLOAT_UTIL.getIntPart(value, point, true);
  if (!intPart)
    return '';
  const decimals = FLOAT_UTIL.getDecimals(value, point, true);
  const pointChar = (decimals.length || (value[value.length - 1] === point)) ? point : '';
  return digitGroup?.hasDigitGroups
      ? `${sign}${DIGIT_GROUP_UTIL.apply(intPart
          , digitGroup.integerPart
          , true)}${pointChar}${DIGIT_GROUP_UTIL.apply(decimals, digitGroup.decimalPart, true)}`
      : `${sign}${intPart}${pointChar}${decimals}`;
};

export const PRETTY_FLOAT_UTIL: {
  sanitize:
      (subject: TInput, floatPoint: TCustomCharacter, digitGroup?: IPrettyFloatDigitGroupParam, isSafeSubject?: true)
          => string;
  findFirstChangedIndex: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
  findFirstChangedIndexFromEnd: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
} = {

  sanitize: (subject, point, digitGroup?, isSafeSubject?) =>
      sanitize(subject, point, digitGroup, isSafeSubject),

  findFirstChangedIndex: (newSubject, oldSubject) => {
    const newValue = newSubject.prettyValue;
    const oldValue = oldSubject.prettyValue;
    const groupDelimiters = newSubject.digitGroupDelimiters;
    let i = 0;
    let j = 0;
    while ((i < newValue.length) && (j < oldValue.length)) {
      if (groupDelimiters.indexOf(newValue[i]) > -1) {
        i++;
        continue;
      }
      if (groupDelimiters.indexOf(oldValue[j]) > -1) {
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

  findFirstChangedIndexFromEnd: (newSubject, oldSubject) => {
    const newValue = newSubject.prettyValue;
    const oldValue = oldSubject.prettyValue;
    const groupDelimiters = newSubject.digitGroupDelimiters;
    let i = newValue.length - 1;
    let j = oldValue.length - 1;
    while ((i > -1) && (j > -1)) {
      if (groupDelimiters.indexOf(newValue[i]) > -1) {
        i--;
        continue;
      }
      if (groupDelimiters.indexOf(oldValue[j]) > -1) {
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
