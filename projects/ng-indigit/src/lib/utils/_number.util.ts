import { TInput } from '../types';
import { BASIC_UTIL } from './_basic.util';

export const NUMBER_UTIL: {
  sanitize: (subject: TInput) => string;
  faToEn: (value: TInput) => string;
} = {

  sanitize: s => BASIC_UTIL.stringify(s)?.replace(/\D/g, '') || '',

  faToEn: (subject) => {
    const value = (typeof subject === 'string') ? subject : BASIC_UTIL.stringify(subject);
    return value
      ?.replace(/[\u0660-\u0669]/g, c => `${c.charCodeAt(0) - 0x0660}`)
      ?.replace(/[\u06f0-\u06f9]/g, c => `${c.charCodeAt(0) - 0x06f0}`) || '';
  }

};
