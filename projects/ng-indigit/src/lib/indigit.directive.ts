import { Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { TDigitGroupDelimiter, TIndicatorPosition } from './types';
import { IFloatPartDigitGroupConfig, IIndigitState, IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter, ISelectionIndices } from './interfaces';
import { PrettyFloat } from './classes';
import { PRETTY_FLOAT_PARAMETER_UTIL, PRETTY_FLOAT_UTIL } from './utils';

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
    const config: IFloatPartDigitGroupConfig = { part: 'decimal', params };
    this._digitGroupParams = this._value
      ? this.updateDigitGroupConfig(config)
      : PRETTY_FLOAT_PARAMETER_UTIL.digitGroup(config);
  }

  @Input()
  set integerDigitGroups(params: any) {
    this.clearHistory();
    const config: IFloatPartDigitGroupConfig = { part: 'integer', params };
    this._digitGroupParams = this._value
      ? this.updateDigitGroupConfig(config)
      : PRETTY_FLOAT_PARAMETER_UTIL.digitGroup(config);
  }

  @Input()
  set decimal(params: any) {
    this.clearHistory();
    this._decimalParams = this._value ? this.updateDecimalConfig(params) : PRETTY_FLOAT_PARAMETER_UTIL.decimal(params);
  }

  @Input()
  set allowNegative(value: any) {
    this.clearHistory();
    this._allowNegative = coerceBooleanProperty(value);
  }

  private _value!: PrettyFloat | null;
  private _decimalParams!: IPrettyFloatDecimalPartParameter;
  private _digitGroupParams!: IPrettyFloatDigitGroupParameter;
  private _selectionIndices!: ISelectionIndices;
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

  set value(newValue: PrettyFloat | null) {
    this._value = newValue;
    const value = newValue?.value;
    this.hostValue = value?.pretty || '';
    this.modelValue = value?.number ?? null;
  }

  writeValue(value: any): void {
    this._value = (value == null) ? null : new PrettyFloat(value, this._decimalParams, this._digitGroupParams);
    this.hostValue = value?.pretty || '';
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
    const indices = this._selectionIndices;
    const indicatorPosition = indices.end;
    if (indicatorPosition === indices.start)
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

  private set hostSelectionIndices(indices: ISelectionIndices) {
    this.hostSelectionStart = indices.start;
    this.hostSelectionEnd = indices.end;
  }

  private set selectionIndices(indices: ISelectionIndices) {
    this._selectionIndices = indices;
    this.hostSelectionIndices = indices;
  }

  private set indicatorPosition(position: number) {
    this.selectionIndices = { end: position, start: position };
  }

  private get selectionIndicesFromHost(): ISelectionIndices {
    return { start: this.selectionStartFromHost, end: this.selectionEndFromHost };
  }

  private get selectionStartFromHost(): number {
    return this._inputElement?.selectionStart || 0;
  }

  private get selectionEndFromHost(): number {
    return this._inputElement?.selectionEnd || 0;
  }

  private updateSelectionIndicesFromHost(): void {
    this._selectionIndices = this.selectionIndicesFromHost;
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
      && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition + 1] as TDigitGroupDelimiter) > -1);
  }

  private isDeleteKeyBeforeDigitGroupDelimiter(keyCode: string, indicatorPosition: number): boolean {
    const value = this._value;
    return !!value
      && (keyCode === 'Delete')
      && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition] as TDigitGroupDelimiter) > -1);
  }

  private getIndicatorPositionAfterSingleCharacterChange(keyCode: string): TIndicatorPosition {
    if (this._decimalParams.allowDecimal
      && (this._value?.pointIndex.prettyIndex ?? -1 < 0)
      && (keyCode === this._decimalParams.point))
      return 'afterFloatPoint';
    if (keyCode === 'Delete')
      return 'afterOldLeftSide';
    return 'beforeOldRightSide';
  }

  private updateDigitGroupConfig(config: IFloatPartDigitGroupConfig): IPrettyFloatDigitGroupParameter {
    return (this._value as PrettyFloat).updateDigitGroupParams(config).digitGroupParams;
  }

  private updateDecimalConfig(config: any): IPrettyFloatDecimalPartParameter {
    return (this._value as PrettyFloat).updateDecimalParams(config).decimalParams;
  }

  private saveState(): void {
    this._history.push({
      value: this._value,
      selectionIndices: this._selectionIndices
    });
  }

  private undo(): void {
    const lastState = this._history.pop();
    if (!lastState) {
      this.reset();
      return;
    }
    this.value = lastState.value;
    this.selectionIndices = lastState.selectionIndices;
  }

  private clearHistory(): void {
    this._history = [];
  }

  private reset(): void {
    this.clearHistory();
    this.value = null;
    this.indicatorPosition = 0;
  }

  private init(): void {
    this._inputElement = this._el.nativeElement as HTMLInputElement;
    this.reset();
    this.initValues();
    this.bindInputEvent();
  }

  private initValues(): void {
    this._decimalParams = this._decimalParams || PRETTY_FLOAT_PARAMETER_UTIL.decimal(this._decimalParams);
    this._digitGroupParams = this._digitGroupParams || PRETTY_FLOAT_PARAMETER_UTIL.digitGroup({
      part: 'integer',
      params: undefined
    }, {
      part: 'decimal',
      params: undefined
    });
    this.value = new PrettyFloat(this._inputElement?.value || '', this._decimalParams, this._digitGroupParams);
  }

  private bindInputEvent(): void {
    if (!this._inputElement)
      throw new Error('No host element found!');
    fromEvent<InputEvent>(this._inputElement, 'input')
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => {
        this.saveState();
        this.onUserInput((this._inputElement || event.target as HTMLInputElement).value);
      });
  }

  private onUserInput(input: string): void {
    const newValue = input ? new PrettyFloat(input, this._decimalParams, this._digitGroupParams) : null;
    const history = this._history;
    const lastState = history[history.length - 1]?.value;
    const oldValue = lastState ? lastState.clone() : null;
    if (!oldValue || !newValue)
      this._nextIndicatorPosition = 'endOfLine';
    const oldForcedDecimals = oldValue?.forcedDecimals;

    // strip appended 0 decimals of old value in case float point is removed
    if (oldForcedDecimals && newValue && (newValue.pointIndex.prettyIndex < 0)) {
      newValue.updateValue(String(newValue.value.number).slice(0, -oldForcedDecimals));
      oldValue?.updateValue(String(oldValue?.value.number).slice(0, -oldForcedDecimals));
    }

    this.value = newValue;
    this.indicatorPosition = this.getIndicatorPositionAfterUserInput(newValue, oldValue);
  }

  private getIndicatorPositionAfterUserInput(newValue: PrettyFloat | null, oldValue: PrettyFloat | null): number {
    if (!newValue)
      return 0;
    const newValueEndIndex = newValue.value.pretty.length;
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
    const selectionIndex = Math.max(selectionIndices.start, selectionIndices.end);
    const oldPretty = oldValue.prettyValue;
    const newValueLength = newValue.prettyValue.length;
    if (selectionIndex >= oldPretty.length)
      return newValueLength;
    return this._digitGroupParams.hasDigitGroups
      ? (PRETTY_FLOAT_UTIL.findFirstChangedIndexFromEnd(newValue, oldValue) + 1)
      : (newValueLength - oldPretty.substring(selectionIndex).length);
  }

}
