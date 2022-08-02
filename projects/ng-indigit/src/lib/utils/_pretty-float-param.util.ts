import { isCharacter, isDigitGroupOptionObject, isPrettyFloatDecimalOptionObject, isPrettyFloatDigitGroupOptionObject } from '../type-predicates';
import { BASIC_UTIL } from './_basic.util';
import { IDigitGroupParam, IPrettyFloatDecimalParam, IPrettyFloatDigitGroupOption, IPrettyFloatDigitGroupParam } from '../interfaces';
import { DEFAULT_DECIMAL_CONFIG, DEFAULT_DIGIT_GROUP_CONFIG } from '../helpers';

const makeBoolean = BASIC_UTIL.makeBoolean;
const defaultDigitGroupConfig = DEFAULT_DIGIT_GROUP_CONFIG as IDigitGroupParam;
const digitGroupDefaults: IPrettyFloatDigitGroupParam = {
  integerPart: { ...defaultDigitGroupConfig },
  decimalPart: { ...defaultDigitGroupConfig },
  hasDigitGroups: false
};

const decimalParamFromOption:
  (option: Partial<IPrettyFloatDecimalParam>, preset: IPrettyFloatDecimalParam) => IPrettyFloatDecimalParam
  = (option, preset) => {
  const point = option.floatPoint;
  if (point && !isCharacter(point)) {
    console.warn('[NgIndigit] Invalid Float Point! The default character will be used!');
    delete option.floatPoint;
  }
  return { ...preset, ...option, isDecimalAllowed: option.isDecimalAllowed ?? (option.maxDigitCount !== 0) };
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
  decimal: (...options: any[]) => IPrettyFloatDecimalParam;
  digitGroup: (...options: any[]) => IPrettyFloatDigitGroupParam;
} = {

  decimal: (...options) => {
    const decimalDefaults = DEFAULT_DECIMAL_CONFIG as Partial<IPrettyFloatDecimalParam>;
    let params = { ...decimalDefaults, isDecimalAllowed: false } as IPrettyFloatDecimalParam;
    if (!makeBoolean(options))
      return params;
    for (const option of options) {
      params = isPrettyFloatDecimalOptionObject(option)
        ? decimalParamFromOption(option, params)
        : { ...params, isDecimalAllowed: makeBoolean(option) };
    }
    return params;
  },

  digitGroup: (...options) => {
    if (!makeBoolean(options))
      return digitGroupDefaults;
    let params: IPrettyFloatDigitGroupParam = { ...digitGroupDefaults };
    for (const option of options) {
      if (option === false) {
        params.hasDigitGroups = false;
        continue;
      }
      if (isPrettyFloatDigitGroupOptionObject(option))
        params = digitGroupParamFromPrettyFloatOption(option, params);
      if (isDigitGroupOptionObject(option))
        params = digitGroupParamFromGenericOption(option, params);
      params.hasDigitGroups = option.hasDigitGroups
        ?? ((params.integerPart.groupSize > 0) || (params.decimalPart.groupSize > 0));
    }
    return params;
  }

};
