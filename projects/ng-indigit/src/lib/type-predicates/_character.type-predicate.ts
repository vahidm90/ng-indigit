import { TCustomCharacter } from '../types';

export function isCharacter(value: any): value is TCustomCharacter {
  return (typeof value === 'string') && (value.length === 1);
}
