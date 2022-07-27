import { IDigitGroupParam } from './_digit-group-param.interface';

export interface IPrettyFloatDigitGroupParam {
  integerPart: IDigitGroupParam;
  decimalPart: IDigitGroupParam;
  hasDigitGroups: boolean;
}
