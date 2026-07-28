import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useVirtualizer } from '../../../components/List/VirtualizedList/useVirtualizer';

interface Item {
    id: number;
}

const ITEM_SIZE = 100;

const createData = (count: number): Item[] => Array.from({ length: count }, (_, id) => ({ id }));

const keyExtractor = (item: Item) => item.id;

const createElement = ({
    clientHeight = 0,
    clientWidth = 0,
    scrollTop = 0,
    scrollLeft = 0,
}: { clientHeight?: number; clientWidth?: number; scrollTop?: number; scrollLeft?: number } = {}) => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
    Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true });
    Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true, writable: true });
    Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true, writable: true });
    return el;
};

const flushRaf = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

describe('useVirtualizer', () => {
    it('renders no virtual items with no overscan until the viewport has size', () => {
        const data = createData(20);
        const scrollElement = createElement();
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 0,
                horizontal: false,
            }),
        );

        expect(result.current.virtualItems).toHaveLength(0);
        expect(result.current.topSpacerSize).toBe(0);
        expect(result.current.bottomSpacerSize).toBe(0);
    });

    it('still renders overscan items even when the computed visible range is empty', () => {
        // With no measured sizes and a zero-size viewport the "visible" range
        // collapses to nothing (start=0, end=-1), but overscan is applied
        // regardless and pulls a few leading items in anyway.
        const data = createData(20);
        const scrollElement = createElement();
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 3,
                horizontal: false,
            }),
        );

        expect(result.current.virtualItems.map((item) => item.index)).toEqual([0, 1, 2]);
    });

    it('windows items to the viewport plus overscan once an item size is measured', () => {
        const data = createData(20);
        const scrollElement = createElement({ clientHeight: 250 });
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 3,
                horizontal: false,
            }),
        );

        // Measuring item 0 seeds the size cache; its size is used as the
        // fallback estimate for every other not-yet-measured item.
        act(() => {
            result.current.measureRef(0)(document.createElement('div'));
        });

        // viewport 0-250 overlaps items 0,1,2 (each 100px) -> +/-3 overscan
        expect(result.current.virtualItems.map((item) => item.index)).toEqual([0, 1, 2, 3, 4, 5]);
        expect(result.current.topSpacerSize).toBe(0);
        expect(result.current.bottomSpacerSize).toBe(20 * ITEM_SIZE - 6 * ITEM_SIZE);
    });

    it('shifts the window and grows the top spacer when the scroll offset changes', async () => {
        const data = createData(20);
        const scrollElement = createElement({ clientHeight: 250 });
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 0,
                horizontal: false,
            }),
        );

        act(() => {
            result.current.measureRef(0)(document.createElement('div'));
        });

        act(() => {
            scrollElement.scrollTop = 1000;
            scrollElement.dispatchEvent(new Event('scroll'));
        });
        await flushRaf();

        // scrolled to 1000px with a 250px viewport -> items covering 1000-1250
        expect(result.current.virtualItems.map((item) => item.index)).toEqual([10, 11, 12]);
        expect(result.current.topSpacerSize).toBe(10 * ITEM_SIZE);
        expect(result.current.bottomSpacerSize).toBe(20 * ITEM_SIZE - 13 * ITEM_SIZE);
    });

    it('expands the window by the overscan amount on both sides', () => {
        const data = createData(20);
        const scrollElement = createElement({ clientHeight: 250 });
        const itemsContainer = createElement();

        const noOverscan = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 0,
                horizontal: false,
            }),
        );
        act(() => {
            noOverscan.result.current.measureRef(0)(document.createElement('div'));
        });
        expect(noOverscan.result.current.virtualItems.map((item) => item.index)).toEqual([0, 1, 2]);

        const withOverscan = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement: createElement({ clientHeight: 250 }),
                itemsContainer: createElement(),
                overscan: 2,
                horizontal: false,
            }),
        );
        act(() => {
            withOverscan.result.current.measureRef(0)(document.createElement('div'));
        });
        expect(withOverscan.result.current.virtualItems.map((item) => item.index)).toEqual([0, 1, 2, 3, 4]);
    });

    it('measures the inline size and drives scroll offset from scrollLeft when horizontal', () => {
        const data = createData(20);
        const scrollElement = createElement({ clientWidth: 250 });
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 0,
                horizontal: true,
            }),
        );

        act(() => {
            result.current.measureRef(0)(document.createElement('div'));
        });

        expect(result.current.virtualItems.map((item) => item.index)).toEqual([0, 1, 2]);
    });

    it('returns an empty window for empty data', () => {
        const scrollElement = createElement({ clientHeight: 250 });
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data: [],
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 3,
                horizontal: false,
            }),
        );

        expect(result.current.virtualItems).toEqual([]);
        expect(result.current.topSpacerSize).toBe(0);
        expect(result.current.bottomSpacerSize).toBe(0);
    });

    it('reuses the same measureRef callback for a given key', () => {
        const data = createData(5);
        const scrollElement = createElement({ clientHeight: 250 });
        const itemsContainer = createElement();

        const { result } = renderHook(() =>
            useVirtualizer({
                data,
                keyExtractor,
                scrollElement,
                itemsContainer,
                overscan: 0,
                horizontal: false,
            }),
        );

        expect(result.current.measureRef(0)).toBe(result.current.measureRef(0));
    });
});
