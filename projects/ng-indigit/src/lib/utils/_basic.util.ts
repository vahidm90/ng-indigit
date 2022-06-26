import { TValue } from '../types';

const isNullSubject: (subject: TValue) => boolean = s => (s == null) || (String(s).trim() === '');

export const BASIC_UTIL: {
  stringify: (subject: TValue) => string;
} = {

  stringify: s => {
    if (isNullSubject(s))
      return '';
    return ((typeof s === 'string') ? s : String(s)).trim();
  }

};
