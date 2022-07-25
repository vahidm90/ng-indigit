import { IPrettyFloatDecimalPartConfig } from './_pretty-float-decimal-part-config.interface';

export interface IPrettyFloatDecimalPartParameter extends IPrettyFloatDecimalPartConfig {
  allowDecimal: boolean;
  hasCustomPoint: boolean;
}
