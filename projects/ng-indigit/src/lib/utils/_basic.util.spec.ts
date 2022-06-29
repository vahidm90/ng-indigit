import { BASIC_UTIL } from './_basic.util';

describe('BASIC_UTIL.stringify', () => {
  it('should return an empty string per null value', function () {
    expect(BASIC_UTIL.stringify(null)).toEqual('');
  });
  it('should should return an empty string per undefined values', function () {
    expect(BASIC_UTIL.stringify(undefined)).toEqual('');
  });
  it('should convert integers into a string', function () {
    expect(BASIC_UTIL.stringify(123456)).toEqual('123456');
  });
  it('should convert floats into a string', function () {
    expect(BASIC_UTIL.stringify(123.456)).toEqual('123.456');
  });
  it('should strip preceding/following spaces from a given string', function () {
    expect(BASIC_UTIL.stringify(' 7901 1233 1 ')).toEqual('7901 1233 1');
  });
  it('should leave a string as is', function () {
    expect(BASIC_UTIL.stringify('hello789/.')).toEqual('hello789/.');
  });
});
