import { useCallback, useLayoutEffect, useRef } from 'react';

import { isResizeObserverAvailable } from '../../utils';

const isSameSet = (observed: HTMLElement[], elements: HTMLElement[]) =>
    observed.length === elements.length && observed.every((el, index) => el === elements[index]);

/*
 * One observer for the group, kept pointed at whatever the panels currently render.
 * The set is compared by element identity: swapping one panel for another leaves the
 * count alone, so anything coarser goes on watching the element that left. Reports
 * whether the elements ended up covered.
 */
const usePanelObserver = (onResize: () => void) => {
    const observerRef = useRef<ResizeObserver | null>(null);
    const observedRef = useRef<HTMLElement[]>([]);
    const onResizeRef = useRef(onResize);

    onResizeRef.current = onResize;

    useLayoutEffect(() => {
        if (!isResizeObserverAvailable()) {
            return;
        }
        const observer = new ResizeObserver(() => onResizeRef.current());

        observerRef.current = observer;

        return () => {
            observer.disconnect();
            observerRef.current = null;
            observedRef.current = [];
        };
    }, []);

    return useCallback((elements: HTMLElement[]) => {
        const observer = observerRef.current;

        if (!observer) {
            return false;
        }
        if (!isSameSet(observedRef.current, elements)) {
            observer.disconnect();
            elements.forEach((el) => observer.observe(el));
            observedRef.current = elements;
        }
        return true;
    }, []);
};

export default usePanelObserver;
