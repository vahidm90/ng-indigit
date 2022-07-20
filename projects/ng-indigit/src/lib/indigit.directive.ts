import { Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { fromEvent, Subject, Subscription, takeUntil } from 'rxjs';
import { TIndicatorPosition } from './types';
import { IFloatPartDigitGroupConfig, IPrettyFloatDecimalPartParameter, IPrettyFloatDigitGroupParameter } from './interfaces';
import { PrettyFloat } from './classes';
import { IIndigitState } from './interfaces/indigit-state.interface';
import { ISelectionIndices } from './interfaces/selection-indices.interface';
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
    this._value ? this.updateDigitGroupConfig(config) : this.initiateDigitGroupConfig(config);
  }

  @Input()
  set integerDigitGroups(params: any) {
    this.clearHistory();
    const config: IFloatPartDigitGroupConfig = { part: 'integer', params };
    this._value ? this.updateDigitGroupConfig(config) : this.initiateDigitGroupConfig(config);
  }

  @Input()
  set decimal(params: any) {
    this.clearHistory();
    this._value ? this.updateDecimalConfig(params) : this.initiateDecimalConfig(params);
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
  private _selectionChangeListener!: Subscription;
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

  set selectionIndices(indices: ISelectionIndices) {
    this._selectionIndices = indices;
    this.hostSelectionStart = indices.start;
    this.hostSelectionEnd = indices.end;
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
    if (event.ctrlKey && (event.code === 'keyZ')) {
      this.undo();
      return;
    }
    const indices = this._selectionIndices;
    this._nextIndicatorPosition = (indices.start === indices.end)
      ? this.getIndicatorPositionAfterSingleCharacterChange(event.code) : 'beforeOldRightSide';
  }

  @HostListener('blur')
  onBlur(): void {
    this._onTouched();
  }

  private set hostValue(value: string) {
    if (!this._inputElement)
      return;
    this._render.setProperty(this._inputElement, 'value', value);
  }

  private set modelValue(value: number | null) {
    this._onChange(value);
  }

  private set hostSelectionStart(index: number) {
    if (!this._inputElement)
      return;
    this._render.setProperty(this._inputElement, 'selectionStart', index);
  }

  private set hostSelectionEnd(index: number) {
    if (!this._inputElement)
      return;
    this._render.setProperty(this._inputElement, 'selectionEnd', index);
  }

  private getIndicatorPositionAfterSingleCharacterChange(keyCode: string): TIndicatorPosition {
    if (this._decimalParams.allowDecimal
      && (this._value?.pointIndex.prettyIndex ?? -1 < 0)
      && (keyCode === this._decimalParams.separator))
      return 'afterFloatPoint';
    if (keyCode === 'Delete')
      return 'afterOldLeftSide';
    return 'beforeOldRightSide';
  }

  private updateDigitGroupConfig(config: IFloatPartDigitGroupConfig): void {
    this._digitGroupParams = (this._value as PrettyFloat).updateDigitGroupParams(config).digitGroupParams;
  }

  private initiateDigitGroupConfig(config: IFloatPartDigitGroupConfig): void {
    this._digitGroupParams = PRETTY_FLOAT_PARAMETER_UTIL.digitGroup(config);
  }

  private updateDecimalConfig(config: any): void {
    this._decimalParams = (this._value as PrettyFloat).updateDecimalParams(config).decimalParams;
  }

  private initiateDecimalConfig(config: any): void {
    this._decimalParams = PRETTY_FLOAT_PARAMETER_UTIL.decimal(config);
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
    this.selectionIndices = { start: 0, end: 0 };
  }

  private init(): void {
    this.reset();
    this._inputElement = this._el.nativeElement as HTMLInputElement;
    this.value = new PrettyFloat(this._inputElement?.value || '');
    this.bindEvents();
  }

  private bindEvents(): void {
    if (!this._inputElement)
      return;
    this._selectionChangeListener = this.selectionChangeSubscription;
    fromEvent<InputEvent>(this._inputElement, 'input')
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => {
        this._selectionChangeListener.unsubscribe();
        this.saveState();
        this.onUserInput((this._inputElement || event.target as HTMLInputElement).value);
      });
  }

  private get selectionChangeSubscription(): Subscription {
    return fromEvent<Event>(this._inputElement, 'selectionchange')
      .pipe(takeUntil(this._destroy$))
      .subscribe(event => {
        const elem = this._inputElement || event.target as HTMLInputElement;
        const [start, end] = [elem.selectionEnd || 0, elem.selectionStart || 0];
        this._selectionIndices = { start, end };
      });
  }

  private onUserInput(input: string): void {
    const newValue = input ? new PrettyFloat(input, this._decimalParams, this._digitGroupParams) : null;
    const history = this._history;
    const lastState = history[history.length - 1]?.value;
    const oldValue = lastState ? lastState.clone() : null;
    if (!oldValue || !newValue)
      this._nextIndicatorPosition = 'valueEnd';
    const oldForcedDecimals = oldValue?.forcedDecimals;

    // strip appended 0 decimals of old value in case float point is removed
    if (oldForcedDecimals && newValue && (newValue?.pointIndex.prettyIndex < 0)) {
      newValue.updateValue(String(newValue.value.number).slice(0, -oldForcedDecimals));
      oldValue?.updateValue(String(oldValue?.value.number).slice(0, -oldForcedDecimals));
    }

    this.value = newValue;
    this.indicatorPosition = this.getIndicatorPositionAfterUserInput(newValue, oldValue);
    this._selectionChangeListener = this.selectionChangeSubscription;
  }

  private getIndicatorPositionAfterUserInput(newValue: PrettyFloat | null, oldValue: PrettyFloat | null): number {
    if (!newValue)
      return 0;
    const newValueEndIndex = newValue.value.pretty.length;
    if (!oldValue)
      return newValueEndIndex;
    switch (this._nextIndicatorPosition) {
      case 'valueEnd':
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

  private set indicatorPosition(position: number) {
    this.selectionIndices = { end: position, start: position };
  }

}
