import { IDigitGroupParameter } from './_digit-group-parameter.interface';

export interface IPrettyFloatDigitGroupParameter {
  decimalDigitGroups: IDigitGroupParameter;
  integerDigitGroups: IDigitGroupParameter;
  hasDigitGroups: boolean;
}
