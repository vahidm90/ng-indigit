import { TCustomCharacter, TInput } from '../types';
import { IPrettyFloatDigitGroupParam } from '../interfaces';
import { FLOAT_UTIL } from './_float.util';
import { DIGIT_GROUP_UTIL } from './_digit-group.util';

export const PRETTY_FLOAT_UTIL: {
  sanitize:
      (subject: TInput, floatPoint: TCustomCharacter, digitGroup?: IPrettyFloatDigitGroupParam, isSafeSubject?: true)
          => string;
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
        , digitGroup.integerPart
        , true)}${pointChar}${DIGIT_GROUP_UTIL.apply(decimals, digitGroup.decimalPart, true)}`
      : `${sign}${intPart}${pointChar}${decimals}`;
  }

};
