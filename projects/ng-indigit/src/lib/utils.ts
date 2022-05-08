import { DecimalSeparator } from './interfaces';

export const digitGroups: (value: number | string, params: { separator?: string; groupLength?: number; }) => string
  = (value, params = { separator: ',', groupLength: 3 }) => {
  const parameters = Object.assign({}, { separator: ',', groupLength: 3 }, params);
  if ('number' === typeof value)
    return String(value).replace(RegExp('(\\d)(?=(\\d{' + parameters.groupLength + '})+$)', 'g'), '$1' + parameters.separator);
  return value?.replace(RegExp('(\\d)(?=(\\d{' + parameters.groupLength + '})+$)', 'g'), '$1' + parameters.separator) || '';
};

export const isAllowedKey: (event: KeyboardEvent) => boolean = event => {
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
};

export const isLegalNumKey: (key: string) => boolean = key => {
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
};


export const singleDecimalSeparator: (value: string, decimalSeparator: DecimalSeparator) => string = (value, decimalSeparator = '.') => {
  if (!value)
    return '';
  const i = value.indexOf(decimalSeparator);
  if (i === value.lastIndexOf(decimalSeparator))
    return value;
  return (value.substring(0, i) + decimalSeparator + value.substring(i + 1).replace(RegExp(decimalSeparator, 'g'), ''));
};

export const stripNonDecimals: (value: string, decimalSeparator?: DecimalSeparator) => string = (value, decimalSeparator) => {
  if (!value)
    return '';
  const regExp = RegExp(decimalSeparator ? `[^\\d${decimalSeparator}]` : '\\D', 'g');
  return value.replace(regExp, '');
};

export const digitGroupsCount: (value: string | number, groupLength: number) => number
  = (value, groupLength = 3) => Math.ceil(((typeof value === 'string') ? stripNonDecimals(value).length : value) / groupLength);

export const isDigitGroupsCountSame: (value1: string | number, value2: string | number, groupLength: number) => boolean
  = (value1, value2, groupLength = 3) => digitGroupsCount(value1, groupLength) === digitGroupsCount(value2, groupLength);

export const standardSeparator: (value: string, decimalSeparator: DecimalSeparator) => string = (value, decimalSeparator) => {
  const val = stripNonDecimals(value, decimalSeparator);
  if (!val)
    return '';
  const i = val.indexOf(decimalSeparator);
  return (i < 0) ? val : (val.substring(0, i) + '.' + val.substring(i + 1));
};

export const sanitizeBulkString: (value: string, decimalSeparator?: DecimalSeparator) => string = (value, decimalSeparator) => {
  const val = stripNonDecimals(value.trim(), decimalSeparator);
  if (!val)
    return '';
  return decimalSeparator ? singleDecimalSeparator(val, decimalSeparator) : val;
};

export const numOnly: (value: string) => string = (value) => value.replace(/\D/g, '');

export const integerPart: (value: string, decimalSeparator: DecimalSeparator) => string = (value, decimalSeparator = '.') => {
  const val = stripNonDecimals(value, decimalSeparator);
  if (!val)
    return '';
  const i = val.indexOf(decimalSeparator);
  return (i < 0) ? val : val.substring(0, i);
};

export const decimalPart: (value: string, decimalSeparator: DecimalSeparator) => string = (value, decimalSeparator = '.') => {
  const val = stripNonDecimals(value, decimalSeparator);
  if (!val)
    return '';
  const i = val.indexOf(decimalSeparator);
  return (i > -1) ? val.substring(i + 1) : '';
};

export const lastDifferentIndex = function (string1: string, string2: string): number {
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
};

export const firstDifferentIndex = function (string1: string, string2: string): number {
  const maxValue = Math.min(string1.length, string2.length);
  for (let i = 0; i < maxValue; i++)
    if (string1[i] !== string2[i])
      return i;
  return maxValue;
};

