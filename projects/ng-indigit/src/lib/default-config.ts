import { IDigitGroupParameter, IPrettyFloatDecimalPartConfig } from './interfaces';

export const DEFAULT_CONFIG: {
  decimal: IPrettyFloatDecimalPartConfig;
  digitGroups: IDigitGroupParameter;
} = {
  decimal: {
    point: '.',
    minDigitCount: 0,
    maxDigitCount: -1
  },
  digitGroups: {
    groupSize: 3,
    delimiter: ' '
  }
};

