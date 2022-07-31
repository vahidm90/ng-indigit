import { Directive, forwardRef, HostListener, Input, Self } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PrettyFloat } from './classes';
import { BASIC_UTIL, PRETTY_FLOAT_UTIL } from './utils';
import * as i0 from "@angular/core";
export class IndigitDirective {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kaWdpdC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZy1pbmRpZ2l0L3NyYy9saWIvaW5kaWdpdC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBYSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDeEcsT0FBTyxFQUF3QixpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBR3pFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDeEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFNBQVMsQ0FBQzs7QUFXeEQsTUFBTSxPQUFPLGdCQUFnQjtJQW9DM0IsWUFBNEIsR0FBZSxFQUFVLE9BQWtCO1FBQTNDLFFBQUcsR0FBSCxHQUFHLENBQVk7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFXO1FBTC9ELGFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBQy9CLG1CQUFjLEdBQVksSUFBSSxDQUFDO1FBQy9CLGNBQVMsR0FBRyxDQUFDLENBQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLGVBQVUsR0FBRyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFHN0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQXBDRCxJQUNJLGtCQUFrQixDQUFDLE1BQVc7UUFDaEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsSUFDSSxrQkFBa0IsQ0FBQyxNQUFXO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUks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QUs7Z0JBT0YsT0FBTztzQkFEVixLQUFLO2dCQU9GLGFBQWE7c0JBRGhCLEtBQUs7Z0JBeUNOLE9BQU87c0JBRE4sWUFBWTt1QkFBQyxPQUFPO2dCQU1yQixTQUFTO3NCQURSLFlBQVk7dUJBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQXVCbkMsV0FBVztzQkFEVixZQUFZO3VCQUFDLFdBQVc7Z0JBTXpCLE9BQU87c0JBRE4sWUFBWTt1QkFBQyxPQUFPO2dCQU9yQixNQUFNO3NCQURMLFlBQVk7dUJBQUMsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgZm9yd2FyZFJlZiwgSG9zdExpc3RlbmVyLCBJbnB1dCwgUmVuZGVyZXIyLCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb250cm9sVmFsdWVBY2Nlc3NvciwgTkdfVkFMVUVfQUNDRVNTT1IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBUSW5kaWNhdG9yUG9zaXRpb24gfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IElJbmRpZ2l0U3RhdGUsIElUZXh0SW5wdXRTZWxlY3Rpb24gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgUHJldHR5RmxvYXQgfSBmcm9tICcuL2NsYXNzZXMnO1xuaW1wb3J0IHsgQkFTSUNfVVRJTCwgUFJFVFRZX0ZMT0FUX1VUSUwgfSBmcm9tICcuL3V0aWxzJztcblxuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW5wdXRbdHlwZT1cInRleHRcIl1bbmctaW5kaWdpdF0nLFxuICBwcm92aWRlcnM6IFt7XG4gICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZS1iZWZvcmUtZGVmaW5lXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gSW5kaWdpdERpcmVjdGl2ZSksXG4gICAgbXVsdGk6IHRydWVcbiAgfV1cbn0pXG5leHBvcnQgY2xhc3MgSW5kaWdpdERpcmVjdGl2ZSBpbXBsZW1lbnRzIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcblxuICBASW5wdXQoKVxuICBzZXQgZGVjaW1hbERpZ2l0R3JvdXBzKHBhcmFtczogYW55KSB7XG4gICAgdGhpcy5jbGVhckhpc3RvcnkoKTtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5fdmFsdWUudXBkYXRlRGVjaW1hbHNEaWdpdEdyb3VwUGFyYW1zKHBhcmFtcyk7XG4gIH1cblxuICBASW5wdXQoKVxuICBzZXQgaW50ZWdlckRpZ2l0R3JvdXBzKHBhcmFtczogYW55KSB7XG4gICAgdGhpcy5jbGVhckhpc3RvcnkoKTtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5fdmFsdWUudXBkYXRlSW50UGFydERpZ2l0R3JvdXBQYXJhbXMocGFyYW1zKTtcbiAgfVxuXG4gIEBJbnB1dCgpXG4gIHNldCBkZWNpbWFsKHBhcmFtczogYW55KSB7XG4gICAgdGhpcy5jbGVhckhpc3RvcnkoKTtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5fdmFsdWUudXBkYXRlRGVjaW1hbFBhcmFtcyhwYXJhbXMpO1xuICB9XG5cbiAgQElucHV0KClcbiAgc2V0IGFsbG93TmVnYXRpdmUodmFsdWU6IGFueSkge1xuICAgIHRoaXMuY2xlYXJIaXN0b3J5KCk7XG4gICAgdGhpcy5fYWxsb3dOZWdhdGl2ZSA9IEJBU0lDX1VUSUwubWFrZUJvb2xlYW4odmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdmFsdWUhOiBQcmV0dHlGbG9hdDtcbiAgcHJpdmF0ZSBfc2VsZWN0aW9uITogSVRleHRJbnB1dFNlbGVjdGlvbjtcbiAgcHJpdmF0ZSBfaXNDb250aW51b3VzS2V5ZG93biE6IGJvb2xlYW47XG4gIHByaXZhdGUgX2lucHV0RWxlbWVudCE6IEhUTUxJbnB1dEVsZW1lbnQ7XG4gIHByaXZhdGUgX25leHRJbmRpY2F0b3JQb3NpdGlvbiE6IFRJbmRpY2F0b3JQb3NpdGlvbjtcbiAgcHJpdmF0ZSBfaGlzdG9yeTogSUluZGlnaXRTdGF0ZVtdID0gW107XG4gIHByaXZhdGUgX2FsbG93TmVnYXRpdmU6IGJvb2xlYW4gPSB0cnVlO1xuICBwcml2YXRlIF9vbkNoYW5nZSA9IChfOiBhbnkpID0+IHsgfTtcbiAgcHJpdmF0ZSBfb25Ub3VjaGVkID0gKCkgPT4geyB9O1xuXG4gIGNvbnN0cnVjdG9yKEBTZWxmKCkgcHJpdmF0ZSBfZWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcjogUmVuZGVyZXIyKSB7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBzZXQgdmFsdWUobmV3VmFsdWU6IFByZXR0eUZsb2F0KSB7XG4gICAgdGhpcy5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICB0aGlzLmhvc3RWYWx1ZSA9IG5ld1ZhbHVlLnByZXR0eVZhbHVlO1xuICAgIHRoaXMubW9kZWxWYWx1ZSA9IG5ld1ZhbHVlLm51bWJlclZhbHVlO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fdmFsdWUudXBkYXRlVmFsdWUodmFsdWUpO1xuICAgIHRoaXMuaG9zdFZhbHVlID0gdGhpcy5fdmFsdWUucHJldHR5VmFsdWU7XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHt0aGlzLl9vbkNoYW5nZSA9IGZuO31cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KTogdm9pZCB7dGhpcy5fb25Ub3VjaGVkID0gZm47fVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pbnB1dEVsZW1lbnQpXG4gICAgICB0aGlzLl9yZW5kZXIuc2V0UHJvcGVydHkodGhpcy5faW5wdXRFbGVtZW50LCAnZGlzYWJsZWQnLCBpc0Rpc2FibGVkKTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2tleXVwJylcbiAgb25LZXl1cCgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0NvbnRpbnVvdXNLZXlkb3duID0gZmFsc2U7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdrZXlkb3duJywgWyckZXZlbnQnXSlcbiAgb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gZXZlbnQua2V5O1xuICAgIGlmICh0aGlzLl9pc0NvbnRpbnVvdXNLZXlkb3duIHx8IChbJ0NvbnRyb2wnLCAnQWx0JywgJ1NoaWZ0J10uaW5kZXhPZihrZXkpID4gLTEpKVxuICAgICAgcmV0dXJuO1xuICAgIGlmIChldmVudC5yZXBlYXQpIHtcbiAgICAgIHRoaXMuX2lzQ29udGludW91c0tleWRvd24gPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQuY3RybEtleSAmJiAoZXZlbnQuY29kZSA9PT0gJ0tleVonKSkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHRoaXMudW5kbygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnNhdmVTdGF0ZSgpO1xuICAgIGNvbnN0IGluZGljZXMgPSB0aGlzLl9zZWxlY3Rpb247XG4gICAgY29uc3QgaW5kaWNhdG9yUG9zaXRpb24gPSBpbmRpY2VzLmVuZEluZGV4O1xuICAgIGlmIChpbmRpY2F0b3JQb3NpdGlvbiA9PT0gaW5kaWNlcy5zdGFydEluZGV4KVxuICAgICAgcmV0dXJuIHRoaXMub25aZXJvU2VsZWN0aW9uS2V5ZG93bihldmVudC5rZXksIGluZGljYXRvclBvc2l0aW9uKTtcbiAgICB0aGlzLl9uZXh0SW5kaWNhdG9yUG9zaXRpb24gPSAnYmVmb3JlT2xkUmlnaHRTaWRlJztcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ21vdXNlZG93bicpXG4gIG9uTW91c2Vkb3duKCk6IHZvaWQge1xuICAgIHRoaXMuc2F2ZVN0YXRlKCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdpbnB1dCcpXG4gIG9uSW5wdXQoKTogdm9pZCB7XG4gICAgY29uc3QgaGlzdG9yeSA9IHRoaXMuX2hpc3Rvcnk7XG4gICAgdGhpcy51cGRhdGVBZnRlclVzZXJJbnB1dCh0aGlzLl92YWx1ZS51cGRhdGVWYWx1ZSh0aGlzLl9pbnB1dEVsZW1lbnQudmFsdWUpLCBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMV0/LnZhbHVlIHx8IG51bGwpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignYmx1cicpXG4gIG9uQmx1cigpOiB2b2lkIHtcbiAgICB0aGlzLmNsZWFySGlzdG9yeSgpO1xuICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXQgaG9zdFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZW5kZXIuc2V0UHJvcGVydHkodGhpcy5faW5wdXRFbGVtZW50LCAndmFsdWUnLCB2YWx1ZSk7XG4gIH1cblxuICBwcml2YXRlIHNldCBtb2RlbFZhbHVlKHZhbHVlOiBudW1iZXIgfCBudWxsKSB7XG4gICAgdGhpcy5fb25DaGFuZ2UodmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXQgaG9zdFNlbGVjdGlvblN0YXJ0KGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLl9yZW5kZXIuc2V0UHJvcGVydHkodGhpcy5faW5wdXRFbGVtZW50LCAnc2VsZWN0aW9uU3RhcnQnLCBpbmRleCk7XG4gIH1cblxuICBwcml2YXRlIHNldCBob3N0U2VsZWN0aW9uRW5kKGluZGV4OiBudW1iZXIpIHtcbiAgICB0aGlzLl9yZW5kZXIuc2V0UHJvcGVydHkodGhpcy5faW5wdXRFbGVtZW50LCAnc2VsZWN0aW9uRW5kJywgaW5kZXgpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXQgaG9zdFNlbGVjdGlvbihpbmRpY2VzOiBJVGV4dElucHV0U2VsZWN0aW9uKSB7XG4gICAgdGhpcy5ob3N0U2VsZWN0aW9uU3RhcnQgPSBpbmRpY2VzLnN0YXJ0SW5kZXg7XG4gICAgdGhpcy5ob3N0U2VsZWN0aW9uRW5kID0gaW5kaWNlcy5lbmRJbmRleDtcbiAgfVxuXG4gIHByaXZhdGUgc2V0IHNlbGVjdGlvbihpbmRpY2VzOiBJVGV4dElucHV0U2VsZWN0aW9uKSB7XG4gICAgdGhpcy5fc2VsZWN0aW9uID0gaW5kaWNlcztcbiAgICB0aGlzLmhvc3RTZWxlY3Rpb24gPSBpbmRpY2VzO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXQgaW5kaWNhdG9yUG9zaXRpb24ocG9zaXRpb246IG51bWJlcikge1xuICAgIHRoaXMuc2VsZWN0aW9uID0geyBlbmRJbmRleDogcG9zaXRpb24sIHN0YXJ0SW5kZXg6IHBvc2l0aW9uIH07XG4gIH1cblxuICBwcml2YXRlIGdldCBzZWxlY3Rpb25JbmRpY2VzRnJvbUhvc3QoKTogSVRleHRJbnB1dFNlbGVjdGlvbiB7XG4gICAgcmV0dXJuIHsgc3RhcnRJbmRleDogdGhpcy5zZWxlY3Rpb25TdGFydEZyb21Ib3N0LCBlbmRJbmRleDogdGhpcy5zZWxlY3Rpb25FbmRGcm9tSG9zdCB9O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgc2VsZWN0aW9uU3RhcnRGcm9tSG9zdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dEVsZW1lbnQ/LnNlbGVjdGlvblN0YXJ0IHx8IDA7XG4gIH1cblxuICBwcml2YXRlIGdldCBzZWxlY3Rpb25FbmRGcm9tSG9zdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dEVsZW1lbnQ/LnNlbGVjdGlvbkVuZCB8fCAwO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTZWxlY3Rpb25JbmRpY2VzRnJvbUhvc3QoKTogdm9pZCB7XG4gICAgdGhpcy5fc2VsZWN0aW9uID0gdGhpcy5zZWxlY3Rpb25JbmRpY2VzRnJvbUhvc3Q7XG4gIH1cblxuICBwcml2YXRlIG9uWmVyb1NlbGVjdGlvbktleWRvd24oa2V5OiBzdHJpbmcsIGluZGljYXRvclBvc2l0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9uZXh0SW5kaWNhdG9yUG9zaXRpb24gPSB0aGlzLmdldEluZGljYXRvclBvc2l0aW9uQWZ0ZXJTaW5nbGVDaGFyYWN0ZXJDaGFuZ2Uoa2V5KTtcbiAgICBpZiAodGhpcy5pc0JhY2tzcGFjZUtleUFmdGVyRGlnaXRHcm91cERlbGltaXRlcihrZXksIGluZGljYXRvclBvc2l0aW9uKSkge1xuICAgICAgdGhpcy5pbmRpY2F0b3JQb3NpdGlvbiA9IGluZGljYXRvclBvc2l0aW9uIC0gMTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNEZWxldGVLZXlCZWZvcmVEaWdpdEdyb3VwRGVsaW1pdGVyKGtleSwgaW5kaWNhdG9yUG9zaXRpb24pKVxuICAgICAgdGhpcy5pbmRpY2F0b3JQb3NpdGlvbiA9IGluZGljYXRvclBvc2l0aW9uICsgMTtcbiAgfVxuXG4gIHByaXZhdGUgaXNCYWNrc3BhY2VLZXlBZnRlckRpZ2l0R3JvdXBEZWxpbWl0ZXIoa2V5OiBzdHJpbmcsIGluZGljYXRvclBvc2l0aW9uOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3ZhbHVlO1xuICAgIHJldHVybiAhIXZhbHVlXG4gICAgICAmJiAoa2V5ID09PSAnQmFja3NwYWNlJylcbiAgICAgICYmICh2YWx1ZS5kaWdpdEdyb3VwRGVsaW1pdGVycy5pbmRleE9mKHZhbHVlLnByZXR0eVZhbHVlW2luZGljYXRvclBvc2l0aW9uIC0gMV0pID4gLTEpO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0RlbGV0ZUtleUJlZm9yZURpZ2l0R3JvdXBEZWxpbWl0ZXIoa2V5Q29kZTogc3RyaW5nLCBpbmRpY2F0b3JQb3NpdGlvbjogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLl92YWx1ZTtcbiAgICByZXR1cm4gISF2YWx1ZVxuICAgICAgJiYgKGtleUNvZGUgPT09ICdEZWxldGUnKVxuICAgICAgJiYgKHZhbHVlLmRpZ2l0R3JvdXBEZWxpbWl0ZXJzLmluZGV4T2YodmFsdWUucHJldHR5VmFsdWVbaW5kaWNhdG9yUG9zaXRpb25dKSA+IC0xKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0SW5kaWNhdG9yUG9zaXRpb25BZnRlclNpbmdsZUNoYXJhY3RlckNoYW5nZShrZXk6IHN0cmluZyk6IFRJbmRpY2F0b3JQb3NpdGlvbiB7XG4gICAgY29uc3QgZGVjaW1hbFBhcmFtcyA9IHRoaXMuX3ZhbHVlLmRlY2ltYWxQYXJhbXM7XG4gICAgaWYgKGRlY2ltYWxQYXJhbXMuaXNEZWNpbWFsQWxsb3dlZCAmJiAodGhpcy5fdmFsdWUucG9pbnRJbmRleC5wcmV0dHlJbmRleCA8IDApICYmIChrZXkgPT09IGRlY2ltYWxQYXJhbXMuZmxvYXRQb2ludCkpXG4gICAgICByZXR1cm4gJ2FmdGVyRmxvYXRQb2ludCc7XG4gICAgaWYgKGtleSA9PT0gJ0RlbGV0ZScpXG4gICAgICByZXR1cm4gJ2FmdGVyT2xkTGVmdFNpZGUnO1xuICAgIHJldHVybiAnYmVmb3JlT2xkUmlnaHRTaWRlJztcbiAgfVxuXG4gIHByaXZhdGUgc2F2ZVN0YXRlKCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uSW5kaWNlc0Zyb21Ib3N0KCk7XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoKHtcbiAgICAgIHZhbHVlOiB0aGlzLl92YWx1ZS5jbG9uZSgpLFxuICAgICAgc2VsZWN0aW9uSW5kaWNlczogdGhpcy5fc2VsZWN0aW9uXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHVuZG8oKTogdm9pZCB7XG4gICAgY29uc3QgbGFzdFN0YXRlID0gdGhpcy5faGlzdG9yeS5wb3AoKTtcbiAgICBpZiAoIWxhc3RTdGF0ZSkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnZhbHVlID0gbGFzdFN0YXRlLnZhbHVlO1xuICAgIHRoaXMuc2VsZWN0aW9uID0gbGFzdFN0YXRlLnNlbGVjdGlvbkluZGljZXM7XG4gIH1cblxuICBwcml2YXRlIGNsZWFySGlzdG9yeSgpOiB2b2lkIHtcbiAgICB0aGlzLl9oaXN0b3J5ID0gW107XG4gIH1cblxuICBwcml2YXRlIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMuY2xlYXJIaXN0b3J5KCk7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuX3ZhbHVlLnVwZGF0ZVZhbHVlKG51bGwpO1xuICAgIHRoaXMuaW5kaWNhdG9yUG9zaXRpb24gPSAwO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCk6IHZvaWQge1xuICAgIHRoaXMuX2lucHV0RWxlbWVudCA9IHRoaXMuX2VsLm5hdGl2ZUVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBpZiAoIXRoaXMuX2lucHV0RWxlbWVudClcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaG9zdCBlbGVtZW50IGZvdW5kIScpO1xuICAgIHRoaXMudmFsdWUgPSBuZXcgUHJldHR5RmxvYXQodGhpcy5faW5wdXRFbGVtZW50LnZhbHVlKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlQWZ0ZXJVc2VySW5wdXQobmV3VmFsdWU6IFByZXR0eUZsb2F0LCBvbGRWYWx1ZTogUHJldHR5RmxvYXQgfCBudWxsKTogdm9pZCB7XG4gICAgaWYgKCFvbGRWYWx1ZT8ucHJldHR5VmFsdWUgfHwgIW5ld1ZhbHVlLnByZXR0eVZhbHVlKVxuICAgICAgdGhpcy5fbmV4dEluZGljYXRvclBvc2l0aW9uID0gJ2VuZE9mTGluZSc7XG4gICAgY29uc3Qgb2xkRm9yY2VkRGVjaW1hbHMgPSBvbGRWYWx1ZT8uZm9yY2VkRGVjaW1hbHM7XG5cbiAgICAvLyBzdHJpcCBhcHBlbmRlZCAwIGRlY2ltYWxzIG9mIG9sZCB2YWx1ZSBpbiBjYXNlIGZsb2F0IHBvaW50IGlzIHJlbW92ZWRcbiAgICBpZiAob2xkRm9yY2VkRGVjaW1hbHMgJiYgbmV3VmFsdWUgJiYgKG5ld1ZhbHVlLnBvaW50SW5kZXgucHJldHR5SW5kZXggPCAwKSkge1xuICAgICAgbmV3VmFsdWUudXBkYXRlVmFsdWUoYCR7bmV3VmFsdWUubnVtYmVyVmFsdWV9YC5zbGljZSgwLCAtb2xkRm9yY2VkRGVjaW1hbHMpKTtcbiAgICAgIG9sZFZhbHVlPy51cGRhdGVWYWx1ZShgJHtvbGRWYWx1ZT8ubnVtYmVyVmFsdWV9YC5zbGljZSgwLCAtb2xkRm9yY2VkRGVjaW1hbHMpKTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlID0gbmV3VmFsdWU7XG4gICAgdGhpcy5pbmRpY2F0b3JQb3NpdGlvbiA9IHRoaXMuZ2V0SW5kaWNhdG9yUG9zaXRpb25BZnRlclVzZXJJbnB1dChuZXdWYWx1ZSwgb2xkVmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJbmRpY2F0b3JQb3NpdGlvbkFmdGVyVXNlcklucHV0KG5ld1ZhbHVlOiBQcmV0dHlGbG9hdCwgb2xkVmFsdWU6IFByZXR0eUZsb2F0IHwgbnVsbCk6IG51bWJlciB7XG4gICAgY29uc3QgbmV3VmFsdWVFbmRJbmRleCA9IG5ld1ZhbHVlLnByZXR0eVZhbHVlLmxlbmd0aDtcbiAgICBpZiAoIW9sZFZhbHVlKVxuICAgICAgcmV0dXJuIG5ld1ZhbHVlRW5kSW5kZXg7XG4gICAgc3dpdGNoICh0aGlzLl9uZXh0SW5kaWNhdG9yUG9zaXRpb24pIHtcbiAgICAgIGNhc2UgJ2VuZE9mTGluZSc6XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZUVuZEluZGV4O1xuICAgICAgY2FzZSAnYWZ0ZXJGbG9hdFBvaW50JzpcbiAgICAgICAgcmV0dXJuIG5ld1ZhbHVlLnBvaW50SW5kZXgucHJldHR5SW5kZXggKyAxO1xuICAgICAgY2FzZSAnYWZ0ZXJPbGRMZWZ0U2lkZSc6XG4gICAgICAgIHJldHVybiBQUkVUVFlfRkxPQVRfVVRJTC5maW5kRmlyc3RDaGFuZ2VkSW5kZXgobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aGlzLmdldEluZGljYXRvclBvc2l0aW9uQnlSZXZlcnNlT2xkSW5kZXgobmV3VmFsdWUsIG9sZFZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldEluZGljYXRvclBvc2l0aW9uQnlSZXZlcnNlT2xkSW5kZXgobmV3VmFsdWU6IFByZXR0eUZsb2F0LCBvbGRWYWx1ZTogUHJldHR5RmxvYXQpOiBudW1iZXIge1xuICAgIGNvbnN0IHNlbGVjdGlvbkluZGljZXMgPSB0aGlzLl9oaXN0b3J5W3RoaXMuX2hpc3RvcnkubGVuZ3RoIC0gMV0uc2VsZWN0aW9uSW5kaWNlcztcbiAgICBjb25zdCBzZWxlY3Rpb25JbmRleCA9IE1hdGgubWF4KHNlbGVjdGlvbkluZGljZXMuc3RhcnRJbmRleCwgc2VsZWN0aW9uSW5kaWNlcy5lbmRJbmRleCk7XG4gICAgY29uc3Qgb2xkUHJldHR5ID0gb2xkVmFsdWUucHJldHR5VmFsdWU7XG4gICAgY29uc3QgbmV3VmFsdWVMZW5ndGggPSBuZXdWYWx1ZS5wcmV0dHlWYWx1ZS5sZW5ndGg7XG4gICAgaWYgKHNlbGVjdGlvbkluZGV4ID49IG9sZFByZXR0eS5sZW5ndGgpXG4gICAgICByZXR1cm4gbmV3VmFsdWVMZW5ndGg7XG4gICAgcmV0dXJuIG5ld1ZhbHVlLmRpZ2l0R3JvdXBQYXJhbXMuaGFzRGlnaXRHcm91cHNcbiAgICAgID8gKFBSRVRUWV9GTE9BVF9VVElMLmZpbmRGaXJzdENoYW5nZWRJbmRleEZyb21FbmQobmV3VmFsdWUsIG9sZFZhbHVlKSArIDEpXG4gICAgICA6IChuZXdWYWx1ZUxlbmd0aCAtIG9sZFByZXR0eS5zdWJzdHJpbmcoc2VsZWN0aW9uSW5kZXgpLmxlbmd0aCk7XG4gIH1cblxufVxuIl19