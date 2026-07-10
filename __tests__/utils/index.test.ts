import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

import {
    isObject,
    isArray,
    isEqual,
    isShallowEqual,
    isDeepEqual,
    throttle,
    debounce,
    sleep,
    isIntersectionObserverAvailable,
    scrollToElement,
    transformToElement,
    uuidv4,
    getNestedKey,
    associateObjectPath,
    camelize,
    buildHierarchy,
    formatFileSize,
} from '../../utils';

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

describe('isShallowEqual', () => {
    it('compares primitives directly', () => {
        expect(isShallowEqual(1, 1)).toBeTruthy();
        expect(isShallowEqual('a', 'b')).toBeFalsy();
    });

    it('returns true when top-level values and object references match', () => {
        const shared = { c: 1 };
        expect(isShallowEqual({ a: 1, b: shared }, { a: 1, b: shared })).toBeTruthy();
    });

    it('returns false for a nested object with equal values but a different reference', () => {
        expect(isShallowEqual(
            { a: 1, b: { c: 1 } },
            { a: 1, b: { c: 1 } },
        )).toBeFalsy();
    });

    it('returns false when top-level values differ', () => {
        expect(isShallowEqual({ a: 1 }, { a: 2 })).toBeFalsy();
    });
});

describe('isDeepEqual', () => {
    it('returns true for deeply nested equal objects', () => {
        expect(isDeepEqual(
            { a: { b: { c: [1, 2, { d: 'e' }] } } },
            { a: { b: { c: [1, 2, { d: 'e' }] } } },
        )).toBeTruthy();
    });

    it('returns false when a deeply nested value differs', () => {
        expect(isDeepEqual(
            { a: { b: { c: [1, 2, { d: 'e' }] } } },
            { a: { b: { c: [1, 2, { d: 'f' }] } } },
        )).toBeFalsy();
    });
});

describe('throttle', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('invokes immediately on the leading edge and schedules a trailing call', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 100);

        throttled('a');
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('a');

        throttled('b');
        throttled('c');
        expect(fn).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith('c');
    });

    it('skips the leading call when leading is false', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 100, { leading: false });

        throttled('a');
        expect(fn).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancel prevents the pending trailing call', () => {
        const fn = vi.fn();
        const throttled = throttle(fn, 100);

        throttled('a');
        throttled('b');
        throttled.cancel();

        vi.advanceTimersByTime(200);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('debounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('only calls the function once after the wait, with the last args', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced('a');
        debounced('b');
        expect(fn).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith('b');
    });

    it('resets the wait period on each call', () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(60);
        debounced();
        vi.advanceTimersByTime(60);
        expect(fn).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(40);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('sleep', () => {
    it('resolves after the given number of milliseconds', async () => {
        vi.useFakeTimers();
        const promise = sleep(1000);
        vi.advanceTimersByTime(1000);
        await expect(promise).resolves.toBeUndefined();
        vi.useRealTimers();
    });
});

describe('isIntersectionObserverAvailable', () => {
    const originalIO = (window as any).IntersectionObserver;
    const originalIOEntry = (window as any).IntersectionObserverEntry;

    afterEach(() => {
        (window as any).IntersectionObserver = originalIO;
        (window as any).IntersectionObserverEntry = originalIOEntry;
    });

    it('returns false when IntersectionObserver is not defined', () => {
        delete (window as any).IntersectionObserver;
        expect(isIntersectionObserverAvailable()).toBeFalsy();
    });

    it('returns true when IntersectionObserver support is present', () => {
        (window as any).IntersectionObserver = function () {};
        (window as any).IntersectionObserverEntry = { prototype: { isIntersecting: true } };
        expect(isIntersectionObserverAvailable()).toBeTruthy();
    });
});

describe('scrollToElement', () => {
    it('does nothing when element is falsy', () => {
        const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
        scrollToElement(null as unknown as Element);
        expect(scrollBySpy).not.toHaveBeenCalled();
        scrollBySpy.mockRestore();
    });

    it('scrolls by the element position minus its scroll-margin-top', () => {
        const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
        const div = document.createElement('div');
        div.style.scrollMarginTop = '20px';
        document.body.appendChild(div);

        scrollToElement(div);

        // getBoundingClientRect() is mocked (see __tests__/setup.ts) to return top: 100.
        expect(scrollBySpy).toHaveBeenCalledWith({ top: 80, behavior: 'smooth' });
        scrollBySpy.mockRestore();
        document.body.removeChild(div);
    });
});

describe('transformToElement', () => {
    it('returns a valid React element unchanged', () => {
        const el = React.createElement('div', { 'data-testid': 'existing' }, 'hi');
        const result = transformToElement(el);
        const { getByTestId } = render(result);
        expect(getByTestId('existing').textContent).toBe('hi');
    });

    it('wraps a function component', () => {
        const Comp = () => React.createElement('span', { 'data-testid': 'comp' }, 'yo');
        const result = transformToElement(Comp);
        const { getByTestId } = render(result);
        expect(getByTestId('comp').textContent).toBe('yo');
    });
});

describe('uuidv4', () => {
    it('generates a valid v4 UUID', () => {
        const id = uuidv4();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('generates unique values across calls', () => {
        expect(uuidv4()).not.toBe(uuidv4());
    });
});

describe('getNestedKey', () => {
    it('reads a deeply nested value', () => {
        const obj = { a: { b: { c: 'value' } } };
        expect(getNestedKey(obj, 'a', 'b', 'c')).toBe('value');
    });

    it('returns undefined when an intermediate key is missing', () => {
        const obj = { a: {} };
        expect(getNestedKey(obj, 'a', 'b', 'c')).toBeUndefined();
    });

    it('returns the object itself when no keys are given', () => {
        const obj = { a: 1 };
        expect(getNestedKey(obj)).toBe(obj);
    });
});

describe('associateObjectPath', () => {
    it('returns the value directly when path is not an array', () => {
        expect(associateObjectPath('a' as any, 5, {})).toBe(5);
    });

    it('returns the value directly when path is an empty array', () => {
        expect(associateObjectPath([], 5, { a: 1 })).toBe(5);
    });

    it('returns the value directly for a non-empty path', () => {
        expect(associateObjectPath(['a', 'b'], 5, { a: { b: 1 } })).toBe(5);
    });
});

describe('camelize', () => {
    it('joins arguments with hyphens', () => {
        expect(camelize('foo', 'bar')).toBe('fooBar');
        expect(camelize('foo', 'bar', 'baz')).toBe('fooBarBaz');
    });

    it('returns the single argument unchanged', () => {
        expect(camelize('hello')).toBe('hello');
    });
});

describe('buildHierarchy', () => {
    it('builds a nested tree from a flat list using id/parent by default', () => {
        const items = [
            { id: 1, name: 'root', parent: null },
            { id: 2, name: 'child1', parent: 1 },
            { id: 3, name: 'child2', parent: 1 },
            { id: 4, name: 'grandchild', parent: 2 },
        ];

        const result = buildHierarchy(items);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('root');
        expect(result[0].level).toBe(0);
        expect(result[0].children).toHaveLength(2);
        expect(result[0].children[0].name).toBe('child1');
        expect(result[0].children[0].level).toBe(1);
        expect(result[0].children[0].children[0].name).toBe('grandchild');
        expect(result[0].children[0].children[0].level).toBe(2);
        expect(result[0].children[1].name).toBe('child2');
        expect(result[0].children[1].children).toHaveLength(0);
    });

    it('treats items whose parent does not exist in the list as roots', () => {
        const items = [
            { id: 1, name: 'a', parent: 99 },
            { id: 2, name: 'b', parent: 1 },
        ];

        const result = buildHierarchy(items);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('a');
        expect(result[0].children[0].name).toBe('b');
    });

    it('supports custom key extractors and level/children key names', () => {
        const items = [
            { key: 'root', label: 'Root', parentKey: null },
            { key: 'child', label: 'Child', parentKey: 'root' },
        ];

        const result = buildHierarchy(items, {
            levelKey: 'depth',
            childrenKey: 'nodes',
            keyExtractor: (item: any) => item.key,
            parentKeyExtractor: (item: any) => item.parentKey,
        });

        expect(result).toHaveLength(1);
        expect(result[0].label).toBe('Root');
        expect((result[0] as any).depth).toBe(0);
        expect((result[0] as any).nodes[0].label).toBe('Child');
    });
});

describe('formatFileSize', () => {
    it('should return "0.00 B" for falsy values', () => {
        expect(formatFileSize(0)).toBe('0.00 B');
        expect(formatFileSize(null)).toBe('0.00 B');
        expect(formatFileSize(undefined)).toBe('0.00 B');
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
