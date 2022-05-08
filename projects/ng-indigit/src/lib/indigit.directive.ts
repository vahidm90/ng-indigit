import { AfterViewInit, Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DecimalDigitGroupingParameters, DecimalParameters, DecimalSeparator, DigitGroupDelimiter, DigitGroupingParameters, IndicatorPosition } from './interfaces';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { INDIGIT_UTILS } from './utils';

@Directive({
  selector: 'input[type="text"][ng-indigit]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IndigitDirective), multi: true },]
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
      Functional
   */
  private _lastViewValue!: string;
  private _lastSelectionEnd!: number;
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
  private _allowDecimal: boolean = true;
  private _decimalSeparator: DecimalSeparator = '.';
  private _maxDecimalDigits: number = 4;
  private _minDecimalDigits: number = 0;

  /*
      Digit grouping parameters
   */
  private _noDigitGroups: boolean = false;
  private _grpIntDigits: boolean = true;
  private _intGrpDelimiter: DigitGroupDelimiter = ',';
  private _intGrpSize: number = 3;
  private _grpDecDigits: boolean = true;
  private _decGrpDelimiter: DigitGroupDelimiter = ' ';
  private _decGrpSize: number = 2;
  private _allDelimiters: DigitGroupDelimiter[] = [this._decGrpDelimiter, this._intGrpDelimiter];

  /*
      Negative number parameters
   */
  private _allowNegative: boolean = true;
  private _isNegative!: boolean;

  constructor(@Self() private _el: ElementRef, private _render: Renderer2) { }

  writeValue(obj: null | number): void {
    this.setViewValue((obj == null) ? obj : String(obj), true);
  }

  registerOnChange(fn: any): void {this._onChange = fn;}

  registerOnTouched(fn: any): void {this._onTouched = fn;}

  setDisabledState(isDisabled: boolean): void {
    if (this._inputElement)
      this._render.setProperty(this._inputElement, 'disabled', isDisabled);
  }

  ngAfterViewInit(): void {
    this.init();
    this.bindInputEvent();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  get viewValue(): string {
    return String(this._inputElement?.value || '');
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    this.resetKeydownParams(event);
    if (this.isAllowedDecimalSeparatorKey(event.key))
      return;
    if (this.isAllowedMinusKey(event.key))
      return;
    if (!this._noDigitGroups && (this.currentSelectionStart === this.currentSelectionEnd)) {
      if (this.mustMoveIndicatorBackBeforeChange(event.key)) {
        this.moveIndicator(this.currentSelectionEnd - 1);
        this.updateSelectionIndices();
        return;
      }
      if (this.mustMoveIndicatorForwardBeforeChange(event.key)) {
        this.moveIndicator(this.currentSelectionEnd + 1);
        this.updateSelectionIndices();
        return;
      }
    }
    if ((event.key === 'Backspace') || (event.key === 'Delete') || INDIGIT_UTILS.isAllowedKey(event) || INDIGIT_UTILS.isLegalNumKey(event.key))
      return;
    event.preventDefault();
  }

  private init(): void {
    this._inputElement = this._inputElement || this._el.nativeElement as HTMLInputElement;
    this._lastViewValue = this._inputElement?.value || '';
  }

  private setDigitGroupingParams(value: DigitGroupingParameters): void {
    this._grpIntDigits = !!value.integerDigitGroups ?? this._grpIntDigits;
    const intSetting = value.integerDigitGroups as DecimalDigitGroupingParameters;
    this._intGrpDelimiter = intSetting?.delimiter ?? value?.delimiter ?? this._intGrpDelimiter;
    this._intGrpSize = Math.floor(intSetting?.groupSize ?? value?.groupSize ?? this._intGrpSize);
    this._grpDecDigits = !!value.decimalDigitGroups ?? this._grpDecDigits;
    const decimalSetting = value.decimalDigitGroups as DecimalDigitGroupingParameters;
    this._decGrpDelimiter = decimalSetting?.delimiter ?? value.delimiter ?? this._decGrpDelimiter ?? this._intGrpDelimiter;
    this._decGrpSize = Math.floor(decimalSetting?.groupSize ?? value.groupSize ?? this._decGrpSize ?? this._intGrpSize);
    this._allDelimiters = [];
    if (this._decGrpDelimiter)
      this._allDelimiters.push(this._decGrpDelimiter);
    if (this._intGrpDelimiter && (this._intGrpDelimiter !== this._decGrpDelimiter))
      this._allDelimiters.push(this._intGrpDelimiter);
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

  private isAllowedDecimalSeparatorKey(key: string): boolean {
    return this._allowDecimal
      && (key === this._decimalSeparator)
      && (this.viewValue.indexOf(this._decimalSeparator) < 0);
  }

  private isAllowedMinusKey(key: string): boolean {
    return this._allowNegative
      && (key === '-')
      && ((this.currentSelectionEnd === 0) || (this.currentSelectionStart === 0));
  }

  private mustMoveIndicatorBackBeforeChange(key: string): boolean {
    return (key === 'Backspace')
      && this._allDelimiters.includes(this.viewValue[this.currentSelectionEnd - 1] as DigitGroupDelimiter);
  }

  private mustMoveIndicatorForwardBeforeChange(key: string): boolean {
    if (!this._allDelimiters.includes(this.viewValue[this.currentSelectionEnd] as DigitGroupDelimiter))
      return false;
    if (key === 'Delete')
      return true;
    if (!this._allowDecimal)
      return false;
    if (!INDIGIT_UTILS.isLegalNumKey(key))
      return false;
    if (this.currentSelectionEnd <= this.viewValue.indexOf(this._decimalSeparator))
      return false;
    return (this.currentSelectionEnd < this.viewValue.length);
  }

  private handleUserInput(value: string): void {
    const val = this.renderViewValue(value);
    this.setViewValue(val);
    this.setModelValue(val);
    let preChangeReverseIndex: IndicatorPosition;
    if (val && this._lastViewValue && this.viewValue)
      preChangeReverseIndex = this.trackIndicator(value);
    else
      preChangeReverseIndex = 0;
    this.restoreIndicator(preChangeReverseIndex);
  }

  private trackIndicator(value: string): IndicatorPosition {
    const reverseIndex =
      this._lastViewValue.substring(Math.max(this._lastSelectionEnd, this._lastSelectionStart)).length;
    if (this._allowDecimal) {
      const prevSeparatorIndex = this._lastViewValue.indexOf(this._decimalSeparator);
      if ((prevSeparatorIndex * this.viewValue.indexOf(this._decimalSeparator) < 0))
        return (prevSeparatorIndex < 0) ? 'afterDecimalSeparator' : 'beforePreviousDecimalPart';
      if (value.length > this._lastViewValue.length) {
        if (INDIGIT_UTILS.decimalPart(value, this._decimalSeparator).length > this._maxDecimalDigits)
          return reverseIndex - 1;
        return reverseIndex;
      }
    }
    return (value.length > this._lastViewValue.length)
      ? reverseIndex
      : (value.length - INDIGIT_UTILS.lastDifferentIndex(this._lastViewValue, value) - 1);
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
      return INDIGIT_UTILS.numOnly(val);
    if (this._allowNegative)
      val = this.prepareNegativeNumber(val);
    if (this._allowDecimal)
      val = this.prepareDecimalNumber(val);
    while ((val.length > 1) && (val[0] === '0') && (this._allowDecimal ? (val[1] !== this._decimalSeparator) : true))
      val = val.substring(1);
    return `${this._isNegative ? '-' : ''}${this._noDigitGroups ? val : this.addDigitGrouping(val)}`;
  }

  private prepareNegativeNumber(value: string): string {
    this._isNegative = (value[0] === '-');
    return value.substring(Number(this._isNegative));
  }

  private prepareDecimalNumber(value: string): string {
    if (value[0] === this._decimalSeparator)
      return `0${this._decimalSeparator}${INDIGIT_UTILS.numOnly(value.substring(1))}`;
    return INDIGIT_UTILS.sanitizeBulkString(value, this._decimalSeparator);
  }

  private addDigitGrouping(value: string): string {
    const intPart = this._grpIntDigits
      ? this.groupedIntegerPart(value)
      : INDIGIT_UTILS.integerPart(value, this._decimalSeparator);
    if (!this._allowDecimal)
      return intPart;
    const separator = (-1 < value.indexOf(this._decimalSeparator)) ? this._decimalSeparator : '';
    const decimal = this._grpDecDigits
      ? this.groupedDecimalPart(value)
      : INDIGIT_UTILS.decimalPart(value, this._decimalSeparator);
    return `${intPart}${separator}${decimal}`;
  }

  private groupedIntegerPart(value: string): string {
    let intPart = INDIGIT_UTILS.integerPart(value, this._decimalSeparator);
    if (intPart.length > this._intGrpSize)
      intPart = INDIGIT_UTILS.digitGroups(intPart, { separator: this._intGrpDelimiter, groupLength: this._intGrpSize });
    return intPart;
  }

  private groupedDecimalPart(value: string): string {
    let decPart = INDIGIT_UTILS.decimalPart(value, this._decimalSeparator).substring(0, this._maxDecimalDigits);
    if (decPart.length < this._minDecimalDigits)
      for (let i = this._minDecimalDigits - decPart.length; i > 0; i--)
        decPart = `${decPart}0`;
    if (this._grpDecDigits && (decPart.length > this._decGrpSize))
      decPart = INDIGIT_UTILS.digitGroups(decPart, { separator: this._decGrpDelimiter, groupLength: this._decGrpSize });
    return decPart;
  }

  private restoreIndicator(prevReverseIndex: IndicatorPosition): void {
    let position: number;
    switch (prevReverseIndex) {
      case 'afterDecimalSeparator':
        position = this.viewValue.indexOf(this._decimalSeparator) + 1;
        break;
      case 'beforePreviousDecimalPart':
        position = this.indicatorPositionAfterDecimalSeparatorRemoval();
        break;
      default:
        position = this.indicatorPositionAfterRegularOperations(prevReverseIndex);
    }
    if (position < 0)
      position = 0;
    else if (Number.isNaN(position) || (position > this.viewValue.length))
      position = this.viewValue.length;
    this.moveIndicator(position);
  }

  private indicatorPositionAfterDecimalSeparatorRemoval(): number {
    const selectionLastIndex = Math.max(this._lastSelectionStart, this._lastSelectionEnd);
    if (selectionLastIndex >= this._lastViewValue.length)
      return this.viewValue.length;
    const prevSeparatorIndex = this._lastViewValue.indexOf(this._decimalSeparator);
    const prevIntPart = INDIGIT_UTILS.integerPart(this._lastViewValue, this._decimalSeparator);
    if ((prevIntPart === '0') && ((prevSeparatorIndex + 1) >= selectionLastIndex))
      return 0;
    if (this._noDigitGroups || !this._grpIntDigits)
      return prevSeparatorIndex;
    const prevIntPartSize = prevIntPart.length;
    const prevIntPartLeftover = prevIntPartSize % this._intGrpSize;
    const prevDecimalPartLeftover = INDIGIT_UTILS.decimalPart(this._lastViewValue, this._decimalSeparator).length % this._intGrpSize;
    if (!prevIntPartLeftover && prevDecimalPartLeftover && (prevDecimalPartLeftover < prevIntPartSize))
      return prevSeparatorIndex + 1;
    const leftoverSize = (prevIntPartLeftover + prevDecimalPartLeftover) % this._intGrpSize;
    return prevSeparatorIndex + Number((leftoverSize > this._intGrpSize) && (leftoverSize < prevIntPartSize));
  }

  private indicatorPositionAfterRegularOperations(prevReverseIndex: number): number {
    if (this._isSingleDigitDelete)
      return this.indicatorPositionAfterSingleDigitDelete();
    if (prevReverseIndex > this.viewValue.length)
      return 0;
    return this.viewValue.length - prevReverseIndex;
  }

  private indicatorPositionAfterSingleDigitDelete(): number {
    if (this._noDigitGroups)
      return this._lastSelectionEnd;
    const prevSeparatorIndex = this._lastViewValue.indexOf(this._decimalSeparator);
    const prevIntPart = this._lastViewValue.substring(0, prevSeparatorIndex);
    let groupSize: number;
    let prevLeftSide: string;
    let currentPart: string;
    if (prevSeparatorIndex < this._lastSelectionEnd) {
      if (!this._grpDecDigits)
        return this._lastSelectionEnd;
      groupSize = this._decGrpSize;
      const decimalIndex = prevSeparatorIndex + 1;
      prevLeftSide
        = this._lastViewValue.substring(decimalIndex
        , decimalIndex + ((this._lastSelectionEnd - prevIntPart.length - 1) || 0));
      currentPart = INDIGIT_UTILS.decimalPart(this.viewValue, this._decimalSeparator);
    } else {
      if (!this._grpIntDigits)
        return this._lastSelectionEnd;
      groupSize = this._intGrpSize;
      prevLeftSide = prevIntPart.substring(0, this._lastSelectionEnd);
      currentPart = INDIGIT_UTILS.integerPart(this.viewValue, this._decimalSeparator);
    }
    const prevLeftSideSize = prevLeftSide.length;
    return this._lastSelectionEnd
      - Number(
        (groupSize <= prevLeftSideSize) && (INDIGIT_UTILS.firstDifferentIndex(currentPart, prevLeftSide) <= prevLeftSideSize));
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
      return Number(INDIGIT_UTILS.numOnly(value));
    const val = Number(`${this._isNegative ? '-' : ''}${INDIGIT_UTILS.standardSeparator(value, this._decimalSeparator)}`);
    return Number.isNaN(val) ? 0 : (val ?? 0);
  }

  private emitChange(value: number | null): void {
    if (value !== this._lastModelValue)
      this._onTouched();
  }

  private resetKeydownParams(event: KeyboardEvent): void {
    this._lastViewValue = this.viewValue;
    this.updateSelectionIndices();
    this._isSingleDigitDelete = (this.currentSelectionEnd === this.currentSelectionStart) && (event.key === 'Delete');
  }

  private updateSelectionIndices(): void {
    this._lastSelectionEnd = this.currentSelectionEnd || 0;
    this._lastSelectionStart = this.currentSelectionStart || 0;
  }

  private get currentSelectionEnd(): number {
    return this._inputElement?.selectionEnd || 0;
  }

  private get currentSelectionStart(): number {
    return this._inputElement?.selectionStart || 0;
  }

}
