import { TDigitGroupDelimiter, TValue } from '../types';
import { NUMBER_UTIL } from './_number.util';
import { IDigitGroupParameter } from '../interfaces';

export const DIGIT_GROUP_UTIL: {
  add: (subject: TValue, params: IDigitGroupParameter) => string;
  countGroups: (subject: TValue, groupSize: number) => number;
  getDelimiterIndices: (subject: TValue, delimiter: TDigitGroupDelimiter, limit: number) => number[];
  getAddedLengthAfterGrouping: (subject: TValue, delimiter: TDigitGroupDelimiter, limit: number) => number;
  haveEqualGroupsCount: (groupLength: number, ...subjects: TValue[]) => boolean;
} = {

  add: (s, p) => {
    const value = NUMBER_UTIL.sanitize(s);
    return p.groupSize
      ? (value?.replace(RegExp('(\\d)(?=(\\d{' + p.groupSize + '})+$)', 'g'), '$1' + p.delimiter) || '')
      : value;
  },

  countGroups: (s, l) => Math.ceil(NUMBER_UTIL.sanitize(s).length / l),

  getDelimiterIndices: (subject, delimiter, limit) => {
    const indices: number[] = [];
    const value = NUMBER_UTIL.sanitize(subject);
    for (let i = 0, j = 0; (i < value.length) && (j < limit); i++)
      if (value[i] === delimiter)
        indices.push(i);
      else
        j++;
    return indices;
  },

  getAddedLengthAfterGrouping: function (subject, delimiter, limit) {
    let delta = 0;
    this.getDelimiterIndices(subject, delimiter, limit).forEach(i => delta += Number(i <= limit));
    return delta;
  },

  haveEqualGroupsCount: function (l, ...s) {
    const pivot = this.countGroups(s[0], l);
    const subjects = s.slice(1);
    for (const subject of subjects)
      if (this.countGroups(subject, l) !== pivot)
        return false;
    return true;
  }

};
