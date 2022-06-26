import { IDigitGroupParameter } from '../interfaces';

export type TDigitGroupConfig<TNested extends boolean | Partial<IDigitGroupParameter> = Partial<IDigitGroupParameter>>
  = TNested;
