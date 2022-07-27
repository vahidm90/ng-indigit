import { DEFAULT_CONFIG } from '../helpers/default-config';
import { isCharacter, isDigitGroupOptionObject, isPrettyFloatDecimalOptionObject, isPrettyFloatDigitGroupOptionObject } from '../type-predicates';
import { BASIC_UTIL } from './_basic.util';
import { IDigitGroupParam, IPrettyFloatDecimalParam, IPrettyFloatDigitGroupOption, IPrettyFloatDigitGroupParam } from '../interfaces';

const makeBoolean = BASIC_UTIL.makeBoolean;
const digitGroupDefaults: IPrettyFloatDigitGroupParam = {
  integerPart: { ...DEFAULT_CONFIG.digitGroups },
  decimalPart: { ...DEFAULT_CONFIG.digitGroups },
  hasDigitGroups: false
};

const sanitizeDigitGroupDelimiter: (params: Partial<IDigitGroupParam>) => Partial<IDigitGroupParam> = params => {
  const delimiter = params.delimiter;
  if (delimiter && !isCharacter(delimiter)) {
    console.warn('[NgIndigit] Invalid Digit Group Delimiter! The default character will be used!');
    delete params.delimiter;
  }
  return params;
};

const digitGroupParamFromGenericOption:
  (option: Partial<IDigitGroupParam>, preset: IPrettyFloatDigitGroupParam) => IPrettyFloatDigitGroupParam
  = (option, preset) => {
  const params = { ...preset };
  (['integerPart', 'decimalPart'] as (keyof Omit<IPrettyFloatDigitGroupParam, 'hasDigitGroups'>)[])
    .forEach(part => Object.assign(params[part], sanitizeDigitGroupDelimiter(option), params[part]));
  return params;
};

const digitGroupParamFromPrettyFloatOption:
  (option: IPrettyFloatDigitGroupOption, preset: IPrettyFloatDigitGroupParam) => IPrettyFloatDigitGroupParam
  = (option, preset) => {
  const params: IPrettyFloatDigitGroupParam = { ...preset };
  (['integerPart', 'decimalPart'] as (keyof Omit<IPrettyFloatDigitGroupParam, 'hasDigitGroups'>)[])
    .forEach(part => {
      const partOption = option[part];
      if (isDigitGroupOptionObject(partOption))
        params[part] = { ...params[part], ...sanitizeDigitGroupDelimiter(partOption) };
      else if (partOption === false)
        params[part] = { ...params[part], groupSize: 0 };
    });
  return params;
};

export const PRETTY_FLOAT_PARAM_UTIL: {
  decimal: (option: any) => IPrettyFloatDecimalParam;
  digitGroup: (...option: any[]) => IPrettyFloatDigitGroupParam;
} = {

  decimal: options => {
    const decimalDefaults = DEFAULT_CONFIG.decimal;
    const defaults = { ...decimalDefaults, isDecimalAllowed: false } as IPrettyFloatDecimalParam;
    if (isPrettyFloatDecimalOptionObject(options)) {
      const point = options.floatPoint;
      if (point && !isCharacter(point)) {
        console.warn('[NgIndigit] Invalid Float Point! The default character will be used!');
        delete options.floatPoint;
      }
      return { ...defaults, ...options, isDecimalAllowed: options.isDecimalAllowed ?? (options.maxDigitCount !== 0) };
    }
    return { ...defaults, isDecimalAllowed: makeBoolean(options) };
  },

  digitGroup: (...options) => {
    if (!makeBoolean(options))
      return digitGroupDefaults;
    let params: IPrettyFloatDigitGroupParam = { ...digitGroupDefaults };
    for (const option of options) {
      if (option == null)
        continue;
      if (isPrettyFloatDigitGroupOptionObject(option))
        params = digitGroupParamFromPrettyFloatOption(option, params);
      if (isDigitGroupOptionObject(option))
        params = digitGroupParamFromGenericOption(option, params);
      params.hasDigitGroups
        = option.hasDigitGroups ?? ((params.integerPart.groupSize > 0) || (params.decimalPart.groupSize > 0));
    }
    return params;
  }

};
