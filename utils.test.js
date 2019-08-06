import { isObject } from './utils';

it('isObject test', () => {
    expect(isObject(null)).toBeFalsy();
    expect(isObject(undefined)).toBeFalsy();
    expect(isObject({})).toBeTruthy();
    expect(isObject({ test: 'test' })).toBeTruthy();
    expect(isObject([])).toBeTruthy();
    expect(isObject(Date())).toBeFalsy();
});
