import { TDecimalPartConfig, TDigitGroupConfig } from './types';

export const DEFAULT_CONFIG: {
  decimal: TDecimalPartConfig;
  decimalDigitGroups: TDigitGroupConfig;
  integerDigitGroups: TDigitGroupConfig;
} = {
  decimal: {
    separator: '/',
    minDigitCount: 0,
    maxDigitCount: -1
  },
  decimalDigitGroups: {
    groupSize: 3,
    delimiter: ' '
  },
  integerDigitGroups: {
    groupSize: 3,
    delimiter: ','
  }
};

