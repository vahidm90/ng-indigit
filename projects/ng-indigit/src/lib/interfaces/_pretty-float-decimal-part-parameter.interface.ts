import { IDecimalPartParameter } from './_decimal-part-parameter.interface';

export interface IPrettyFloatDecimalPartParameter extends IDecimalPartParameter {
  allowDecimal: boolean;
  hasCustomPoint: boolean;
}
