import {
    isObject,
    isArray,
    isEqual,
} from './index';

it('isObject test', () => {
    expect(isObject(null)).toBeFalsy();
    expect(isObject(undefined)).toBeFalsy();
    expect(isObject({})).toBeTruthy();
    expect(isObject({ test: 'test' })).toBeTruthy();
    expect(isObject([])).toBeTruthy();
    expect(isObject(Date())).toBeFalsy();
    expect(isObject(/sdfa/)).toBeFalsy();
    expect(isObject(() => {})).toBeFalsy();
});

it('isArray test', () => {
    expect(isArray(null)).toBeFalsy();
    expect(isArray(undefined)).toBeFalsy();
    expect(isArray({})).toBeFalsy();
    expect(isArray({ test: 'test' })).toBeFalsy();
    expect(isArray([])).toBeTruthy();
    expect(isObject(Date())).toBeFalsy();
    expect(isObject(/sdfa/)).toBeFalsy();
    expect(isObject(() => {})).toBeFalsy();
});

it('isEqual test', () => {
    expect(isEqual(1, 1)).toBeTruthy();
    expect(isEqual(1, '1')).toBeFalsy();
    expect(isEqual({ a: 'c' }, null)).toBeFalsy();
    expect(isEqual(
        {
            a: {
                b: {
                    c: 'c',
                    d: 'c'
                },
            },
            b: ['2'],
            c: 'c',
        },
        {
            c: 'c',
            a: {
                b: {
                    c: 'c',
                    d: 'c'
                },
            },
            b: ['2'],
        }, 3
    )).toBeTruthy();
    expect(isEqual(
        {
            a: {
                c: {
                    c: 'c',
                    d: 'c'
                },
            },
            b: ['2'],
            c: 'c',
        },
        {
            a: {
                c: {
                    c: 'd',
                },
            },
            b: ['2'],
            c: 'c',
        }, 3
    )).toBeFalsy();
});
