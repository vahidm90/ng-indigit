import { TCustomCharacter, TInput } from '../types';
export declare const FLOAT_UTIL: {
    sanitize: (subject: TInput, floatPoint: TCustomCharacter) => string;
    getIntPart: (subject: TInput, floatPoint: TCustomCharacter, isSafeSubject?: true) => string;
    getDecimals: (subject: TInput, floatPoint: TCustomCharacter, isSafeSubject?: true) => string;
};
