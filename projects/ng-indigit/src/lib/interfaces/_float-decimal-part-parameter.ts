import { IDecimalPartParameter } from './_decimal-part-parameter.interface';

export interface IFloatDecimalPartParameter extends IDecimalPartParameter {
  allowDecimal: boolean;
}
