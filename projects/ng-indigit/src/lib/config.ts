import { DecimalParameters, DigitGroupingParameters } from './interfaces';

export const DIGIT_GROUPING_DEFAULTS: Required<Omit<DigitGroupingParameters, 'delimiter'>> = {
  groupSize: 3,
  integerDigitGroups: { delimiter: ',' },
  decimalDigitGroups: { delimiter: ' ' }
};

export const DECIMAL_DEFAULTS: Required<DecimalParameters> = {
  decimalSeparator: '/',
  minDecimalDigits: 0,
  maxDecimalDigits: 4
};

