import { TCustomCharacter, TInput } from '../types';
import { PrettyFloat } from '../classes';
import { IPrettyFloatDigitGroupParam } from '../interfaces';
export declare const PRETTY_FLOAT_UTIL: {
    sanitize: (subject: TInput, floatPoint: TCustomCharacter, digitGroup?: IPrettyFloatDigitGroupParam, isSafeSubject?: true) => string;
    findFirstChangedIndex: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
    findFirstChangedIndexFromEnd: (newSubject: PrettyFloat, oldSubject: PrettyFloat) => number;
};
