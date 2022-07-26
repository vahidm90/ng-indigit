import { TInput } from '../types';

const isNullSubject: (subject: TInput) => boolean = subject => (subject == null) || (`${subject}`.trim() === '');

export const BASIC_UTIL: {
  stringify: (subject: TInput) => string;
  makeBoolean: (value: any) => boolean;
} = {

  stringify: s => {
    if (isNullSubject(s))
      return '';
    return ((typeof s === 'string') ? s : `${s}`).trim();
  },

  makeBoolean: v => v != null && `${v}` !== 'false'

};
