import * as i0 from '@angular/core';
import { forwardRef, Directive, Self, Input, HostListener, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

const isNullSubject = subject => (subject == null) || (`${subject}`.trim() === '');
const BASIC_UTIL = {
    stringify: s => {
        if (isNullSubject(s))
            return '';
        return ((typeof s === 'string') ? s : `${s}`).trim();
    },
    makeBoolean: v => v != null && `${v}` !== 'false'
};

const NUMBER_UTIL = {
    sanitize: s => BASIC_UTIL.stringify(s)?.replace(/\D/g, '') || '',
    faToEn: (subject) => {
        const value = (typeof subject === 'string') ? subject : BASIC_UTIL.stringify(subject);
        return value
            ?.replace(/[\u0660-\u0669]/g, c => `${c.charCodeAt(0) - 0x0660}`)
            ?.replace(/[\u06f0-\u06f9]/g, c => `${c.charCodeAt(0) - 0x06f0}`) || '';
    }
};

const DIGIT_GROUP_UTIL = {
    apply: (subject, params, isSafeSubject) => {
        const value = isSafeSubject ? subject : NUMBER_UTIL.sanitize(subject);
        return params.groupSize
            ? (value?.replace(RegExp(`(\\d)(?=(\\d{${params.groupSize}})+$)`, 'g'), `$1${params.delimiter}`) || '')
            : value;
    }
};

const deduplicateFloatPoint = (subject, point, isSafeSubject) => {
    const value = isSafeSubject ? subject : BASIC_UTIL.stringify(subject);
    const i = value.indexOf(point);
    return (i === value.lastIndexOf(point))
        ? value
        : value.substring(0, i) + point + value.substring(i + 1).replace(RegExp(point, 'g'), '');
};
const sanitize$1 = (subject, point) => {
    let value = NUMBER_UTIL.faToEn(BASIC_UTIL.stringify(subject));
    if (!value)
        return '';
    let sign = '';
    if (value[0] === '-') {
        value = value.substring(1);
        sign = '-';
    }
    const regexp = RegExp(`[^\\d\\${point}]`, 'g');
    return deduplicateFloatPoint(`${sign}${value.replace(regexp, '')}`, point, true);
};
const FLOAT_UTIL = {
    sanitize: (subject, point) => sanitize$1(subject, point),
    getIntPart: (subject, point, isSafeSubject) => {
        let value = isSafeSubject ? subject : sanitize$1(subject, point);
        if (value[0] === '-')
            value = value.substring(1);
        if (!value)
            return '';
        const i = value.indexOf(point);
        if (!i || (value === point))
            return '0';
        while ((value[0] === '0') && (value.length > 1))
            value = value.substring(1);
        return (i < 0) ? value : value.substring(0, i);
    },
    getDecimals: (subject, point, isSafeSubject) => {
        const value = isSafeSubject ? subject : sanitize$1(subject, point);
        const i = value.indexOf(point);
        return (i > -1) ? value.substring(i + 1) : '';
    }
};

const sanitize = (subject, point, digitGroup, isSafeSubject) => {
    const value = isSafeSubject ? subject : FLOAT_UTIL.sanitize(subject, point);
    const sign = (value[0] === '-') ? '-' : '';
    const intPart = FLOAT_UTIL.getIntPart(value, point, true);
    if (!intPart)
        return '';
    const decimals = FLOAT_UTIL.getDecimals(value, point, true);
    const pointChar = (decimals.length || (value[value.length - 1] === point)) ? point : '';
    return digitGroup?.hasDigitGroups
        ? `${sign}${DIGIT_GROUP_UTIL.apply(intPart, digitGroup.integerPart, true)}${pointChar}${DIGIT_GROUP_UTIL.apply(decimals, digitGroup.decimalPart, true)}`
        : `${sign}${intPart}${pointChar}${decimals}`;
};
const PRETTY_FLOAT_UTIL = {
    sanitize: (subject, point, digitGroup, isSafeSubject) => sanitize(subject, point, digitGroup, isSafeSubject),
    findFirstChangedIndex: (newSubject, oldSubject) => {
        const newValue = newSubject.prettyValue;
        const oldValue = oldSubject.prettyValue;
        const groupDelimiters = newSubject.digitGroupDelimiters;
        let i = 0;
        let j = 0;
        while ((i < newValue.length) && (j < oldValue.length)) {
            if (groupDelimiters.indexOf(newValue[i]) > -1) {
                i++;
                continue;
            }
            if (groupDelimiters.indexOf(oldValue[j]) > -1) {
                j++;
                continue;
            }
            if (newValue[i] !== oldValue[j])
                return i;
            i++;
            j++;
        }
        return newValue.length;
    },
    findFirstChangedIndexFromEnd: (newSubject, oldSubject) => {
        const newValue = newSubject.prettyValue;
        const oldValue = oldSubject.prettyValue;
        const groupDelimiters = newSubject.digitGroupDelimiters;
        let i = newValue.length - 1;
        let j = oldValue.length - 1;
        while ((i > -1) && (j > -1)) {
            if (groupDelimiters.indexOf(newValue[i]) > -1) {
                i--;
                continue;
            }
            if (groupDelimiters.indexOf(oldValue[j]) > -1) {
                j--;
                continue;
            }
            if (newValue[i] !== oldValue[j])
                return i;
            i--;
            j--;
        }
        return i;
    }
};

const DEFAULT_CONFIG = {
    decimal: {
        floatPoint: '.',
        minDigitCount: 0,
        maxDigitCount: -1,
    },
    digitGroups: {
        groupSize: 3,
        delimiter: ' '
    }
};

function isDigitGroupOptionObject(value) {
    return value
        && (typeof value === 'object')
        && ['groupSize', 'delimiter'].some(key => key in value);
}

function isPrettyFloatDecimalOptionObject(value) {
    return value
        && (typeof value === 'object')
        && ['floatPoint', 'isDecimalAllowed', 'maxDigitCount', 'minDigitCount']
            .some(key => key in value);
}

function isCharacter(value) {
    return (typeof value === 'string') && (value.length === 1);
}

function isPrettyFloatDigitGroupOptionObject(value) {
    return value
        && (typeof value === 'object')
        && ['decimalPart', 'integerPart', 'hasDigitGroups']
            .some(key => key in value);
}

const makeBoolean = BASIC_UTIL.makeBoolean;
const digitGroupDefaults = {
    integerPart: { ...DEFAULT_CONFIG.digitGroups },
    decimalPart: { ...DEFAULT_CONFIG.digitGroups },
    hasDigitGroups: false
};
const sanitizeDigitGroupDelimiter = params => {
    const delimiter = params.delimiter;
    if (delimiter && !isCharacter(delimiter)) {
        console.warn('[NgIndigit] Invalid Digit Group Delimiter! The default character will be used!');
        delete params.delimiter;
    }
    return params;
};
const digitGroupParamFromGenericOption = (option, preset) => {
    const params = { ...preset };
    ['integerPart', 'decimalPart']
        .forEach(part => Object.assign(params[part], sanitizeDigitGroupDelimiter(option), params[part]));
    return params;
};
const digitGroupParamFromPrettyFloatOption = (option, preset) => {
    const params = { ...preset };
    ['integerPart', 'decimalPart']
        .forEach(part => {
        const partOption = option[part];
        if (isDigitGroupOptionObject(partOption))
            params[part] = { ...params[part], ...sanitizeDigitGroupDelimiter(partOption) };
        else if (partOption === false)
            params[part] = { ...params[part], groupSize: 0 };
    });
    return params;
};
const PRETTY_FLOAT_PARAM_UTIL = {
    decimal: options => {
        const decimalDefaults = DEFAULT_CONFIG.decimal;
        const defaults = { ...decimalDefaults, isDecimalAllowed: false };
        if (isPrettyFloatDecimalOptionObject(options)) {
            const point = options.floatPoint;
            if (point && !isCharacter(point)) {
                console.warn('[NgIndigit] Invalid Float Point! The default character will be used!');
                delete options.floatPoint;
            }
            return { ...defaults, ...options, isDecimalAllowed: options.isDecimalAllowed ?? (options.maxDigitCount !== 0) };
        }
        return { ...defaults, isDecimalAllowed: makeBoolean(options) };
    },
    digitGroup: (...options) => {
        if (!makeBoolean(options))
            return digitGroupDefaults;
        let params = { ...digitGroupDefaults };
        for (const option of options) {
            if (option == null)
                continue;
            if (isPrettyFloatDigitGroupOptionObject(option))
                params = digitGroupParamFromPrettyFloatOption(option, params);
            if (isDigitGroupOptionObject(option))
                params = digitGroupParamFromGenericOption(option, params);
            params.hasDigitGroups
                = option.hasDigitGroups ?? ((params.integerPart.groupSize > 0) || (params.decimalPart.groupSize > 0));
        }
        return params;
    }
};

const getDigitGroupParams = PRETTY_FLOAT_PARAM_UTIL.digitGroup;
const getDecimalParams = PRETTY_FLOAT_PARAM_UTIL.decimal;
const sanitizeNum = NUMBER_UTIL.sanitize;
class PrettyFloat {
    constructor(subject, decimal, digitGroup) {
        this.initValues(subject, decimal, digitGroup);
    }
    get value() {
        return this._value;
    }
    get pointIndex() {
        return this._pointIndex;
    }
    get forcedDecimals() {
        return (this._decimalParams.isDecimalAllowed && this._hasDecimalPart) ? this._forcedDecimals : 0;
    }
    get trimmedDecimals() {
        return this._decimalParams.isDecimalAllowed ? this._trimmedDecimals : '';
    }
    get hasDecimalPart() {
        return this._hasDecimalPart;
    }
    get digitGroupDelimiters() {
        const delimiters = [];
        if (!this._digitGroupParams?.hasDigitGroups)
            return delimiters;
        if (this._digitGroupParams.integerPart.groupSize > 0)
            delimiters.push(this._digitGroupParams.integerPart.delimiter);
        if (this._digitGroupParams.decimalPart.groupSize > 0)
            delimiters.push(this._digitGroupParams.decimalPart.delimiter);
        return delimiters;
    }
    get isNegative() {
        const number = this.value.number;
        return (number != null) && (number < 0);
    }
    get prettyValue() {
        return this._value.pretty;
    }
    get numberValue() {
        return this._value.number;
    }
    get intPart() {
        const value = Number(this._value.number?.toFixed());
        return Number.isNaN(value) ? null : value;
    }
    get prettyIntPart() {
        const prettyInt = this._value.pretty;
        return (this._pointIndex.prettyIndex > -1) ? prettyInt.substring(0, this._pointIndex.prettyIndex) : prettyInt;
    }
    get decimals() {
        return this._hasDecimalPart ? `${this._value.number}`.substring(this._pointIndex.numberIndex + 1) : '';
    }
    get prettyDecimals() {
        return this._hasDecimalPart ? this._value.pretty.substring(this._pointIndex.prettyIndex + 1) : '';
    }
    get decimalParams() {
        return this._decimalParams;
    }
    get digitGroupParams() {
        return this._digitGroupParams;
    }
    clone() {
        return new PrettyFloat(this.prettyValue, this.decimalParams, this.digitGroupParams);
    }
    updateIntPartDigitGroupParams(params) {
        this._digitGroupParams = getDigitGroupParams(this._digitGroupParams, { integerPart: params });
        return this.updateValue(this.prettyValue);
    }
    updateDecimalsDigitGroupParams(params) {
        this._digitGroupParams = getDigitGroupParams(this._digitGroupParams, { decimalPart: params });
        return this.updateValue(this.prettyValue);
    }
    updateDigitGroupParams(params) {
        this._digitGroupParams = getDigitGroupParams(this._digitGroupParams, params);
        return this.updateValue(this.prettyValue);
    }
    updateDecimalParams(decimal) {
        this._decimalParams = getDecimalParams(decimal);
        return this.updateValue(this.prettyValue);
    }
    updateValue(newValue) {
        this.value = this._decimalParams.isDecimalAllowed
            ? this.getValueWithDecimals(newValue)
            : this.getValueWithoutDecimals(newValue);
        return this;
    }
    set digitGroupParams(digitGroup) {
        this._digitGroupParams = getDigitGroupParams(digitGroup);
    }
    set decimalParams(decimal) {
        this._decimalParams = getDecimalParams(decimal);
    }
    set value(value) {
        this._value = value;
        if (!this._pointIndex)
            this._pointIndex = { prettyIndex: -1, numberIndex: -1 };
        if (!this.decimalParams.isDecimalAllowed)
            return;
        this.updateFloatPointIndices();
    }
    updateFloatPointIndices() {
        this.updateNumberValuePointIndex();
        this.updatePrettyValuePointIndex();
    }
    updateNumberValuePointIndex() {
        this._pointIndex.numberIndex = `${this.numberValue ?? ''}`.indexOf('.');
    }
    updatePrettyValuePointIndex() {
        this._pointIndex.prettyIndex = this.prettyValue.indexOf(this.decimalParams.floatPoint);
    }
    initValues(subject, decimal, digitGroup) {
        this.setParams(decimal, digitGroup);
        this.value = this._decimalParams?.isDecimalAllowed
            ? this.getValueWithDecimals(subject)
            : this.getValueWithoutDecimals(subject);
    }
    setParams(decimal, digitGroup) {
        this.decimalParams = decimal;
        this.digitGroupParams = digitGroup;
        this._hasDecimalPart = false;
    }
    getValueWithoutDecimals(subject) {
        let value = sanitizeNum(subject);
        while (value[0] === '0')
            value = value.substring(1);
        if (!value)
            return { pretty: '', number: null };
        const params = this._digitGroupParams;
        return {
            number: parseInt(value, 10),
            pretty: params.hasDigitGroups ? DIGIT_GROUP_UTIL.apply(value, params.integerPart) : value
        };
    }
    getValueWithDecimals(subject) {
        this.resetDecimalPartParams();
        const floatPoint = this._decimalParams.floatPoint;
        const value = FLOAT_UTIL.sanitize(subject, floatPoint);
        const intPart = FLOAT_UTIL.getIntPart(value, floatPoint, true);
        if (!value || !intPart)
            return { pretty: '', number: null };
        const decimals = this.getDecimals(value);
        return {
            number: parseFloat(`${intPart}.${decimals}`),
            pretty: PRETTY_FLOAT_UTIL.sanitize(`${intPart}${(decimals.length || (value[value.length - 1] === floatPoint)) ? floatPoint : ''}${decimals}`, floatPoint, this._digitGroupParams, true)
        };
    }
    resetDecimalPartParams() {
        this._forcedDecimals = 0;
        this._trimmedDecimals = '';
    }
    getDecimals(value) {
        const params = this._decimalParams;
        let decimal = FLOAT_UTIL.getDecimals(value, params.floatPoint, true);
        if (params.minDigitCount > 0)
            decimal = this.appendZeroDecimals(decimal);
        if (params.maxDigitCount > -1)
            decimal = this.trimRedundantDecimals(decimal);
        this._hasDecimalPart = !!decimal;
        return decimal;
    }
    appendZeroDecimals(decimalPart) {
        let decimal = decimalPart;
        while (decimal.length < this._decimalParams.minDigitCount) {
            decimal += '0';
            this._forcedDecimals++;
        }
        return decimal;
    }
    trimRedundantDecimals(decimalPart) {
        let decimal = decimalPart;
        while (decimal.length > this._decimalParams.maxDigitCount) {
            const lastIndex = decimal.length - 1;
            const lastDigit = decimal[lastIndex];
            if ((lastDigit === '0') && (this._forcedDecimals > 0))
                this._forcedDecimals--;
            else
                this._trimmedDecimals = `${lastDigit}${this._trimmedDecimals}`;
            decimal = decimal.substring(0, lastIndex);
        }
        return decimal;
    }
}

class IndigitDirective {
    constructor(_el, _render) {
        this._el = _el;
        this._render = _render;
        this._history = [];
        this._allowNegative = true;
        this._onChange = (_) => { };
        this._onTouched = () => { };
        this.init();
    }
    set decimalDigitGroups(params) {
        this.clearHistory();
        this.value = this._value.updateDecimalsDigitGroupParams(params);
    }
    set integerDigitGroups(params) {
        this.clearHistory();
        this.value = this._value.updateIntPartDigitGroupParams(params);
    }
    set decimal(params) {
        this.clearHistory();
        this.value = this._value.updateDecimalParams(params);
    }
    set allowNegative(value) {
        this.clearHistory();
        this._allowNegative = BASIC_UTIL.makeBoolean(value);
    }
    set value(newValue) {
        this._value = newValue;
        this.hostValue = newValue.prettyValue;
        this.modelValue = newValue.numberValue;
    }
    writeValue(value) {
        this._value.updateValue(value);
        this.hostValue = this._value.prettyValue;
    }
    registerOnChange(fn) { this._onChange = fn; }
    registerOnTouched(fn) { this._onTouched = fn; }
    setDisabledState(isDisabled) {
        if (this._inputElement)
            this._render.setProperty(this._inputElement, 'disabled', isDisabled);
    }
    onKeyup() {
        this._isContinuousKeydown = false;
    }
    onKeydown(event) {
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
        this.saveState();
        const indices = this._selection;
        const indicatorPosition = indices.endIndex;
        if (indicatorPosition === indices.startIndex)
            return this.onZeroSelectionKeydown(event.key, indicatorPosition);
        this._nextIndicatorPosition = 'beforeOldRightSide';
    }
    onMousedown() {
        this.saveState();
    }
    onInput() {
        const history = this._history;
        this.updateAfterUserInput(this._value.updateValue(this._inputElement.value), history[history.length - 1]?.value || null);
    }
    onBlur() {
        this.clearHistory();
        this._onTouched();
    }
    set hostValue(value) {
        this._render.setProperty(this._inputElement, 'value', value);
    }
    set modelValue(value) {
        this._onChange(value);
    }
    set hostSelectionStart(index) {
        this._render.setProperty(this._inputElement, 'selectionStart', index);
    }
    set hostSelectionEnd(index) {
        this._render.setProperty(this._inputElement, 'selectionEnd', index);
    }
    set hostSelection(indices) {
        this.hostSelectionStart = indices.startIndex;
        this.hostSelectionEnd = indices.endIndex;
    }
    set selection(indices) {
        this._selection = indices;
        this.hostSelection = indices;
    }
    set indicatorPosition(position) {
        this.selection = { endIndex: position, startIndex: position };
    }
    get selectionIndicesFromHost() {
        return { startIndex: this.selectionStartFromHost, endIndex: this.selectionEndFromHost };
    }
    get selectionStartFromHost() {
        return this._inputElement?.selectionStart || 0;
    }
    get selectionEndFromHost() {
        return this._inputElement?.selectionEnd || 0;
    }
    updateSelectionIndicesFromHost() {
        this._selection = this.selectionIndicesFromHost;
    }
    onZeroSelectionKeydown(key, indicatorPosition) {
        this._nextIndicatorPosition = this.getIndicatorPositionAfterSingleCharacterChange(key);
        if (this.isBackspaceKeyAfterDigitGroupDelimiter(key, indicatorPosition)) {
            this.indicatorPosition = indicatorPosition - 1;
            return;
        }
        if (this.isDeleteKeyBeforeDigitGroupDelimiter(key, indicatorPosition))
            this.indicatorPosition = indicatorPosition + 1;
    }
    isBackspaceKeyAfterDigitGroupDelimiter(key, indicatorPosition) {
        const value = this._value;
        return !!value
            && (key === 'Backspace')
            && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition - 1]) > -1);
    }
    isDeleteKeyBeforeDigitGroupDelimiter(keyCode, indicatorPosition) {
        const value = this._value;
        return !!value
            && (keyCode === 'Delete')
            && (value.digitGroupDelimiters.indexOf(value.prettyValue[indicatorPosition]) > -1);
    }
    getIndicatorPositionAfterSingleCharacterChange(key) {
        const decimalParams = this._value.decimalParams;
        if (decimalParams.isDecimalAllowed && (this._value.pointIndex.prettyIndex < 0) && (key === decimalParams.floatPoint))
            return 'afterFloatPoint';
        if (key === 'Delete')
            return 'afterOldLeftSide';
        return 'beforeOldRightSide';
    }
    saveState() {
        this.updateSelectionIndicesFromHost();
        this._history.push({
            value: this._value.clone(),
            selectionIndices: this._selection
        });
    }
    undo() {
        const lastState = this._history.pop();
        if (!lastState) {
            this.reset();
            return;
        }
        this.value = lastState.value;
        this.selection = lastState.selectionIndices;
    }
    clearHistory() {
        this._history = [];
    }
    reset() {
        this.clearHistory();
        this.value = this._value.updateValue(null);
        this.indicatorPosition = 0;
    }
    init() {
        this._inputElement = this._el.nativeElement;
        if (!this._inputElement)
            throw new Error('No host element found!');
        this.value = new PrettyFloat(this._inputElement.value);
    }
    updateAfterUserInput(newValue, oldValue) {
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
    getIndicatorPositionAfterUserInput(newValue, oldValue) {
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
    getIndicatorPositionByReverseOldIndex(newValue, oldValue) {
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
IndigitDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: IndigitDirective, deps: [{ token: i0.ElementRef, self: true }, { token: i0.Renderer2 }], target: i0.ɵɵFactoryTarget.Directive });
IndigitDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.11", type: IndigitDirective, selector: "input[type=\"text\"][ng-indigit]", inputs: { decimalDigitGroups: "decimalDigitGroups", integerDigitGroups: "integerDigitGroups", decimal: "decimal", allowNegative: "allowNegative" }, host: { listeners: { "keyup": "onKeyup()", "keydown": "onKeydown($event)", "mousedown": "onMousedown()", "input": "onInput()", "blur": "onBlur()" } }, providers: [{
            provide: NG_VALUE_ACCESSOR,
            // eslint-disable-next-line no-use-before-define
            useExisting: forwardRef(() => IndigitDirective),
            multi: true
        }], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: IndigitDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[type="text"][ng-indigit]',
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            // eslint-disable-next-line no-use-before-define
                            useExisting: forwardRef(() => IndigitDirective),
                            multi: true
                        }]
                }]
        }], ctorParameters: function () { return [{ type: i0.ElementRef, decorators: [{
                    type: Self
                }] }, { type: i0.Renderer2 }]; }, propDecorators: { decimalDigitGroups: [{
                type: Input
            }], integerDigitGroups: [{
                type: Input
            }], decimal: [{
                type: Input
            }], allowNegative: [{
                type: Input
            }], onKeyup: [{
                type: HostListener,
                args: ['keyup']
            }], onKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }], onMousedown: [{
                type: HostListener,
                args: ['mousedown']
            }], onInput: [{
                type: HostListener,
                args: ['input']
            }], onBlur: [{
                type: HostListener,
                args: ['blur']
            }] } });

class NgIndigitModule {
}
NgIndigitModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgIndigitModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
NgIndigitModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgIndigitModule, declarations: [IndigitDirective], exports: [IndigitDirective] });
NgIndigitModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgIndigitModule });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.11", ngImport: i0, type: NgIndigitModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [IndigitDirective],
                    exports: [IndigitDirective]
                }]
        }] });

// supplementary

/**
 * Generated bundle index. Do not edit.
 */

export { BASIC_UTIL, DIGIT_GROUP_UTIL, FLOAT_UTIL, IndigitDirective, NUMBER_UTIL, NgIndigitModule, PRETTY_FLOAT_PARAM_UTIL, PRETTY_FLOAT_UTIL, PrettyFloat };
//# sourceMappingURL=ng-indigit.mjs.map
