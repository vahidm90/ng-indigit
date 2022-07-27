import { IDigitGroupParam, IPrettyFloatDigitGroupOption } from '../interfaces';

export type TPrettyFloatDigitGroupOption
  = boolean | Partial<IDigitGroupParam> | IPrettyFloatDigitGroupOption;
