import { TValue } from '../types';
import { BASIC_UTIL } from './_basic.util';

export const NUMBER_UTIL: {
  sanitize: (subject: TValue) => string;
  faToEn: (value: TValue) => string;
} = {

  sanitize: s => BASIC_UTIL.stringify(s)?.replace(/\D/g, '') || '',

  faToEn: t => {
    return BASIC_UTIL.stringify(t)
      ?.replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x0660))
      ?.replace(/[\u06f0-\u06f9]/g, c => String(c.charCodeAt(0) - 0x06f0)) || '';
  }

};