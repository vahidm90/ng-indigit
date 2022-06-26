import { TDecimalPartConfig } from '../types';

export function isDecimalPartConfigObject(value: any): value is TDecimalPartConfig {
  return (typeof value === 'object') && ['separator', 'maxDigitCount', 'minDigitCount'].some(key => key in value);
}
