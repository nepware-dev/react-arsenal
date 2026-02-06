import {
    isObject,
    isArray,
    isEqual,
    formatFileSize,
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

describe('formatFileSize', () => {
    it('should return "0.00 B" for falsy values', () => {
        expect(formatFileSize(0)).toBe('0.00 B');
        expect(formatFileSize(null)).toBe('0.00 B');
        expect(formatFileSize(undefined)).toBe('0.00 B');
        expect(formatFileSize('')).toBe('0.00 B');
    });

    it('should format bytes correctly (SI standard - base 1000)', () => {
        expect(formatFileSize(1)).toBe('1.00 B');
        expect(formatFileSize(500)).toBe('500.00 B');
        expect(formatFileSize(999)).toBe('999.00 B');
    });

    it('should format kilobytes correctly (SI standard)', () => {
        expect(formatFileSize(1000)).toBe('1.00 KB');
        expect(formatFileSize(1500)).toBe('1.50 KB');
        expect(formatFileSize(999000)).toBe('999.00 KB');
    });

    it('should format megabytes correctly (SI standard)', () => {
        expect(formatFileSize(1000000)).toBe('1.00 MB');
        expect(formatFileSize(1500000)).toBe('1.50 MB');
        expect(formatFileSize(999000000)).toBe('999.00 MB');
    });

    it('should format gigabytes correctly (SI standard)', () => {
        expect(formatFileSize(1000000000)).toBe('1.00 GB');
        expect(formatFileSize(2500000000)).toBe('2.50 GB');
    });

    it('should format terabytes correctly (SI standard)', () => {
        expect(formatFileSize(1000000000000)).toBe('1.00 TB');
        expect(formatFileSize(5500000000000)).toBe('5.50 TB');
    });

    it('should format petabytes correctly (SI standard)', () => {
        expect(formatFileSize(1000000000000000)).toBe('1.00 PB');
    });

    it('should respect custom decimal places (numFixed)', () => {
        expect(formatFileSize(1234, { numFixed: 0 })).toBe('1 KB');
        expect(formatFileSize(1234, { numFixed: 1 })).toBe('1.2 KB');
        expect(formatFileSize(1234, { numFixed: 3 })).toBe('1.234 KB');
        expect(formatFileSize(1234567, { numFixed: 4 })).toBe('1.2346 MB');
    });

    it('should format using binary standard (base 1024) when base1000 is false', () => {
        expect(formatFileSize(1024, { base1000: false })).toBe('1.00 KiB');
        expect(formatFileSize(1048576, { base1000: false })).toBe('1.00 MiB');
        expect(formatFileSize(1073741824, { base1000: false })).toBe('1.00 GiB');
        expect(formatFileSize(1099511627776, { base1000: false })).toBe('1.00 TiB');
    });

    it('should handle binary format with custom decimal places', () => {
        expect(formatFileSize(1536, { numFixed: 1, base1000: false })).toBe('1.5 KiB');
        expect(formatFileSize(2621440, { numFixed: 0, base1000: false })).toBe('3 MiB');
    });

    it('should handle small byte values in binary format', () => {
        expect(formatFileSize(1, { base1000: false })).toBe('1.00 B');
        expect(formatFileSize(512, { base1000: false })).toBe('512.00 B');
        expect(formatFileSize(1023, { base1000: false })).toBe('1023.00 B');
    });
});
