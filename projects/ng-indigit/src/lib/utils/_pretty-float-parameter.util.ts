import { IFloatPartDigitGroupConfig, IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter } from '../interfaces';
import { DEFAULT_CONFIG } from '../default-config';
import { isDecimalPartConfigObject, isDigitGroupConfigObject } from '../type-predicates';
import { TDigitGroupParameterFloatPartKey } from '../types';
import { BASIC_UTIL } from './_basic.util';

export const PRETTY_FLOAT_PARAMETER_UTIL: {
  decimal: (option: any) => IPrettyFloatDecimalPartParameter;
  digitGroup:
    (...args: IFloatPartDigitGroupConfig[]) => IPrettyFloatDigitGroupParameter;
} = {

  decimal: options => {
    const defaults: IPrettyFloatDecimalPartParameter = {
      ...DEFAULT_CONFIG.decimal,
      point: '.',
      allowDecimal: true,
      hasCustomPoint: false
    };
    if (isDecimalPartConfigObject(options))
      return { ...defaults, ...options, hasCustomPoint: !!options.point };
    return { ...defaults, allowDecimal: BASIC_UTIL.coerceBoolean(options) };
  },

  digitGroup: (...options) => {
    const params: Omit<IPrettyFloatDigitGroupParameter, 'hasDigitGroups'> = {
      decimalDigitGroups: { ...DEFAULT_CONFIG.digitGroups },
      integerDigitGroups: { ...DEFAULT_CONFIG.digitGroups },
    };
    if (!BASIC_UTIL.coerceBoolean(options) || options?.every(o => !BASIC_UTIL.coerceBoolean(o)))
      return { ...params, hasDigitGroups: false };
    options.forEach(o => {
      if ((!BASIC_UTIL.coerceBoolean(o)) || ((o.part !== 'integer') && (o.part !== 'decimal')))
        return;
      const key = (o.part + 'DigitGroups') as TDigitGroupParameterFloatPartKey;
      if (isDigitGroupConfigObject(o.params))
        params[key] = { ...params[key], ...o.params };
      else if (!BASIC_UTIL.coerceBoolean(o.params))
        params[key] = { ...params[key], groupSize: 0 };
    });
    return {
      ...params,
      hasDigitGroups: !!params.decimalDigitGroups.groupSize || !!params.integerDigitGroups.groupSize
    };
  }

};
