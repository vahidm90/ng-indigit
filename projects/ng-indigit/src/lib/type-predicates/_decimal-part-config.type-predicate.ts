import { TDecimalPartConfig } from '../types';

export function isDecimalPartConfigObject(value: any): value is TDecimalPartConfig {
  return value && (typeof value === 'object') && ['point', 'maxDigitCount', 'minDigitCount'].some(key => key in value);
}
