import { Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { TIndicatorPosition } from './types';
import { IIndigitState, ITextInputSelection } from './interfaces';
import { PrettyFloat } from './classes';
import { BASIC_UTIL, PRETTY_FLOAT_UTIL } from './utils';

@Directive({
  selector: 'input[type="text"][ng-indigit]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // eslint-disable-next-line no-use-before-define
    useExisting: forwardRef(() => IndigitDirective),
    multi: true
  }]
})
export class IndigitDirective implements ControlValueAccessor, OnDestroy {

  @Input()
  set decimalDigitGroups(params: any) {
    this.clearHistory();
    this.value = this._value.updateDecimalsDigitGroupParams(params);
  }

  @Input()
  set integerDigitGroups(params: any) {
    this.clearHistory();
    this.value = this._value.updateIntPartDigitGroupParams(params);
  }

  @Input()
  set decimal(params: any) {
    this.clearHistory();
    this.value = this._value.updateDecimalParams(params);
  }

  @Input()
  set allowNegative(value: any) {
    this.clearHistory();
    this._allowNegative = BASIC_UTIL.makeBoolean(value);
  }

  private _value!: PrettyFloat;
  private _selection!: ITextInputSelection;
  private _isContinuousKeydown!: boolean;
  private _inputElement!: HTMLInputElement;
  private _nextIndicatorPosition!: TIndicatorPosition;
  private _history: IIndigitState[] = [];
  private _allowNegative: boolean = true;
  private _destroy$ = new Subject<void>();
  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  constructor(@Self() private _el: ElementRef, private _render: Renderer2) {
    this.init();
  }

  set value(newValue: PrettyFloat) {
    this._value = newValue;
    this.hostValue = newValue.prettyValue;
    this.modelValue = newValue.numberValue;
  }

  writeValue(value: any): void {
    this._value.updateValue(value);
    this.hostValue = this._value.prettyValue;
  }

  registerOnChange(fn: any): void {this._onChange = fn;}

  registerOnTouched(fn: any): void {this._onTouched = fn;}

  setDisabledState(isDisabled: boolean): void {
    if (this._inputElement)
      this._render.setProperty(this._inputElement, 'disabled', isDisabled);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  @HostListener('keyup')
  onKeyup(): void {
    this._isContinuousKeydown = false;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this._isContinuousKeydown)
      return;
    if (event.repeat) {
      this._isContinuousKeydown = true;
      return;
    }
    const keyCode = event.code;
    if (event.ctrlKey && (keyCode === 'keyZ')) {
      this.undo();
      return;
    }
    this.updateSelectionIndicesFromHost();
    const indices = this._selection;
    const indicatorPosition = indices.endIndex;
    if (indicatorPosition === indices.startIndex)
      return this.onZeroSelectionKeydown(keyCode, indicatorPosition);
    this._nextIndicatorPosition = 'beforeOldRightSide';
  }

  @HostListener('mousedown')
  onMousedown(): void {
    this.updateSelectionIndicesFromHost();
  }

  @HostListener('blur')
  onBlur(): void {
    this._onTouched();
  }

  private set hostValue(value: string) {
    if (!this._inputElement)
      throw new Error('No host element found!');
    this._render.setProperty(this._inputElement, 'value', value);
  }

  private set modelValue(value: number | null) {
    this._onChange(value);
  }

  private set hostSelectionStart(index: number) {
    if (!this._inputElement)
      throw new Error('No host element found!');
    this._render.setProperty(this._inputElement, 'selectionStart', index);
  }

  private set hostSelectionEnd(index: number) {
    if (!this._inputElement)
      throw new Error('No host element found!');
    this._render.setProperty(this._inputElement, 'selectionEnd', index);
  }

  private set hostSelection(indices: ITextInputSelection) {
    this.hostSelectionStart = indices.startIndex;
    this.hostSelectionEnd = indices.endIndex;
  }

  private set selection(indices: ITextInputSelection) {
    this._selection = indices;
    this.hostSelection = indices;
  }

  private set indicatorPosition(position: number) {
    this.selection = { endIndex: position, startIndex: position };
  }

  private get selectionIndicesFromHost(): ITextInputSelection {
    return { startIndex: this.selectionStartFromHost, endIndex: this.selectionEndFromHost };
  }

  private get selectionStartFromHost(): number {
    return this._inputElement?.selectionStart || 0;
  }

  private get selectionEndFromHost(): number {
    return this._inputElement?.selectionEnd || 0;
  }

  private updateSelectionIndicesFromHost(): void {
    this._selection = this.selectionIndicesFromHost;
  }

  private onZeroSelectionKeydown(keyCode: string, indicatorPosition: number): void {
    this._nextIndicatorPosition = this.getIndicatorPositionAfterSingleCharacterChange(keyCode);
    if (this.isBackspaceKeyAfterDigitGroupDelimiter(keyCode, indicatorPosition)) {
      this.indicatorPosition = indicatorPosition - 1;
      return;
    }
    if (this.isDeleteKeyBeforeDigitGroupDelimiter(keyCode, indicatorPosition))
      this.indicatorPosition = indicatorPosition + 1;
  }

  private isBackspaceKeyAfterDigitGroupDelimiter(keyCode: string, indicatorPosition: number): boolean {
    const value = this._value;
    return !!value
      && (keyCode === 'Backspace')
      && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition - 1]) > -1);
  }

  private isDeleteKeyBeforeDigitGroupDelimiter(keyCode: string, indicatorPosition: number): boolean {
    const value = this._value;
    return !!value
      && (keyCode === 'Delete')
      && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition]) > -1);
  }

  private getIndicatorPositionAfterSingleCharacterChange(keyCode: string): TIndicatorPosition {
    const decimalParams = this._value.decimalParams;
    if (decimalParams.isDecimalAllowed && (this._value.pointIndex.prettyIndex < 0) && (keyCode === decimalParams.floatPoint))
      return 'afterFloatPoint';
    if (keyCode === 'Delete')
      return 'afterOldLeftSide';
    return 'beforeOldRightSide';
  }

  private saveState(): void {
    this._history.push({
      value: this._value.clone(),
      selectionIndices: this._selection
    });
  }

  private undo(): void {
    const lastState = this._history.pop();
    if (!lastState) {
      this.reset();
      return;
    }
    this.value = lastState.value;
    this.selection = lastState.selectionIndices;
  }

  private clearHistory(): void {
    this._history = [];
  }

  private reset(): void {
    this.clearHistory();
    this.value = this._value.updateValue(null);
    this.indicatorPosition = 0;
  }

  private init(): void {
    this._inputElement = this._el.nativeElement as HTMLInputElement;
    if (!this._inputElement)
      throw new Error('No host element found!');
    this.value = new PrettyFloat(this._inputElement.value);
    this.bindInputEvent();
  }

  private bindInputEvent(): void {
    if (!this._inputElement)
      throw new Error('No host element found!');
    fromEvent<InputEvent>(this._inputElement, 'input')
      .pipe(takeUntil(this._destroy$))
      .subscribe(_ => this.onUserInput(this._inputElement.value));
  }

  private onUserInput(input: string): void {
    this.saveState();
    const newValue = this._value.updateValue(input);
    const history = this._history;
    const lastState = history[history.length - 1]?.value;
    const oldValue = lastState || null;
    if (!oldValue?.prettyValue || !newValue.prettyValue)
      this._nextIndicatorPosition = 'endOfLine';
    const oldForcedDecimals = oldValue?.forcedDecimals;

    // strip appended 0 decimals of old value in case float point is removed
    if (oldForcedDecimals && newValue && (newValue.pointIndex.prettyIndex < 0)) {
      newValue.updateValue(`${newValue.numberValue}`.slice(0, -oldForcedDecimals));
      oldValue?.updateValue(`${oldValue?.numberValue}`.slice(0, -oldForcedDecimals));
    }

    this.value = newValue;
    this.indicatorPosition = this.getIndicatorPositionAfterUserInput(newValue, oldValue);
  }

  private getIndicatorPositionAfterUserInput(newValue: PrettyFloat, oldValue: PrettyFloat | null): number {
    const newValueEndIndex = newValue.prettyValue.length;
    if (!oldValue)
      return newValueEndIndex;
    switch (this._nextIndicatorPosition) {
      case 'endOfLine':
        return newValueEndIndex;
      case 'afterFloatPoint':
        return newValue.pointIndex.prettyIndex + 1;
      case 'afterOldLeftSide':
        return PRETTY_FLOAT_UTIL.findFirstChangedIndex(newValue, oldValue);
      default:
        return this.getIndicatorPositionByReverseOldIndex(newValue, oldValue);
    }
  }

  private getIndicatorPositionByReverseOldIndex(newValue: PrettyFloat, oldValue: PrettyFloat): number {
    const selectionIndices = this._history[this._history.length - 1].selectionIndices;
    const selectionIndex = Math.max(selectionIndices.startIndex, selectionIndices.endIndex);
    const oldPretty = oldValue.prettyValue;
    const newValueLength = newValue.prettyValue.length;
    if (selectionIndex >= oldPretty.length)
      return newValueLength;
    return newValue.digitGroupParams.hasDigitGroups
      ? (PRETTY_FLOAT_UTIL.findFirstChangedIndexFromEnd(newValue, oldValue) + 1)
      : (newValueLength - oldPretty.substring(selectionIndex).length);
  }

}
