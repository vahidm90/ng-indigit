import { TInput } from '../types';
import { NUMBER_UTIL } from './_number.util';
import { IDigitGroupParam } from '../interfaces';

export const DIGIT_GROUP_UTIL: {
  apply: (subject: TInput, params: IDigitGroupParam, isSafeSubject?: boolean) => string;
} = {

  apply: (subject, params, isSafeSubject) => {
    const value = isSafeSubject ? (subject as string) : NUMBER_UTIL.sanitize(subject);
    return params.groupSize
      ? (value?.replace(RegExp(`(\\d)(?=(\\d{${params.groupSize}})+$)`, 'g'), `$1${params.delimiter}`) || '')
      : value;
  }

};
