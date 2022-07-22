import { TInput } from '../types';
import { NUMBER_UTIL } from './_number.util';
import { IDigitGroupParameter } from '../interfaces';

export const DIGIT_GROUP_UTIL: {
  apply: (subject: TInput, params: IDigitGroupParameter, isSafeSubject?: boolean) => string;
  countGroups: (subject: TInput, groupSize: number, isSafeSubject?: boolean) => number;
  getFirstDelimiterIndex: (subject: TInput, params: IDigitGroupParameter, isSafeSubject?: true) => number;
  getDelimiterIndices: (subject: TInput, params: IDigitGroupParameter, maxTraversedDigits: number) => number[];
  haveEqualGroupsCount: (groupLength: number, ...subjects: TInput[]) => boolean;
} = {

  apply: (subject, params, isSafeSubject) => {
    const value = isSafeSubject ? (subject as string) : NUMBER_UTIL.sanitize(subject);
    return params.groupSize
      ? (value
        ?.replace(RegExp('(\\d)(?=(\\d{' + params.groupSize + '})+$)', 'g'), '$1' + params.delimiter) || '')
      : value;
  },

  countGroups:
    (subject, groupSize, isSafeSubject?) =>
      Math.ceil((isSafeSubject ? (subject as string) : NUMBER_UTIL.sanitize(subject)).length / groupSize),

  getFirstDelimiterIndex: function (subject, params, isSafeSubject?) {
    const value = this.apply(subject, params, isSafeSubject);
    for (let i = 1; i < value.length; i++)
      if (value[i] === params.delimiter)
        return i;
    return -1;
  },

  getDelimiterIndices: function (subject, params, max) {
    const size = params.groupSize;
    const value = NUMBER_UTIL.sanitize(subject);
    const first = this.getFirstDelimiterIndex(value, params, true);
    const maxDigits = Math.min(max, value.length);
    if (!size || (first < 0) || (first >= max))
      return [];
    const indices: number[] = [first];
    const maxCount = this.countGroups(value, size, true) - 1;
    let i = 1;
    let nextIndex = first + size + 1;
    while ((i <= maxCount) && ((nextIndex - i) < maxDigits)) {
      const actualIndex = nextIndex - i;
      if (actualIndex < value.length && (actualIndex < max))
        indices.push(nextIndex);
      nextIndex += size + 1;
      i++;
    }
    return indices;
  },

  haveEqualGroupsCount: function (groupSize, ...subjects) {
    const sample = this.countGroups(subjects[0], groupSize);
    const tests = subjects.slice(1);
    for (const test of tests)
      if (this.countGroups(test, groupSize) !== sample)
        return false;
    return true;
  }

};
