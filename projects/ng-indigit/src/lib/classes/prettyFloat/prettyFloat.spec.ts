import { PrettyFloat } from './prettyFloat';

describe('PrettyFloat', () => {
  it('should create an instance', () => {
    const float = new PrettyFloat('12,34,123.465', true, true);
    expect(float.value).toEqual({ pretty: '1,234,123.465', number: 1234123.465 });
  });
});
