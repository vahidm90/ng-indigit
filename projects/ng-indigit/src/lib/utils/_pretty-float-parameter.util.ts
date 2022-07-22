import { IFloatPartDigitGroupConfig, IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter } from '../interfaces';
import { DEFAULT_CONFIG } from '../default-config';
import { isDecimalPartConfigObject, isDigitGroupConfigObject } from '../type-predicates';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TDigitGroupParameterFloatPartKey } from '../types';

export const PRETTY_FLOAT_PARAMETER_UTIL: {
  decimal: (option: any) => IPrettyFloatDecimalPartParameter;
  digitGroup:
    (...args: IFloatPartDigitGroupConfig[]) => IPrettyFloatDigitGroupParameter;
} = {

  decimal: options => {
    const defaults: IPrettyFloatDecimalPartParameter = {
      ...DEFAULT_CONFIG.decimal,
      allowDecimal: true,
      hasCustomPoint: true
    };
    if (isDecimalPartConfigObject(options))
      return { ...defaults, ...options, hasCustomPoint: !!options.point };
    return { ...defaults, allowDecimal: coerceBooleanProperty(options) };
  },

  digitGroup: (...options) => {
    const defaults = {
      decimalDigitGroups: { ...DEFAULT_CONFIG.decimalDigitGroups },
      integerDigitGroups: { ...DEFAULT_CONFIG.integerDigitGroups },
      hasDigitGroups: true,
    } as IPrettyFloatDigitGroupParameter;
    const params: IPrettyFloatDigitGroupParameter = { ...defaults };
    if (!coerceBooleanProperty(options) || options?.every(o => !coerceBooleanProperty(o)))
      return { ...defaults, hasDigitGroups: false };
    options.forEach(c => {
      if ((c.part !== 'integer') && (c.part !== 'decimal'))
        return;
      const key = (c.part + 'DigitGroups') as TDigitGroupParameterFloatPartKey;
      if (isDigitGroupConfigObject(c.params))
        params[key] = { ...defaults[key], ...c.params };
      else if (c.params === false)
        params[key] = { ...defaults[key], groupSize: 0 };
    });
    return {
      ...params,
      hasDigitGroups: !!params.decimalDigitGroups.groupSize || !!params.integerDigitGroups.groupSize
    };
  }

};
