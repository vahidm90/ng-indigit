import { IDigitGroupParam } from '../interfaces';

export function isDigitGroupOptionObject(value: any): value is Partial<IDigitGroupParam> {
  return value
    && (typeof value === 'object')
    && (['groupSize', 'delimiter'] as (keyof IDigitGroupParam)[]).some(key => key in value);
}

