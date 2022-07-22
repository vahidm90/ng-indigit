import { PrettyFloat } from '../classes';
import { ISelectionIndices } from './_selection-indices.interface';

export interface IIndigitState {
  value: PrettyFloat | null;
  selectionIndices: ISelectionIndices;
}
