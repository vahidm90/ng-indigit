import { IDigitGroupParam, IPrettyFloatDecimalParam } from '../interfaces';

export const DEFAULT_CONFIG: {
  decimal: Partial<IPrettyFloatDecimalParam>;
  digitGroups: IDigitGroupParam;
} = {
  decimal: {
    floatPoint: '.',
    minDigitCount: 0,
    maxDigitCount: -1,
  },
  digitGroups: {
    groupSize: 3,
    delimiter: ' '
  }
};

