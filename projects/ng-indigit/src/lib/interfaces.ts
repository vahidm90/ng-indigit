export type DigitGroupDelimiter = ',' | ' ';

export type DecimalSeparator = '/' | '.';

export type IndicatorPosition = 'afterDecimalSeparator' | 'beforePreviousDecimalPart' | number;

export interface DecimalParameters {
  decimalSeparator?: DecimalSeparator;
  maxDecimalDigits?: number;
  minDecimalDigits?: number;
}

export interface DecimalDigitGroupingParameters {
  delimiter?: DigitGroupDelimiter;
  groupSize?: number;
}

export interface DigitGroupingParameters extends DecimalDigitGroupingParameters {
  decimalDigitGroups?: boolean | DecimalDigitGroupingParameters;
  integerDigitGroups?: boolean | DecimalDigitGroupingParameters;
}

