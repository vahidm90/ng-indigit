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

  decimal: o => {
    const defaults = { ...DEFAULT_CONFIG.decimal, allowDecimal: true, } as IPrettyFloatDecimalPartParameter;
    if (o == null)
      return defaults;
    if (isDecimalPartConfigObject(o))
      return { ...defaults, ...o, hasCustomSeparator: !!o.separator };
    return { ...defaults, allowDecimal: coerceBooleanProperty(o), hasCustomSeparator: true };
  },

  digitGroup: (...o) => {
    const defaults = {
      decimalDigitGroups: { ...DEFAULT_CONFIG.decimalDigitGroups },
      integerDigitGroups: { ...DEFAULT_CONFIG.integerDigitGroups },
      hasDigitGroups: true,
    } as IPrettyFloatDigitGroupParameter;
    const params: IPrettyFloatDigitGroupParameter = { ...defaults };
    if (!o)
      return defaults;
    o.forEach(c => {
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
      hasDigitGroups:
        !!params.decimalDigitGroups.groupSize || !!params.integerDigitGroups.groupSize || coerceBooleanProperty(o)
    };
  }

};
