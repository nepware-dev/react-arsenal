import { describe, it, expect } from 'vitest';

import cs, { CSClass } from '../cs';

describe('cs', () => {
  it('removes null and undefined', () => {
    const input = ['name', false, null, 'name1'];
    const result = cs(...input);
    const expected = 'name name1';

    expect(result).toEqual(expected);
  });

  it('removes false values from object', () => {
    const input = ['name', false, { 'name1': true, 'name2': false }];
    const result = cs(...input);
    const expected = 'name name1';

    expect(result).toEqual(expected);
  });

  it('removes false values from array', () => {
    const input = ['name', false, ['name1', true], ['name2', false]] as CSClass[];
    const result = cs(...input);
    const expected = 'name name1';

    expect(result).toEqual(expected);
  });

  it('works with a single value', () => {
    const input = ['name'];
    const result = cs(...input);
    const expected = 'name';

    expect(result).toEqual(expected);
  });
});
