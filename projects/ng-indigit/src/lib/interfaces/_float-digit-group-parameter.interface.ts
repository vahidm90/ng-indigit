import { IDigitGroupParameter } from './_digit-group-parameter.interface';

export interface IFloatDigitGroupParameter {
  decimalDigitGroups: IDigitGroupParameter;
  integerDigitGroups: IDigitGroupParameter;
  hasDigitGroups: boolean;
}
