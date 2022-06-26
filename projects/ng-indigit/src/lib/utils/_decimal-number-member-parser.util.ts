import { IFloatDecimalPartParameter, IFloatDigitGroupParameter } from '../interfaces';
import { DEFAULT_CONFIG } from '../default-config';
import { isDecimalPartConfigObject, isDigitGroupConfigObject } from '../type-predicates';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { TFloatPart } from '../types';

export const FLOAT_PARAMETER_UTIL: {
  decimal: (option: any) => IFloatDecimalPartParameter;
  digitGroup:
    (args: [
      { parameters: any; part: Extract<TFloatPart, 'integer'>; },
      { parameters: any; part: Extract<TFloatPart, 'decimal'>; }
    ]) => IFloatDigitGroupParameter;
} = {

  decimal: o => {
    const defaults = { ...DEFAULT_CONFIG.decimal, allowDecimal: true } as IFloatDecimalPartParameter;
    if (isDecimalPartConfigObject(o))
      return { ...defaults, ...o };
    return { ...defaults, allowDecimal: coerceBooleanProperty(o) };
  },

  digitGroup: o => {
    const defaults = {
      decimalDigitGroups: { ...DEFAULT_CONFIG.decimalDigitGroups },
      integerDigitGroups: { ...DEFAULT_CONFIG.integerDigitGroups },
      hasDigitGroups: true,
    } as IFloatDigitGroupParameter;
    const params: IFloatDigitGroupParameter = Object.assign({}, defaults);
    o.forEach(c => {
      if ((c.part !== 'integer') && (c.part !== 'decimal'))
        return;
      const key = (c.part + 'DigitGroups') as keyof Omit<IFloatDigitGroupParameter, 'hasDigitGroups'>;
      if (isDigitGroupConfigObject(c.parameters))
        params[key] = { ...defaults[key], ...c.parameters };
      else if (c.parameters === false)
        params[key] = { ...defaults[key], groupSize: 0 };
    });
    return { ...params, hasDigitGroups: coerceBooleanProperty(o) };
  }

};
