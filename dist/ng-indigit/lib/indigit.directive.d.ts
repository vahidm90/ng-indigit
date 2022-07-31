import { ElementRef, Renderer2 } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { PrettyFloat } from './classes';
import * as i0 from "@angular/core";
export declare class IndigitDirective implements ControlValueAccessor {
    private _el;
    private _render;
    set decimalDigitGroups(params: any);
    set integerDigitGroups(params: any);
    set decimal(params: any);
    set allowNegative(value: any);
    private _value;
    private _selection;
    private _isContinuousKeydown;
    private _inputElement;
    private _nextIndicatorPosition;
    private _history;
    private _allowNegative;
    private _onChange;
    private _onTouched;
    constructor(_el: ElementRef, _render: Renderer2);
    set value(newValue: PrettyFloat);
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    setDisabledState(isDisabled: boolean): void;
    onKeyup(): void;
    onKeydown(event: KeyboardEvent): void;
    onMousedown(): void;
    onInput(): void;
    onBlur(): void;
    private set hostValue(value);
    private set modelValue(value);
    private set hostSelectionStart(value);
    private set hostSelectionEnd(value);
    private set hostSelection(value);
    private set selection(value);
    private set indicatorPosition(value);
    private get selectionIndicesFromHost();
    private get selectionStartFromHost();
    private get selectionEndFromHost();
    private updateSelectionIndicesFromHost;
    private onZeroSelectionKeydown;
    private isBackspaceKeyAfterDigitGroupDelimiter;
    private isDeleteKeyBeforeDigitGroupDelimiter;
    private getIndicatorPositionAfterSingleCharacterChange;
    private saveState;
    private undo;
    private clearHistory;
    private reset;
    private init;
    private updateAfterUserInput;
    private getIndicatorPositionAfterUserInput;
    private getIndicatorPositionByReverseOldIndex;
    static ɵfac: i0.ɵɵFactoryDeclaration<IndigitDirective, [{ self: true; }, null]>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<IndigitDirective, "input[type=\"text\"][ng-indigit]", never, { "decimalDigitGroups": "decimalDigitGroups"; "integerDigitGroups": "integerDigitGroups"; "decimal": "decimal"; "allowNegative": "allowNegative"; }, {}, never>;
}