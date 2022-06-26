import { TDigitGroupConfig } from '../types';

export function isDigitGroupConfigObject(value: any): value is TDigitGroupConfig {
  return (typeof value === 'object') && ['delimiter', 'groupSize'].some(key => key in value);
}

