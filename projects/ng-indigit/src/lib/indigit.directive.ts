import { AfterViewInit, Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { INDIGIT_UTILS, isDigitGroupingParameter } from './__utils';
import { TDecimalPartConfig, TDecimalSeparator, TDigitGroupConfig, TDigitGroupDelimiter, TFloatPart, TIndicatorPosition } from './types';
import { IIndicatorPositionParameter } from './interfaces';
import { DEFAULT_CONFIG } from './default-config';

@Directive({
  selector: 'input[type="text"][ng-indigit]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    // eslint-disable-next-line no-use-before-define
    useExisting: forwardRef(() => IndigitDirective),
    multi: true
  }]
})
export class IndigitDirective implements ControlValueAccessor, AfterViewInit, OnDestroy {

  @Input()
  set decimalDigitGrouping(value: any) {
    if (isDigitGroupingParameter(value))
      this._decimalIsGrouped = (typeof value === 'boolean') ? value : !!(value.groupSize);
    else
      this._decimalIsGrouped = coerceBooleanProperty(value);
    this.setDigitGroupingParams(value, 'decimal');
  }

  @Input()
  set integerDigitGrouping(value: any) {
    if (isDigitGroupingParameter(value))
      this._integerIsGrouped = (typeof value === 'boolean') ? value : !!(value.groupSize);
    else
      this._integerIsGrouped = coerceBooleanProperty(value);
    this.setDigitGroupingParams(value, 'integer');
  }

  @Input()
  set decimal(value: any) {
    this._allowDecimal = coerceBooleanProperty(value);
    this.setDecimalParams(value);
  }

  @Input()
  set allowNegative(value: any) {this._allowNegative = coerceBooleanProperty(value);}

  /*
      Functional members
   */
  private _lastViewValue!: string;
  private _lastSelectionEnd!: number;
  private _selectionEndBeforeAddingDummyDecimals!: number;
  private _lastSelectionStart!: number;
  private _isSingleDigitDelete!: boolean;
  private _lastModelValue!: number | null;
  private _modelValue!: number | null;
  private _inputElement!: HTMLInputElement;
  private _destroy$ = new Subject<void>();
  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  /*
      Decimal parameters
   */
  private _allowDecimal!: boolean;
  private _decimalSeparator!: TDecimalSeparator;
  private _maxDecimalDigits!: number;
  private _minDecimalDigits!: number;

  /*
      Digit grouping parameters
   */
  private _noDigitGroups!: boolean;
  private _integerIsGrouped!: boolean;
  private _integerDelimiter!: TDigitGroupDelimiter;
  private _integerGroupSize!: number;
  private _decimalIsGrouped!: boolean;
  private _decimalDelimiter!: TDigitGroupDelimiter;
  private _decimalGroupSize!: number;
  private _allDelimiters: TDigitGroupDelimiter[] = [];

  /*
      Other parameters
   */
  private _allowNegative: boolean = true;
  private _isNegative!: boolean;

  constructor(@Self() private _el: ElementRef, private _render: Renderer2) {
    this.init();
  }

  get viewValue(): string {
    return String(this._inputElement?.value || '');
  }

  writeValue(obj: null | number): void {
    this.setViewValue((obj == null) ? obj : INDIGIT_UTILS.customizeDecimalSeparator(String(obj), this._decimalSeparator)
      , true);
  }

  registerOnChange(fn: any): void {this._onChange = fn;}

  registerOnTouched(fn: any): void {this._onTouched = fn;}

  setDisabledState(isDisabled: boolean): void {
    if (this._inputElement)
      this._render.setProperty(this._inputElement, 'disabled', isDisabled);
  }

  ngAfterViewInit() {
    this.init();
    this.bindInputEvent();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const [currentSelectionStart, currentSelectionEnd] = this.resetKeydownParams(event);
    if (this.isAllowedDecimalSeparatorKey(event.key, currentSelectionStart, currentSelectionEnd)
      || this.isAllowedMinusKey(event.key, currentSelectionStart, currentSelectionEnd))
      return;
    if (currentSelectionStart === currentSelectionEnd) {
      if (this._minDecimalDigits) {
        if (this.isSkipBackPastDecimalSeparator(event.key, currentSelectionEnd)) {
          this.moveIndicator(currentSelectionEnd - 1);
          this.updateSelectionIndices();
          return;
        }
        if (this.isSkipForwardPastDecimalSeparator(event.key, currentSelectionEnd)) {
          this.moveIndicator(currentSelectionEnd + 1);
          this.updateSelectionIndices();
          return;
        }
      }
      if (!this._noDigitGroups) {
        if (this.isSkipBackPastGroupDelimiter(event.key, currentSelectionEnd)) {
          this.moveIndicator(currentSelectionEnd - 1);
          this.updateSelectionIndices();
          return;
        }
        if (this.isSkipForwardPastGroupDelimiter(event.key, currentSelectionEnd)) {
          this.moveIndicator(currentSelectionEnd + 1);
          this.updateSelectionIndices();
          return;
        }
      }
      if (this.isAllowedDuplicateDecimalSeparatorKey(event.key, currentSelectionEnd)) {
        event.preventDefault();
        this.moveIndicator(currentSelectionEnd + 1);
        this.updateSelectionIndices();
        return;
      }
    }
    if ((event.key === 'Backspace') || (event.key === 'Delete')
      || INDIGIT_UTILS.isAllowedKey(event) || INDIGIT_UTILS.isLegalNumKey(event.key))
      return;
    event.preventDefault();
  }

  @HostListener('blur')
  onBlur(): void {
    this._onTouched();
  }

  private init(): void {
    this._inputElement = this._inputElement || this._el.nativeElement as HTMLInputElement;
    this._lastViewValue = this._inputElement?.value || '';
  }

  private setDigitGroupingParams(value: TDigitGroupConfig, part: TFloatPart): void {
    const keyPrefix = `_${part}`;
    const delimiterKey = `${keyPrefix}Delimiter` as keyof Omit<IndigitDirective, 'viewValue'>;
    if (this[`${keyPrefix}IsGrouped` as keyof IndigitDirective]) {
      this[delimiterKey] =
        (value.delimiter) || DEFAULT_CONFIG.integerDigitGroups.delimiter;
      this._integerGroupSize = Math.floor(value.groupSize || DEFAULT_CONFIG.decimalDigitGroups.groupSize as number);
    }
    if (this._allDelimiters.indexOf(this[delimiterKey]) < 0)
      this._allDelimiters.push(this[delimiterKey]);
    this._noDigitGroups = !this._integerIsGrouped && !this._decimalIsGrouped;
  }

  private setDecimalParams(value: TDecimalPartConfig): void {
    if (!this._allowDecimal)
      return;
    this._decimalSeparator = value?.separator || DEFAULT_CONFIG.decimal.separator as TDecimalSeparator;
    this._maxDecimalDigits = Math.floor(value.maxDigitCount || DEFAULT_CONFIG.decimal.maxDigitCount as number);
    this._minDecimalDigits = Math.floor(value.minDigitCount || DEFAULT_CONFIG.decimal.minDigitCount as number);
    if (this._minDecimalDigits > this._maxDecimalDigits)
      this._minDecimalDigits = this._maxDecimalDigits;
  }

  private bindInputEvent(): void {
    if (this._inputElement)
      fromEvent<InputEvent>(this._inputElement, 'input')
        .pipe(takeUntil(this._destroy$))
        .subscribe((event: InputEvent) => this.handleUserInput((event.target as HTMLInputElement).value));
  }

  private isAllowedDecimalSeparatorKey(key: string, selectionStart: number, selectionEnd: number): boolean {
    const viewValue = this.viewValue;
    return this._allowDecimal && (key === this._decimalSeparator)
      && (
        (viewValue.indexOf(this._decimalSeparator) < 0)
        || (viewValue.slice(selectionStart, selectionEnd).indexOf(this._decimalSeparator) > -1)
      );
  }

  private isAllowedDuplicateDecimalSeparatorKey(key: string, selectionEnd: number): boolean {
    return (key === this._decimalSeparator) && (this.viewValue[selectionEnd] === this._decimalSeparator);
  }

  private isAllowedMinusKey(key: string, selectionStart: number, selectionEnd: number): boolean {
    return this._allowNegative && (key === '-') && ((selectionEnd === 0) || (selectionStart === 0));
  }

  private isSkipBackPastGroupDelimiter(key: string, selectionEnd: number): boolean {
    return (key === 'Backspace') && (this._allDelimiters.indexOf(this.viewValue[selectionEnd - 1] as TDigitGroupDelimiter) > -1);
  }

  private isSkipForwardPastGroupDelimiter(key: string, selectionEnd: number): boolean {
    return ((key === 'Delete') && (this._allDelimiters.indexOf(this.viewValue[selectionEnd] as TDigitGroupDelimiter)) > -1);
  }

  private isSkipBackPastDecimalSeparator(key: string, selectionEnd: number): boolean {
    return (key === 'Backspace') && (this._decimalSeparator === this.viewValue[selectionEnd - 1]);
  }

  private isSkipForwardPastDecimalSeparator(key: string, selectionEnd: number): boolean {
    return (key === 'Delete') && (this._decimalSeparator === this.viewValue[selectionEnd]);
  }

  private handleUserInput(value: string): void {
    const val = this.renderViewValue(value);
    this.setViewValue(val);
    this.setModelValue(val);
    let preChangeReverseIndex: TIndicatorPosition | number = 0;
    if (val && this._lastViewValue && this.viewValue)
      preChangeReverseIndex = this.getIndicatorReverseIndex(value);
    if (this._selectionEndBeforeAddingDummyDecimals)
      preChangeReverseIndex = 'afterLastModification';
    this.restoreIndicator(preChangeReverseIndex);
  }

  private getIndicatorReverseIndex(value: string): TIndicatorPosition | number {
    const reverseIndex =
      this._lastViewValue.substring(Math.max(this._lastSelectionEnd, this._lastSelectionStart)).length;
    if (this._allowDecimal) {
      const prevSeparatorIndex = this._lastViewValue.indexOf(this._decimalSeparator);
      if ((prevSeparatorIndex * this.viewValue.indexOf(this._decimalSeparator) < 0))
        return (prevSeparatorIndex < 0) ? 'afterDecimalSeparator' : 'beforePreviousDecimalPart';
      if ((value.length > this._lastViewValue.length)
        && (INDIGIT_UTILS.getDecimalPart(value, this._decimalSeparator).length > this._maxDecimalDigits))
        return reverseIndex - 1;
    }
    return reverseIndex;
  }

  private setViewValue(value: string | null, parseBeforeDisplay?: true): void {
    if (this._inputElement)
      this._render.setProperty(this._inputElement, 'value', parseBeforeDisplay
        ? this.renderViewValue(value)
        : value);
  }

  private renderViewValue(value: string | null): string {
    if (value == null)
      return '';
    let val = INDIGIT_UTILS.numFaToEn(value.trim());
    if (!this._allowDecimal && !this._allowNegative && this._noDigitGroups)
      return INDIGIT_UTILS.allowDigitsOnly(val);
    if (this._allowNegative)
      val = this.prepareNegativeNumber(val);
    if (this._allowDecimal)
      val = this.renderDecimalNumber(val);
    return `${this._isNegative ? '-' : ''}${this._noDigitGroups ? val : this.addDigitGrouping(val)}`;
  }

  private prepareNegativeNumber(value: string): string {
    this._isNegative = (value[0] === '-');
    return value.substring(Number(this._isNegative));
  }

  private renderDecimalNumber(value: string): string {
    let decimalPart: string;
    if (value[0] === this._decimalSeparator) {
      decimalPart = this.renderDecimalPart(INDIGIT_UTILS.allowDigitsOnly(value.substring(1)));
      return `0${this._decimalSeparator}${decimalPart}`;
    }
    const safeNum = INDIGIT_UTILS.sanitizeDecimalNumber(value, this._decimalSeparator);
    const intPart = INDIGIT_UTILS.getIntegerPart(safeNum, this._decimalSeparator);
    const separator = (-1 < safeNum.indexOf(this._decimalSeparator)) ? this._decimalSeparator : '';
    decimalPart = this.renderDecimalPart(INDIGIT_UTILS.getDecimalPart(safeNum, this._decimalSeparator));
    return (Number(intPart) || Number(decimalPart)) ? `${intPart}${separator}${decimalPart}` : '';
  }

  private renderDecimalPart(value: string): string {
    let part = value;
    const selectionEnd = this.currentSelectionEnd;
    this._selectionEndBeforeAddingDummyDecimals = 0;
    if (this._minDecimalDigits && (part.length < this._minDecimalDigits)) {
      this._selectionEndBeforeAddingDummyDecimals = selectionEnd;
      while (part.length < this._minDecimalDigits)
        part = `${part}0`;
    }
    if (this._maxDecimalDigits && (part.length > this._maxDecimalDigits))
      while (part.length > this._maxDecimalDigits)
        part = part.slice(0, -1);
    if ((part.length > this._minDecimalDigits) && (part[part.length - 1] === '0'))
      this._selectionEndBeforeAddingDummyDecimals = selectionEnd;
    while ((part.length > this._minDecimalDigits) && (part[part.length - 1] === '0'))
      part = part.slice(0, -1);
    return part;
  }

  private addDigitGrouping(value: string): string {
    const intPart = this._integerIsGrouped
      ? this.getGroupedIntegerPart(value)
      : INDIGIT_UTILS.getIntegerPart(value, this._decimalSeparator);
    if (!this._allowDecimal)
      return intPart;
    const separator = (-1 < value.indexOf(this._decimalSeparator)) ? this._decimalSeparator : '';
    const decimal = this._decimalIsGrouped
      ? this.getGroupedDecimalPart(value)
      : INDIGIT_UTILS.getDecimalPart(value, this._decimalSeparator);
    return `${intPart}${separator}${decimal}`;
  }

  private getGroupedIntegerPart(value: string): string {
    let intPart = INDIGIT_UTILS.getIntegerPart(value, this._decimalSeparator);
    if (intPart.length > this._integerGroupSize)
      intPart = INDIGIT_UTILS.digitGroups(intPart, {
        separator: this._integerDelimiter,
        groupLength: this._integerGroupSize
      });
    return intPart;
  }

  private getGroupedDecimalPart(value: string): string {
    let decimalPart = INDIGIT_UTILS.getDecimalPart(value, this._decimalSeparator);
    if (this._decimalIsGrouped && (decimalPart.length > this._decimalGroupSize))
      decimalPart = INDIGIT_UTILS.digitGroups(decimalPart, {
        separator: this._decimalDelimiter,
        groupLength: this._decimalGroupSize,
      });
    return decimalPart;
  }

  private restoreIndicator(prevReverseIndex: TIndicatorPosition | number): void {
    let position: number;
    const viewVal = this.viewValue;
    const viewValLen = viewVal.length;
    switch (prevReverseIndex) {
      case 'afterDecimalSeparator':
        position = viewVal.indexOf(this._decimalSeparator) + 1;
        break;
      case 'beforePreviousDecimalPart':
        position = this.restoreIndicatorAfterDecimalSeparatorRemoval();
        break;
      case 'afterLastModification':
        position = this._selectionEndBeforeAddingDummyDecimals;
        break;
      default:
        position = this.restoreIndicatorAfterRegularOperations(prevReverseIndex as number);
    }
    if (position < 0)
      position = 0;
    else if (Number.isNaN(position) || (position > viewValLen))
      position = viewValLen;
    this.moveIndicator(position);
  }

  private restoreIndicatorAfterDecimalSeparatorRemoval(): number {
    const selectionLastIndex = Math.max(this._lastSelectionStart, this._lastSelectionEnd);
    if (selectionLastIndex >= this._lastViewValue.length)
      return this.viewValue.length;
    const prevSeparatorIndex = this._lastViewValue.indexOf(this._decimalSeparator);
    const prevIntPart = INDIGIT_UTILS.getIntegerPart(this._lastViewValue, this._decimalSeparator);
    if ((prevIntPart === '0') && ((prevSeparatorIndex + 1) >= selectionLastIndex))
      return 0;
    if (this._noDigitGroups || !this._integerIsGrouped)
      return prevSeparatorIndex;
    const prevIntPartSize = prevIntPart.length;
    const prevIntPartLeftover = prevIntPartSize % this._integerGroupSize;
    const prevDecimalPartLeftover
      = INDIGIT_UTILS.getDecimalPart(this._lastViewValue, this._decimalSeparator).length % this._integerGroupSize;
    if (!prevIntPartLeftover && prevDecimalPartLeftover && (prevDecimalPartLeftover < prevIntPartSize))
      return prevSeparatorIndex + 1;
    const leftoverSize = (prevIntPartLeftover + prevDecimalPartLeftover) % this._integerGroupSize;
    return prevSeparatorIndex
      + Number((leftoverSize > this._integerGroupSize) && (leftoverSize < prevIntPartSize));
  }

  private restoreIndicatorAfterRegularOperations(prevReverseIndex: number): number {
    if (this._isSingleDigitDelete)
      return this.restoreIndicatorAfterSingleDigitRemovalByDeleteKey();
    const viewValueLen = this.viewValue.length;
    if (prevReverseIndex > viewValueLen)
      return 0;
    return viewValueLen - prevReverseIndex;
  }

  private restoreIndicatorAfterSingleDigitRemovalByDeleteKey(): number {
    if (this._noDigitGroups)
      return this._lastSelectionEnd;
    const prevSeparatorIndex = this._lastViewValue.indexOf(this._decimalSeparator);
    const param: IIndicatorPositionParameter = {
      preDeleteIndex: this._lastSelectionEnd,
      delimiter: this._integerDelimiter,
      postDeleteVal: this.viewValue,
      preDeleteVal: this._lastViewValue,
      decimalSeparator: this._decimalSeparator
    };
    if (!this._allowDecimal || (prevSeparatorIndex < 0) || (prevSeparatorIndex >= this._lastSelectionEnd))
      return INDIGIT_UTILS.restoreIndicatorAfterSingleIntegerDigitRemoval(param);
    return INDIGIT_UTILS.restoreIndicatorAfterSingleDecimalDigitRemoval(Object.assign({}, param, {
      delimiter: this._decimalDelimiter
    }));
  }

  private moveIndicator(position: number): void {
    if (!this._inputElement)
      return;
    this._render.setProperty(this._inputElement, 'selectionStart', position);
    this._render.setProperty(this._inputElement, 'selectionEnd', position);
  }

  private setModelValue(value: string): void {
    const val = this.renderModelValue(value);
    this._onChange(val);
    this._lastModelValue = this._modelValue;
    this._modelValue = val;
  }

  private renderModelValue(value: string): number | null {
    if (!value)
      return null;
    if (!this._allowDecimal && !this._allowNegative && this._noDigitGroups)
      return Number(INDIGIT_UTILS.allowDigitsOnly(value));
    let val = value;
    if (!this._noDigitGroups)
      val = INDIGIT_UTILS.stripNonDecimals(val, this._decimalSeparator);
    if (this._allowDecimal && (this._decimalSeparator !== '.'))
      val = INDIGIT_UTILS.standardizeDecimalSeparator(val, this._decimalSeparator);
    if (this._allowNegative && this._isNegative)
      val = `-${val}`;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }

  private resetKeydownParams(event: KeyboardEvent): [number, number] {
    this._lastViewValue = this.viewValue;
    const [currentSelectionStart, currentSelectionEnd] = this.updateSelectionIndices();
    this._isSingleDigitDelete = (currentSelectionStart === currentSelectionEnd) && (event.key === 'Delete');
    return [currentSelectionStart, currentSelectionEnd];
  }

  private updateSelectionIndices(): [number, number] {
    this._lastSelectionEnd = this.currentSelectionEnd || 0;
    this._lastSelectionStart = this.currentSelectionStart || 0;
    return [this._lastSelectionStart, this._lastSelectionEnd];
  }

  private get currentSelectionEnd(): number {
    return this._inputElement?.selectionEnd || 0;
  }

  private get currentSelectionStart(): number {
    return this._inputElement?.selectionStart || 0;
  }

}
