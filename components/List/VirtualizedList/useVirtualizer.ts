import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { findVisibleRange } from './utils';

export interface VirtualItem<T> {
    index: number;
    key: string | number;
    data: T;
}

interface UseVirtualizerOptions<T> {
    data: T[];
    keyExtractor: (item: T, index: number) => string | number;
    scrollElement: HTMLElement | null;
    itemsContainer: HTMLElement | null;
    overscan: number;
    horizontal: boolean;
}

interface UseVirtualizerResult<T> {
    virtualItems: VirtualItem<T>[];
    topSpacerSize: number;
    bottomSpacerSize: number;
    measureRef: (key: string | number) => (node: Element | null) => (() => void) | void;
}

export const useVirtualizer = <T>({
    data,
    keyExtractor,
    scrollElement,
    itemsContainer,
    overscan,
    horizontal,
}: UseVirtualizerOptions<T>): UseVirtualizerResult<T> => {
    const count = data.length;
    const getKey = useCallback((index: number) => keyExtractor(data[index], index), [data, keyExtractor]);

    const sizeCache = useRef(new Map<string | number, number>());
    const elementKeys = useRef(new WeakMap<Element, string | number>());
    const measureRefs = useRef(new Map<string | number, (node: Element | null) => (() => void) | void>());
    const observerRef = useRef<ResizeObserver | null>(null);
    const horizontalRef = useRef(horizontal);
    horizontalRef.current = horizontal;

    const [scrollOffset, setScrollOffset] = useState(0);
    const [viewportSize, setViewportSize] = useState(0);
    const [gap, setGap] = useState(0);
    const [version, setVersion] = useState(0);

    useLayoutEffect(() => {
        if (!itemsContainer) return;

        const updateGap = () => {
            const computedStyle = window.getComputedStyle(itemsContainer);
            const gapValue = horizontal ? computedStyle.columnGap : computedStyle.rowGap;
            const parsedGap = parseFloat(gapValue);
            setGap(Number.isNaN(parsedGap) ? 0 : parsedGap);
        };
        updateGap();

        const resizeObserver = new ResizeObserver(updateGap);
        resizeObserver.observe(itemsContainer);
        return () => resizeObserver.disconnect();
    }, [itemsContainer, horizontal]);

    useLayoutEffect(() => {
        if (!scrollElement) return;

        const updateMeasurements = () => {
            setViewportSize(horizontal ? scrollElement.clientWidth : scrollElement.clientHeight);
        };
        updateMeasurements();

        const resizeObserver = new ResizeObserver(updateMeasurements);
        resizeObserver.observe(scrollElement);

        return () => resizeObserver.disconnect();
    }, [scrollElement, horizontal]);

    useLayoutEffect(() => {
        if (!scrollElement) return;

        let frame: ReturnType<typeof requestAnimationFrame> | null = null;
        const handleScroll = () => {
            if (frame !== null) return;
            frame = requestAnimationFrame(() => {
                setScrollOffset(horizontal ? scrollElement.scrollLeft : scrollElement.scrollTop);
                frame = null;
            });
        };

        setScrollOffset(horizontal ? scrollElement.scrollLeft : scrollElement.scrollTop);
        scrollElement.addEventListener('scroll', handleScroll);
        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, [scrollElement, horizontal]);

    const getObserver = useCallback(() => {
        if (!observerRef.current) {
            observerRef.current = new ResizeObserver((entries) => {
                let changed = false;
                entries.forEach((entry) => {
                    const key = elementKeys.current.get(entry.target);
                    if (key === undefined) return;

                    const entryBorderBoxSize = entry.borderBoxSize;
                    const borderBoxSize = Array.isArray(entryBorderBoxSize) ? entryBorderBoxSize[0] : entryBorderBoxSize;
                    const blockSize = borderBoxSize?.blockSize ?? entry.contentRect.height;
                    const inlineSize = borderBoxSize?.inlineSize ?? entry.contentRect.width;
                    const mainSize = horizontalRef.current ? inlineSize : blockSize;

                    const previous = sizeCache.current.get(key);
                    if (previous === undefined || Math.abs(previous - mainSize) > 0.5) {
                        sizeCache.current.set(key, mainSize);
                        changed = true;
                    }
                });
                if (changed) setVersion((v) => v + 1);
            });
        }
        return observerRef.current;
    }, []);

    const measureRef = useCallback(
        (key: string | number) => {
            const cached = measureRefs.current.get(key);
            if (cached) return cached;

            const callback = (node: Element | null) => {
                if (!node) return undefined;

                const observer = getObserver();
                elementKeys.current.set(node, key);
                observer.observe(node);

                const rect = node.getBoundingClientRect();
                const mainSize = horizontalRef.current ? rect.width : rect.height;

                const previous = sizeCache.current.get(key);
                const sizeChanged = previous === undefined || Math.abs(previous - mainSize) > 0.5;
                if (sizeChanged) {
                    sizeCache.current.set(key, mainSize);
                    setVersion((v) => v + 1);
                }

                return () => {
                    observer.unobserve(node);
                    elementKeys.current.delete(node);
                };
            };

            measureRefs.current.set(key, callback);
            return callback;
        },
        [getObserver],
    );

    const offsets = useMemo(() => {
        const fallbackSize = count > 0 ? (sizeCache.current.get(getKey(0)) ?? 0) : 0;

        const result: number[] = [0];
        for (let i = 0; i < count; i++) {
            const size = sizeCache.current.get(getKey(i)) ?? fallbackSize;
            const trailingGap = i < count - 1 ? gap : 0;
            result.push(result[i] + size + trailingGap);
        }
        return result;
        // `version` bumps whenever a measured size changes; offsets must be rebuilt then.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, getKey, gap, version]);

    const totalSize = offsets[count] ?? 0;

    const range = useMemo(() => {
        if (count === 0) {
            return { startIndex: 0, endIndex: -1 };
        }

        const { start, end } = findVisibleRange(offsets, count, scrollOffset, scrollOffset + viewportSize);
        const clampedOverscan = Math.min(Math.max(overscan, 0), count);

        return {
            startIndex: Math.max(0, start - clampedOverscan),
            endIndex: Math.min(count - 1, end + clampedOverscan),
        };
    }, [count, scrollOffset, viewportSize, offsets, overscan]);

    const virtualItems = useMemo(() => {
        const items: VirtualItem<T>[] = [];
        for (let i = range.startIndex; i <= range.endIndex; i++) {
            items.push({
                index: i,
                key: getKey(i),
                data: data[i],
            });
        }
        return items;
    }, [range, getKey, data]);

    const topSpacerSize = useMemo(
        () => (count > 0 && range.startIndex > 0 ? offsets[range.startIndex] : 0),
        [count, range.startIndex, offsets],
    );

    const bottomSpacerSize = useMemo(
        () => (count > 0 ? totalSize - offsets[range.endIndex + 1] : 0),
        [count, totalSize, range.endIndex, offsets],
    );

    return { virtualItems, topSpacerSize, bottomSpacerSize, measureRef };
};

export default useVirtualizer;
