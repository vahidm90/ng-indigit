export type DigitGroupDelimiter = ',' | ' ';

export type IndicatorPosition
  = 'afterDecimalSeparator' | 'beforePreviousDecimalPart' | 'afterLastUserModification' | number;

export type DecimalSeparator = '/' | '.';

export interface IndexPositioningParam {
  preDeleteVal: string;
  postDeleteVal: string;
  preDeleteIndex: number;
  delimiter: DigitGroupDelimiter;
  decimalSeparator: DecimalSeparator;
}

export interface DigitGroupingDelimiterPositionsParam {
  subject: string;
  delimiter: DigitGroupDelimiter;
  maxDigits: number;
}

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

