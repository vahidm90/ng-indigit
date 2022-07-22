import { IDecimalPartParameter, IDigitGroupParameter } from './interfaces';

export const DEFAULT_CONFIG: {
  decimal: IDecimalPartParameter;
  decimalDigitGroups: IDigitGroupParameter;
  integerDigitGroups: IDigitGroupParameter;
} = {
  decimal: {
    point: '/',
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

