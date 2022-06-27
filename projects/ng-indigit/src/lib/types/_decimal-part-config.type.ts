import { IDecimalPartParameter } from '../interfaces';

export type TDecimalPartConfig<TNested extends Partial<IDecimalPartParameter> | boolean
  = Partial<IDecimalPartParameter>> = TNested;
