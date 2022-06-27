import { IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter } from '../interfaces';
import { DEFAULT_CONFIG } from '../default-config';
import { isDecimalPartConfigObject, isDigitGroupConfigObject } from '../type-predicates';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TFloatPart } from '../types';

export const PRETTY_FLOAT_PARAMETER_UTIL: {
  decimal: (option: any) => IPrettyFloatDecimalPartParameter;
  digitGroup:
    (args: [
      { parameters: any; part: Extract<TFloatPart, 'integer'>; },
      { parameters: any; part: Extract<TFloatPart, 'decimal'>; }
    ]) => IPrettyFloatDigitGroupParameter;
} = {

  decimal: o => {
    const defaults = { ...DEFAULT_CONFIG.decimal, allowDecimal: true, } as IPrettyFloatDecimalPartParameter;
    if (o == null)
      return defaults;
    if (isDecimalPartConfigObject(o))
      return { ...defaults, ...o, hasCustomSeparator: !!o.separator };
    return { ...defaults, allowDecimal: coerceBooleanProperty(o), hasCustomSeparator: true };
  },

  digitGroup: o => {
    const defaults = {
      decimalDigitGroups: { ...DEFAULT_CONFIG.decimalDigitGroups },
      integerDigitGroups: { ...DEFAULT_CONFIG.integerDigitGroups },
      hasDigitGroups: true,
    } as IPrettyFloatDigitGroupParameter;
    const params: IPrettyFloatDigitGroupParameter = Object.assign({}, defaults);
    o.forEach(c => {
      if ((c.part !== 'integer') && (c.part !== 'decimal'))
        return;
      const key = (c.part + 'DigitGroups') as keyof Omit<IPrettyFloatDigitGroupParameter, 'hasDigitGroups'>;
      if (isDigitGroupConfigObject(c.parameters))
        params[key] = { ...defaults[key], ...c.parameters };
      else if (c.parameters === false)
        params[key] = { ...defaults[key], groupSize: 0 };
    });
    return { ...params, hasDigitGroups: coerceBooleanProperty(o) };
  }

};
