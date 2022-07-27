import { IPrettyFloatDigitGroupOption } from '../interfaces';

export function isPrettyFloatDigitGroupOptionObject(value: any): value is IPrettyFloatDigitGroupOption {
  return value
    && (typeof value === 'object')
    && (['decimalPart', 'integerPart', 'hasDigitGroups'] as (keyof IPrettyFloatDigitGroupOption)[])
      .some(key => key in value);
}

