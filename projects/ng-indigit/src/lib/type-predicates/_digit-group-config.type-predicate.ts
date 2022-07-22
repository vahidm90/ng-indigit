import { TDigitGroupConfig } from '../types';

export function isDigitGroupConfigObject(value: any): value is TDigitGroupConfig {
  return value && (typeof value === 'object') && ['delimiter', 'groupSize'].some(key => key in value);
}

