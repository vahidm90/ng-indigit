import { TInput } from '../types';

const isNullSubject: (subject: TInput) => boolean = s => (s == null) || (String(s).trim() === '');

export const BASIC_UTIL: {
  stringify: (subject: TInput) => string;
} = {

  stringify: s => {
    if (isNullSubject(s))
      return '';
    return ((typeof s === 'string') ? s : String(s)).trim();
  }

};
