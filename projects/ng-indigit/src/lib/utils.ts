import { DecimalSeparator } from './interfaces';

const stripNonDecimals: (value: string, decimalSeparator?: DecimalSeparator) => string = (value, decimalSeparator) => {
  if (!value)
    return '';
  const regExp = RegExp(decimalSeparator ? `[^\\d${decimalSeparator}]` : '\\D', 'g');
  return value.replace(regExp, '');
};

const digitGroupsCount: (value: string | number, groupLength: number) => number
  = (value, groupLength = 3) =>
  Math.ceil(((typeof value === 'string') ? stripNonDecimals(value).length : value) / groupLength);

const singleDecimalSeparator: (value: string, decimalSeparator: DecimalSeparator) => string = (value, decimalSeparator = '.') => {
  if (!value)
    return '';
  const i = value.indexOf(decimalSeparator);
  if (i === value.lastIndexOf(decimalSeparator))
    return value;
  return (value.substring(0, i) + decimalSeparator + value.substring(i + 1).replace(RegExp(decimalSeparator, 'g'), ''));
};

export const INDIGIT_UTILS: {
  digitGroups: (value: number | string, params: { separator?: string; groupLength?: number; }) => string;
  isAllowedKey: (event: KeyboardEvent) => boolean;
  isLegalNumKey: (key: string) => boolean;
  singleDecimalSeparator: (value: string, decimalSeparator: DecimalSeparator) => string;
  stripNonDecimals: (value: string, decimalSeparator?: DecimalSeparator) => string;
  digitGroupsCount: (value: string | number, groupLength: number) => number;
  isDigitGroupsCountSame: (value1: string | number, value2: string | number, groupLength: number) => boolean;
  standardSeparator: (value: string, decimalSeparator: DecimalSeparator) => string;
  sanitizeBulkString: (value: string, decimalSeparator?: DecimalSeparator) => string;
  numOnly: (value: string) => string;
  integerPart: (value: string, decimalSeparator: DecimalSeparator) => string;
  decimalPart: (value: string, decimalSeparator: DecimalSeparator) => string;
  lastDifferentIndex: (string1: string, string2: string) => number;
  firstDifferentIndex: (string1: string, string2: string) => number;
} = {
  digitGroups: (value, params = { separator: ',', groupLength: 3 }) => {
    const parameters = Object.assign({}, { separator: ',', groupLength: 3 }, params);
    if ('number' === typeof value)
      return String(value).replace(RegExp('(\\d)(?=(\\d{' + parameters.groupLength + '})+$)', 'g'), '$1' + parameters.separator);
    return value?.replace(RegExp('(\\d)(?=(\\d{' + parameters.groupLength + '})+$)', 'g'), '$1' + parameters.separator) || '';
  },
  isAllowedKey: event => {
    if (event.altKey || event.ctrlKey || event.shiftKey)
      return true;
    switch (event.key) {
      // Control keys
      case 'Tab':
      case 'Enter':
      case 'Insert':
      // Lock toggles
      case 'CapsLock':
      case 'NumLock':
      case 'ScrollLock':
      // Navigation
      case 'PageUp':
      case 'PageDown':
      case 'Home':
      case 'End':
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      // Functional
      case 'F1':
      case 'F2':
      case 'F3':
      case 'F4':
      case 'F5':
      case 'F6':
      case 'F7':
      case 'F8':
      case 'F9':
      case 'F10':
      case 'F11':
      case 'F12':
      case 'F21':
      // Miscellaneous
      case 'Meta':
      case 'Pause':
      case 'ContextMenu':
      case 'AudioVolumeMute':
      case 'AudioVolumeUp':
      case 'AudioVolumeDown':
      case 'MediaPlayPause':
      case 'LaunchApplication2':
        return true;
    }
    return false;
  },
  isLegalNumKey: key => {
    switch (key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '۰':
      case '۱':
      case '۲':
      case '۳':
      case '۴':
      case '۵':
      case '۶':
      case '۷':
      case '۸':
      case '۹':
        return true;
      default:
        return false;
    }
  },
  singleDecimalSeparator: (value, decimalSeparator = '.') => singleDecimalSeparator(value, decimalSeparator),
  stripNonDecimals: (value, decimalSeparator) => stripNonDecimals(value, decimalSeparator),
  digitGroupsCount: (value, groupLength = 3) => digitGroupsCount(value, groupLength),
  isDigitGroupsCountSame:
    (value1, value2, groupLength = 3) => digitGroupsCount(value1, groupLength) === digitGroupsCount(value2, groupLength),
  standardSeparator: (value, decimalSeparator) => {
    const val = stripNonDecimals(value, decimalSeparator);
    if (!val)
      return '';
    const i = val.indexOf(decimalSeparator);
    return (i < 0) ? val : (val.substring(0, i) + '.' + val.substring(i + 1));
  },
  sanitizeBulkString: (value, decimalSeparator) => {
    const val = stripNonDecimals(value.trim(), decimalSeparator);
    if (!val)
      return '';
    return decimalSeparator ? singleDecimalSeparator(val, decimalSeparator) : val;
  },
  numOnly: (value) => value.replace(/\D/g, ''),
  integerPart: (value, decimalSeparator = '.') => {
    const val = stripNonDecimals(value, decimalSeparator);
    if (!val)
      return '';
    const i = val.indexOf(decimalSeparator);
    return (i < 0) ? val : val.substring(0, i);
  },
  decimalPart: (value, decimalSeparator = '.') => {
    const val = stripNonDecimals(value, decimalSeparator);
    if (!val)
      return '';
    const i = val.indexOf(decimalSeparator);
    return (i > -1) ? val.substring(i + 1) : '';
  },
  lastDifferentIndex: (string1: string, string2: string) => {
    let big = string2;
    let small = string1;
    let isGrown = true;
    if (string1.length > string2.length) {
      big = string1;
      small = string2;
      isGrown = false;
    }
    let bigLast = big.length;
    let smallLast = small.length;
    while (smallLast > -1) {
      if (small[smallLast] !== big[bigLast])
        break;
      smallLast--;
      bigLast--;
    }
    return isGrown ? bigLast : smallLast;
  },
  firstDifferentIndex: (string1: string, string2: string) => {
    const maxValue = Math.min(string1.length, string2.length);
    for (let i = 0; i < maxValue; i++)
      if (string1[i] !== string2[i])
        return i;
    return maxValue;
  }
};
