import { IPrettyFloatDecimalParam } from '../interfaces';

export function isPrettyFloatDecimalOptionObject(value: any): value is Partial<IPrettyFloatDecimalParam> {
  return value
    && (typeof value === 'object')
    && (['floatPoint', 'isDecimalAllowed', 'maxDigitCount', 'minDigitCount'] as (keyof IPrettyFloatDecimalParam)[])
      .some(key => key in value);
}
