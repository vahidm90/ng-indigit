import { TDecimalSeparator, TDigitGroupDelimiter } from '../types';

export interface IIndicatorPositionParameter {
  preDeleteIndex: number;
  delimiter: TDigitGroupDelimiter;
  postDeleteVal: string;
  preDeleteVal: string;
  decimalSeparator: TDecimalSeparator;
}
