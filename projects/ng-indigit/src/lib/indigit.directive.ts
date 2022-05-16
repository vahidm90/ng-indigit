import { AfterViewInit, Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DecimalDigitGroupingParameters, DecimalParameters, DecimalSeparator, DigitGroupDelimiter, DigitGroupingParameters, IndexPositioningParam, IndicatorPosition } from './interfaces';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { INDIGIT_UTILS } from './utils';

// todo: fix zero start (e.g. type 0.25)
// todo: fix initial zero value select & overwrite (i.e. if initial value is "0" it gets overwritten by first user input)
// todo: enable ctrl-z functionality

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
  set digitGrouping(value: any) {
    this._noDigitGroups = (value == null) ? this._noDigitGroups : !coerceBooleanProperty(value);
    if (!this._noDigitGroups)
      return;
    this.setDigitGroupingParams(value);
  }

  @Input()
  set decimal(value: any) {
    this._allowDecimal = (value == null) ? this._allowDecimal : coerceBooleanProperty(value);
    if (!this._allowDecimal)
      return;
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
  private _destroy$: Subject<void> = new Subject<void>();
  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  /*
      Decimal parameters
   */
  private _allowDecimal: boolean = false;
  private _decimalSeparator: DecimalSeparator = '.';
  private _maxDecimalDigits: number = 10;
  private _minDecimalDigits: number = 2;

  /*
      Digit grouping parameters
   */
  private _noDigitGroups: boolean = false;
  private _groupedInteger: boolean = true;
  private _integerDelimiter: DigitGroupDelimiter = ',';
  private _integerGroupSize: number = 3;
  private _groupedDecimals: boolean = true;
  private _decimalDelimiter: DigitGroupDelimiter = ' ';
  private _decimalGroupSize: number = 2;
  private _allDelimiters: DigitGroupDelimiter[] = [this._decimalDelimiter, this._integerDelimiter];

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
    this.setViewValue((obj == null) ? obj : String(obj), true);
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

  private init(): void {
    this._inputElement = this._inputElement || this._el.nativeElement as HTMLInputElement;
    this._lastViewValue = this._inputElement?.value || '';
  }

  private setDigitGroupingParams(value: DigitGroupingParameters): void {
    this._groupedInteger = !!value.integerDigitGroups ?? this._groupedInteger;
    const intSetting = value.integerDigitGroups as DecimalDigitGroupingParameters;
    this._integerDelimiter = intSetting?.delimiter ?? value?.delimiter ?? this._integerDelimiter;
    this._integerGroupSize = Math.floor(intSetting?.groupSize ?? value?.groupSize ?? this._integerGroupSize);
    this._groupedDecimals = !!value.decimalDigitGroups ?? this._groupedDecimals;
    const decimalSetting = value.decimalDigitGroups as DecimalDigitGroupingParameters;
    this._decimalDelimiter = decimalSetting?.delimiter ?? value.delimiter ?? this._decimalDelimiter ?? this._integerDelimiter;
    this._decimalGroupSize = Math.floor(decimalSetting?.groupSize ?? value.groupSize ?? this._decimalGroupSize ?? this._integerGroupSize);
    this._allDelimiters = [];
    if (this._decimalDelimiter)
      this._allDelimiters.push(this._decimalDelimiter);
    if (this._integerDelimiter && (this._integerDelimiter !== this._decimalDelimiter))
      this._allDelimiters.push(this._integerDelimiter);
  }

  private setDecimalParams(value: DecimalParameters): void {
    this._decimalSeparator = value.decimalSeparator ?? this._decimalSeparator;
    this._maxDecimalDigits = Math.floor(value.maxDecimalDigits ?? this._maxDecimalDigits);
    this._minDecimalDigits = Math.floor(value.minDecimalDigits ?? this._minDecimalDigits);
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
    return (key === 'Backspace') && (this._allDelimiters.indexOf(this.viewValue[selectionEnd - 1] as DigitGroupDelimiter) > -1);
  }

  private isSkipForwardPastGroupDelimiter(key: string, selectionEnd: number): boolean {
    return ((key === 'Delete') && (this._allDelimiters.indexOf(this.viewValue[selectionEnd] as DigitGroupDelimiter)) > -1);
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
    let preChangeReverseIndex: IndicatorPosition = 0;
    if (val && this._lastViewValue && this.viewValue)
      preChangeReverseIndex = this.getIndicatorReverseIndex(value);
    if (this._selectionEndBeforeAddingDummyDecimals)
      preChangeReverseIndex = 'afterLastUserModification';
    this.restoreIndicator(preChangeReverseIndex);
  }

  private getIndicatorReverseIndex(value: string): IndicatorPosition {
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
    let val = value.trim();
    if (!this._allowDecimal && !this._allowNegative)
      return INDIGIT_UTILS.allowDigitsOnly(val);
    if (this._allowNegative)
      val = this.prepareNegativeNumber(val);
    if (this._allowDecimal)
      val = this.renderDecimalNumber(val);
    while ((val.length > 1) && (val[0] === '0') && (this._allowDecimal ? (val[1] !== this._decimalSeparator) : true))
      val = val.substring(1);
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
      if (!Number(decimalPart))
        return '';
      return `0${this._decimalSeparator}${decimalPart}`;
    }
    const safeNum = INDIGIT_UTILS.sanitizeDecimalNumber(value, this._decimalSeparator);
    const intPart = INDIGIT_UTILS.getIntegerPart(safeNum, this._decimalSeparator);
    decimalPart = this.renderDecimalPart(INDIGIT_UTILS.getDecimalPart(safeNum, this._decimalSeparator));
    return (Number(intPart) || Number(decimalPart)) ? `${intPart}${this._decimalSeparator}${decimalPart}` : '';
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
    const intPart = this._groupedInteger
      ? this.getGroupedIntegerPart(value)
      : INDIGIT_UTILS.getIntegerPart(value, this._decimalSeparator);
    if (!this._allowDecimal)
      return intPart;
    const separator = (-1 < value.indexOf(this._decimalSeparator)) ? this._decimalSeparator : '';
    const decimal = this._groupedDecimals
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
    if (this._groupedDecimals && (decimalPart.length > this._decimalGroupSize))
      decimalPart = INDIGIT_UTILS.digitGroups(decimalPart, {
        separator: this._decimalDelimiter,
        groupLength: this._decimalGroupSize,
      });
    return decimalPart;
  }

  private restoreIndicator(prevReverseIndex: IndicatorPosition): void {
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
      case 'afterLastUserModification':
        position = this._selectionEndBeforeAddingDummyDecimals;
        break;
      default:
        position = this.restoreIndicatorAfterRegularOperations(prevReverseIndex);
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
    if (this._noDigitGroups || !this._groupedInteger)
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
    const param: IndexPositioningParam = {
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
    this.emitChange(val);
    this._onChange(val);
    this._lastModelValue = this._modelValue;
    this._modelValue = val;
  }

  private renderModelValue(value: string): number | null {
    if (!value)
      return null;
    if (!this._allowDecimal && this._noDigitGroups)
      return Number(value);
    if (!this._allowDecimal)
      return Number(INDIGIT_UTILS.allowDigitsOnly(value));
    const val = Number(`${this._isNegative ? '-' : ''}${INDIGIT_UTILS.standardizeDecimalSeparator(value, this._decimalSeparator)}`);
    return Number.isNaN(val) ? 0 : (val ?? 0);
  }

  private emitChange(value: number | null): void {
    if (value !== this._lastModelValue)
      this._onTouched();
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
