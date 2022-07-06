import { NUMBER_UTIL } from './_number.util';

describe('NUMBER_UTIL.sanitize', () => {
  it('should sanitize 123456 to get "123456"', function () {
    expect(NUMBER_UTIL.sanitize(123456)).toEqual('123456');
  });
  it('should sanitize " 1.1234,56 789 " to get "123456789"', function () {
    expect(NUMBER_UTIL.sanitize(' 1.1234,56 789 ')).toEqual('1123456789');
  });
  it('should sanitize "ags;dhg.asf;\sfa``fas==123cv" to get "123"', function () {
    expect(NUMBER_UTIL.sanitize('ags;dhg.asf;\sfa``fas==123cv')).toEqual('123');
  });
  it('should sanitize null to get ""', function () {
    expect(NUMBER_UTIL.sanitize(null)).toEqual('');
  });
  it('should sanitize undefined to get ""', function () {
    expect(NUMBER_UTIL.sanitize(undefined)).toEqual('');
  });
});

describe('NUMBER_UTIL.faToEn', () => {
  it('should sanitize ۰۱۲۳۱۲۳ to get "0123123"', function () {
    expect(NUMBER_UTIL.faToEn('۰۱۲۳۱۲۳')).toEqual('0123123');
  });
  it('should sanitize " ۱۲۳,۱۲۳ " to get "123,123"', function () {
    expect(NUMBER_UTIL.faToEn(' ۱۲۳,۱۲۳ ')).toEqual('123,123');
  });
  it('should sanitize "ags;dhg.asf;\sfa``fas==۱۲۳cv" to get "ags;dhg.asf;\sfa``fas==123cv"', function () {
    expect(NUMBER_UTIL.faToEn('ags;dhg.asf;\sfa``fas==۱۲۳cv')).toEqual('ags;dhg.asf;\sfa``fas==123cv');
  });
  it('should sanitize "ags;dhg.asf;\sfa``fas==۱۲۳456" to get "ags;dhg.asf;\sfa``fas==123456"', function () {
    expect(NUMBER_UTIL.faToEn('ags;dhg.asf;\sfa``fas==۱۲۳456')).toEqual('ags;dhg.asf;\sfa``fas==123456');
  });
  it('should sanitize null to get ""', function () {
    expect(NUMBER_UTIL.faToEn(null)).toEqual('');
  });
  it('should sanitize undefined to get ""', function () {
    expect(NUMBER_UTIL.faToEn(undefined)).toEqual('');
  });
});
