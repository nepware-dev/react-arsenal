import { describe, it, expect } from 'vitest';

import { binarySearch, findVisibleRange } from '../../../components/List/VirtualizedList/utils';

describe('binarySearch', () => {
    it('returns the smallest index for which the predicate holds', () => {
        const values = [0, 10, 20, 30, 40, 50];
        const result = binarySearch(0, values.length - 1, (i) => values[i] >= 25, -1);

        expect(result).toBe(3);
    });

    it('returns the default value when no index satisfies the predicate', () => {
        const values = [0, 10, 20];
        const result = binarySearch(0, values.length - 1, (i) => values[i] > 100, -1);

        expect(result).toBe(-1);
    });

    it('returns the default value for an empty range', () => {
        const result = binarySearch(0, -1, () => true, 7);

        expect(result).toBe(7);
    });

    it('handles a single-element range', () => {
        expect(binarySearch(2, 2, () => true, -1)).toBe(2);
        expect(binarySearch(2, 2, () => false, -1)).toBe(-1);
    });
});

describe('findVisibleRange', () => {
    // 5 items, each 100px, no gap: offsets = [0, 100, 200, 300, 400, 500]
    const offsets = [0, 100, 200, 300, 400, 500];
    const count = 5;

    it('includes only items overlapping the viewport at the top of the list', () => {
        const { start, end } = findVisibleRange(offsets, count, 0, 250);

        // viewport covers 0-250: items 0 (0-100), 1 (100-200) fully, 2 (200-300) partially
        expect(start).toBe(0);
        expect(end).toBe(2);
    });

    it('shifts the range when scrolled into the middle of the list', () => {
        const { start, end } = findVisibleRange(offsets, count, 150, 350);

        // viewport covers 150-350: item 1 (100-200) partially, item 2 (200-300) fully, item 3 (300-400) partially
        expect(start).toBe(1);
        expect(end).toBe(3);
    });

    it('includes the last item when the viewport reaches the end of the list', () => {
        const { start, end } = findVisibleRange(offsets, count, 350, 500);

        expect(start).toBe(3);
        expect(end).toBe(4);
    });

    it('returns an empty range when there are no items', () => {
        const { start, end } = findVisibleRange([0], 0, 0, 200);

        expect(start).toBe(0);
        expect(end).toBe(-1);
    });
});
