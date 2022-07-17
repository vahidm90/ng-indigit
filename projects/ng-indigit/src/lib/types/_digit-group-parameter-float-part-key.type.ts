import { IPrettyFloatDigitGroupParameter } from '../interfaces';

export type TDigitGroupParameterFloatPartKey = keyof Omit<IPrettyFloatDigitGroupParameter, 'hasDigitGroups'>;
