import { PrettyFloat } from '../classes';
import { ITextInputSelection } from './_text-input-selection.interface';
export interface IIndigitState {
    value: PrettyFloat;
    selectionIndices: ITextInputSelection;
}
