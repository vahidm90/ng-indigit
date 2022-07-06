import { IDigitGroupParameter } from '../interfaces';
import { DIGIT_GROUP_UTIL } from './_digit-group.util';
import { DEFAULT_CONFIG } from '../default-config';

const param = DEFAULT_CONFIG.integerDigitGroups as IDigitGroupParameter;

const groupSize = param.groupSize;

describe('DIGIT_GROUP_UTIL.apply', () => {
  it('should apply digit grouping to 123456 to get "123,456"', function () {
    expect(DIGIT_GROUP_UTIL.apply(123456, param)).toEqual('123,456');
  });
  it('should apply digit grouping to 123.456 to get "123,456"', function () {
    expect(DIGIT_GROUP_UTIL.apply(123.456, param)).toEqual('123,456');
  });
  it('should apply digit grouping to "123456" to get "123,456"', function () {
    expect(DIGIT_GROUP_UTIL.apply('123456', param)).toEqual('123,456');
  });
  it('should apply digit grouping to "0123" to get "0,123"', function () {
    expect(DIGIT_GROUP_UTIL.apply('0123', param)).toEqual('0,123');
  });
  it('should apply digit grouping to "01some123String123" to get "01,123,123"', function () {
    expect(DIGIT_GROUP_UTIL.apply('01some123String123', param)).toEqual('01,123,123');
  });
  it('should make no change to "0"', function () {
    expect(DIGIT_GROUP_UTIL.apply('0', param)).toEqual('0');
  });
  it('should return empty string per null', function () {
    expect(DIGIT_GROUP_UTIL.apply(null, param)).toEqual('');
  });
  it('should return empty string per undefined', function () {
    expect(DIGIT_GROUP_UTIL.apply(undefined, param)).toEqual('');
  });
});

describe('DIGIT_GROUP_UTIL.countGroups', () => {
  it('should count digit groups of 123456 to get 2', function () {
    expect(DIGIT_GROUP_UTIL.countGroups(123456, groupSize)).toEqual(2);
  });
  it('should count digit groups of 123.456 to get 2', function () {
    expect(DIGIT_GROUP_UTIL.countGroups(123.456, groupSize)).toEqual(2);
  });
  it('should count digit groups of "123456" to get 2', function () {
    expect(DIGIT_GROUP_UTIL.countGroups('123456', groupSize)).toEqual(2);
  });
  it('should count digit groups of "0123" to get 2', function () {
    expect(DIGIT_GROUP_UTIL.countGroups('0123', groupSize)).toEqual(2);
  });
  it('should count digit groups of "01some123String123" to get 3', function () {
    expect(DIGIT_GROUP_UTIL.countGroups('01some123String123', groupSize)).toEqual(3);
  });
  it('should count digit groups of "0" to get 1', function () {
    expect(DIGIT_GROUP_UTIL.countGroups('0', groupSize)).toEqual(1);
  });
  it('should return 0 per null', function () {
    expect(DIGIT_GROUP_UTIL.countGroups(null, groupSize)).toEqual(0);
  });
  it('should return 0 per undefined', function () {
    expect(DIGIT_GROUP_UTIL.countGroups(undefined, groupSize)).toEqual(0);
  });
});

describe('DIGIT_GROUP_UTIL.getDelimiterIndices', () => {
  it('should return delimiter indices of up to the first 4 digits in 123456789 ([4])', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices(123456789, param, 4)).toEqual([3]);
  });
  it('should return delimiter indices of up to the first 7 digits in 123456789 ([4,8])', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices(123456789, param, 7)).toEqual([3, 7]);
  });
  it('should return delimiter indices of up to the first 2 digits in 123.45 ([])', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices(123.45, param, 2)).toEqual([]);
  });
  it('should return delimiter indices of up to the first 6 digits in 123.456', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices(123.456, param, 6)).toEqual([3]);
  });
  it('should return delimiter indices of up to the first 20 digits in 123.456', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices(123.456, param, 20)).toEqual([3]);
  });
  it('should return delimiter indices of up to the first 3 digits in "12345"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('12345', param, 3)).toEqual([2]);
  });
  it('should return [] per 0 max traversed digits', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('0123', param, 0)).toEqual([]);
  });
  it('should return delimiter indices of up to the first 2 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 2)).toEqual([]);
  });
  it('should return delimiter indices of up to the first 3 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 3)).toEqual([2]);
  });
  it('should return delimiter indices of up to the first 4 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 4)).toEqual([2]);
  });
  it('should return delimiter indices of up to the first 5 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 5)).toEqual([2]);
  });
  it('should return delimiter indices of up to the first 6 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 6)).toEqual([2, 6]);
  });
  it('should return delimiter indices of up to the first 7 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 7)).toEqual([2, 6]);
  });
  it('should return delimiter indices of up to the first 8 digits in "01some123String123"', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('01some123String123', param, 7)).toEqual([2, 6]);
  });
  it('should return [] per "0" as subject', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices('0', param, 20)).toEqual([]);
  });
  it('should return [] per null', function () {
    expect(DIGIT_GROUP_UTIL.getDelimiterIndices(null, param, 20)).toEqual([]);
  });
});

describe('DIGIT_GROUP_UTIL.haveEqualGroupsCount', () => {
  it('should return true per null subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, null, null)).toEqual(true);
  });
  it('should return true per undefined subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, undefined, undefined)).toEqual(true);
  });
  it('should return true per null & undefined subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, null, undefined)).toEqual(true);
  });
  it('should return true per 1234567, 12345678, and 123456789 as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, 1234, 12345, 123456)).toEqual(true);
  });
  it('should return true per 0, 1, 12, and 123 as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, 0, 1, 12, 123)).toEqual(true);
  });
  it('should return true per "", null, and undefined as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, '', null, undefined)).toEqual(true);
  });
  it('should return true per 0, "00", and "000" as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, 0, '00', '000')).toEqual(true);
  });
  it('should return false per "" and 0 as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, '', 0)).toEqual(false);
  });
  it('should return false per 0, "00", "000", and "0000" as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, 0, '00', '000', '0000')).toEqual(false);
  });
  it('should return false per 123456 and 1234567 as subjects', function () {
    expect(DIGIT_GROUP_UTIL.haveEqualGroupsCount(groupSize, 123456, 1234567)).toEqual(false);
  });
});


