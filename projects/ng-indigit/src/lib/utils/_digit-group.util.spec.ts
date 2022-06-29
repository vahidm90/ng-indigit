import { IDigitGroupParameter } from '../interfaces';
import { DIGIT_GROUP_UTIL } from './_digit-group.util';

const param: IDigitGroupParameter = {
  delimiter: ',',
  groupSize: 3
};
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
