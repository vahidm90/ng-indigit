import { Directive, ElementRef, forwardRef, HostListener, Input, Inject, Renderer2, Self, Optional } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TDigitGroupOption, TIndicatorPosition, TPrettyFloatDecimalOption } from './types';
import { IIndigitState, IPrettyFloatOption, ITextInputSelection } from './interfaces';
import { PrettyFloat } from './classes';
import { BASIC_UTIL, INDIGIT_UTIL, PRETTY_FLOAT_PARAM_UTIL } from './utils';
import { NG_INDIGIT_PRETTY_FLOAT_CONFIG } from './providers';
import { DEFAULT_DECIMAL_CONFIG, DEFAULT_DIGIT_GROUP_CONFIG } from './helpers';

@Directive({
  selector: 'input[type="text"][ng-indigit]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // eslint-disable-next-line no-use-before-define
    useExisting: forwardRef(() => IndigitDirective),
    multi: true
  }]
})
export class IndigitDirective implements ControlValueAccessor {

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
  set digitGroups(params: any) {
    this.clearHistory();
    this.value = this._value.updateDigitGroupParams(params);
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
  private _isContinuousKeydown!: boolean;
  private _inputElement!: HTMLInputElement;
  private _nextIndicatorPosition!: TIndicatorPosition;
  private _history: IIndigitState[] = [];
  private _allowNegative: boolean = true;
  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  constructor(
    @Self() private _el: ElementRef,
    @Optional() @Inject(NG_INDIGIT_PRETTY_FLOAT_CONFIG) prettyFloatConfig: IPrettyFloatOption,
    private _render: Renderer2
  ) {
    const digitGroupConfig
      = PRETTY_FLOAT_PARAM_UTIL.digitGroup(DEFAULT_DIGIT_GROUP_CONFIG, prettyFloatConfig?.digitGroups);
    this.init(PRETTY_FLOAT_PARAM_UTIL.decimal(DEFAULT_DECIMAL_CONFIG, prettyFloatConfig?.decimal)
      , digitGroupConfig.integerPart
      , digitGroupConfig.decimalPart);
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

  @HostListener('keyup')
  onKeyup(): void {
    this._isContinuousKeydown = false;
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (this._isContinuousKeydown || (['Control', 'Alt', 'Shift'].indexOf(key) > -1))
      return;
    if (event.repeat) {
      this._isContinuousKeydown = true;
      return;
    }
    if (event.ctrlKey && (event.code === 'KeyZ')) {
      event.preventDefault();
      this.undo();
      return;
    }
    const selection = this.selection;
    const selectionEnd = selection.endIndex;
    if (selectionEnd === selection.startIndex)
      this.onZeroSelectionKeydown(event.key, selectionEnd);
    else
      this._nextIndicatorPosition = 'beforeOldRightSide';
    this.saveState();
  }

  @HostListener('mousedown')
  onMousedown(): void {
    this.saveState();
  }

  @HostListener('input')
  onInput(): void {
    const history = this._history;
    this.updateAfterUserInput(this._value.updateValue(this._inputElement.value), history[history.length - 1] || null);
  }

  @HostListener('blur')
  onBlur(): void {
    this.clearHistory();
    this._onTouched();
  }

  private set hostValue(value: string) {
    this._render.setProperty(this._inputElement, 'value', value);
  }

  private set modelValue(value: number | null) {
    this._onChange(value);
  }

  private set selectionStart(index: number) {
    this._render.setProperty(this._inputElement, 'selectionStart', index);
  }

  private get selectionStart(): number {
    return this._inputElement.selectionStart || 0;
  }

  private set selectionEnd(index: number) {
    this._render.setProperty(this._inputElement, 'selectionEnd', index);
  }

  private get selectionEnd(): number {
    return this._inputElement.selectionEnd || 0;
  }

  private set selection(indices: ITextInputSelection) {
    this.selectionStart = indices.startIndex;
    this.selectionEnd = indices.endIndex;
  }

  private get selection(): ITextInputSelection {
    return { startIndex: this.selectionStart, endIndex: this.selectionEnd };
  }

  private set indicatorPosition(position: number) {
    this.selection = { endIndex: position, startIndex: position };
  }

  private onZeroSelectionKeydown(key: string, indicatorPosition: number): void {
    this._nextIndicatorPosition = this.getIndicatorPositionAfterSingleCharacterChange(key);
    if (this.isBackspaceKeyAfterDigitGroupDelimiter(key, indicatorPosition))
      this.indicatorPosition = indicatorPosition - 1;
    else if (this.isDeleteKeyBeforeDigitGroupDelimiter(key, indicatorPosition))
      this.indicatorPosition = indicatorPosition + 1;
  }

  private isBackspaceKeyAfterDigitGroupDelimiter(key: string, indicatorPosition: number): boolean {
    const value = this._value;
    return !!value
      && (key === 'Backspace')
      && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition - 1]) > -1);
  }

  private isDeleteKeyBeforeDigitGroupDelimiter(keyCode: string, indicatorPosition: number): boolean {
    const value = this._value;
    return !!value
      && (keyCode === 'Delete')
      && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition]) > -1);
  }

  private getIndicatorPositionAfterSingleCharacterChange(key: string): TIndicatorPosition {
    const decimalParams = this._value.decimalParams;
    if (decimalParams.isDecimalAllowed && (this._value.pointIndex.prettyIndex < 0) && (key === decimalParams.floatPoint))
      return 'afterFloatPoint';
    if (key === 'Delete')
      return 'afterOldLeftSide';
    return 'beforeOldRightSide';
  }

  private saveState(): void {
    this._history.push({
      value: this._value.clone(),
      selection: this.selection
    });
  }

  private undo(): void {
    const lastState = this._history.pop();
    if (!lastState) {
      this.reset();
      return;
    }
    this.value = lastState.value;
    this.selection = lastState.selection;
  }

  private clearHistory(): void {
    this._history = [];
  }

  private reset(): void {
    this.clearHistory();
    this.value = this._value.updateValue(null);
    this.indicatorPosition = 0;
  }

  private init(decimalPartConfig?: TPrettyFloatDecimalOption, integerDigitGroupsConfig?: TDigitGroupOption, decimalDigitGroupsConfig?: TDigitGroupOption): void {
    this._inputElement = this._el.nativeElement as HTMLInputElement;
    if (!this._inputElement)
      throw new Error('No host element found!');
    this.value = new PrettyFloat(this._inputElement.value, decimalPartConfig, {
      integerPart: integerDigitGroupsConfig,
      decimalPart: decimalDigitGroupsConfig
    });
  }

  private updateAfterUserInput(newValue: PrettyFloat, lastState: IIndigitState | null): void {
    const oldValue = lastState?.value;
    if (!oldValue?.prettyValue || !newValue.prettyValue)
      this._nextIndicatorPosition = 'endOfLine';

    const oldForcedDecimals = oldValue?.forcedDecimals || 0;
    const newForcedDecimals = newValue.forcedDecimals;
    if (oldForcedDecimals > newForcedDecimals)
      newValue.updateValue(newValue.prettyValue.slice(0, -(oldForcedDecimals - newForcedDecimals)));
    this.value = newValue;
    this.indicatorPosition = this.getIndicatorPositionAfterUserInput(newValue, lastState);
  }

  private getIndicatorPositionAfterUserInput(newValue: PrettyFloat, lastState: IIndigitState | null): number {
    const newValueEndIndex = newValue.prettyValue.length;
    if (!lastState)
      return newValueEndIndex;
    switch (this._nextIndicatorPosition) {
      case 'endOfLine':
        return newValueEndIndex;
      case 'afterFloatPoint':
        return newValue.pointIndex.prettyIndex + 1;
      case 'afterOldLeftSide':
        return INDIGIT_UTIL.getIndicatorPositionByOldIndex(newValue, lastState);
      default:
        return INDIGIT_UTIL.getIndicatorPositionByReverseOldIndex(newValue, lastState);
    }
  }

}
