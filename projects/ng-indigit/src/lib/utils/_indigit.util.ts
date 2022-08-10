import { PrettyFloat } from '../classes';
import { IIndigitState } from '../interfaces';

export const INDIGIT_UTIL: {
  getIndicatorPositionByOldIndex: (newValue: PrettyFloat, lastState: IIndigitState) => number;
  getIndicatorPositionByReverseOldIndex: (newValue: PrettyFloat, lastState: IIndigitState) => number;
} = {

  getIndicatorPositionByOldIndex: (newValue, lastState) => {
    const selection = lastState.selection;
    const selectionStart = Math.min(selection.startIndex, selection.endIndex);
    if (selectionStart < 1)
      return 0;
    const oldPretty = lastState.value.prettyValue;
    const newPretty = newValue.prettyValue;
    const newPrettyLength = newPretty.length;
    if (Math.max(selection.startIndex, selection.endIndex) >= oldPretty.length)
      return newPrettyLength;
    const digitGroupParams = newValue.digitGroupParams;
    if (!digitGroupParams.hasDigitGroups
      || ((digitGroupParams.integerPart.groupSize < 1) && (digitGroupParams.decimalPart.groupSize < 1)))
      return selectionStart;
    const oldLeftSideDigitCount = oldPretty.substring(0, selectionStart).match(/\d/g)?.length || 0;
    let traversedDigits = 0;
    let indicatorPosition = 0;
    while ((traversedDigits < oldLeftSideDigitCount) && (indicatorPosition < newPrettyLength)) {
      traversedDigits += +/\d/.test(newPretty[indicatorPosition]);
      indicatorPosition++;
    }
    return indicatorPosition;
  },

  getIndicatorPositionByReverseOldIndex: (newValue, lastState) => {
    const selection = lastState.selection;
    const selectionEnd = Math.max(selection.startIndex, selection.endIndex);
    const oldPretty = lastState.value.prettyValue;
    const newPretty = newValue.prettyValue;
    const newPrettyLength = newPretty.length;
    if (selectionEnd >= oldPretty.length)
      return newPrettyLength;
    const digitGroupParams = newValue.digitGroupParams;
    const oldRightSide = oldPretty.substring(selectionEnd);
    if (!digitGroupParams.hasDigitGroups
      || ((digitGroupParams.integerPart.groupSize < 1) && (digitGroupParams.decimalPart.groupSize < 1)))
      return newPrettyLength - oldRightSide.length;
    const oldRightSideDigitCount = oldRightSide.match(/\d/g)?.length || 0;
    let traversedDigits = 0;
    let indicatorPosition = newPrettyLength - 1;
    while ((traversedDigits < oldRightSideDigitCount) && (indicatorPosition > -1)) {
      traversedDigits += +/\d/.test(newPretty[indicatorPosition]);
      indicatorPosition -= +(traversedDigits < oldRightSideDigitCount);
    }
    return indicatorPosition;
  }

};
