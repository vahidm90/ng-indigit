import { PrettyFloat } from '../classes';
import { ISelectionIndices } from './selection-indices.interface';

export interface IIndigitState {
  value: PrettyFloat | null;
  selectionIndices: ISelectionIndices;
}
