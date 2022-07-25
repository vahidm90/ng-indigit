import { IDecimalPartParameter } from './_decimal-part-parameter.interface';
import { TFloatPoint } from '../types';

export interface IPrettyFloatDecimalPartConfig extends Omit<IDecimalPartParameter, 'point'> {
  point: TFloatPoint;
}
