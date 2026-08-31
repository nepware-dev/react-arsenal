import React, { useEffect, useRef } from 'react';

import { edgeScrollVelocity, type EdgeScrollPolicy } from './utils';

const scrollPolicy: EdgeScrollPolicy = { threshold: 48, maxSpeed: 16 };

type Pointer = { x: number; y: number };
type Axes = { x: boolean; y: boolean };

const neitherAxis: Axes = { x: false, y: false };

const isScrollable = (element: HTMLElement) => {
    const { overflowX, overflowY } = window.getComputedStyle(element);
    const scrolls = (overflow: string) => overflow === 'auto' || overflow === 'scroll';

    return (
        (scrolls(overflowY) && element.scrollHeight > element.clientHeight) ||
        (scrolls(overflowX) && element.scrollWidth > element.clientWidth)
    );
};

const findScrollableAncestor = (element: HTMLElement | null) => {
    for (let parent = element?.parentElement; parent; parent = parent.parentElement) {
        if (isScrollable(parent)) {
            return parent;
        }
    }

    return null;
};

/** The axes the element actually moved on, so an axis at its limit reads as false. */
const scrollElementBy = (element: HTMLElement, pointer: Pointer): Axes => {
    const velocity = edgeScrollVelocity(
        element.getBoundingClientRect(),
        pointer.x,
        pointer.y,
        scrollPolicy,
    );
    if (!velocity.x && !velocity.y) {
        return neitherAxis;
    }
    const { scrollLeft, scrollTop } = element;
    element.scrollBy(velocity.x, velocity.y);

    return {
        x: velocity.x !== 0 && element.scrollLeft !== scrollLeft,
        y: velocity.y !== 0 && element.scrollTop !== scrollTop,
    };
};

const scrollWindowBy = (pointer: Pointer, scrolled: Axes) => {
    const viewport = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    const velocity = edgeScrollVelocity(viewport, pointer.x, pointer.y, scrollPolicy);
    const x = scrolled.x ? 0 : velocity.x;
    const y = scrolled.y ? 0 : velocity.y;

    if (x || y) {
        window.scrollBy(x, y);
    }
};

interface DragAutoScrollOptions {
    containerRef: React.RefObject<HTMLElement | null>;
    enabled: boolean;
    active: boolean;
}

/**
 * Scrolls the nearest scrollable ancestor of the list while the pointer of an
 * active drag nears an edge, and the window on whichever axis that one cannot
 * take any further.
 */
const useDragAutoScroll = ({ containerRef, enabled, active }: DragAutoScrollOptions) => {
    const pointerRef = useRef<Pointer | null>(null);

    useEffect(() => {
        if (!enabled || !active) {
            return;
        }
        const scrollable = findScrollableAncestor(containerRef.current);
        let frame = 0;

        // A stationary pointer still fires dragover, but only every 350ms or so, far
        // too choppy to scroll with, so the frames apply what the events sample.
        const trackPointer = (event: DragEvent) => {
            pointerRef.current = { x: event.clientX, y: event.clientY };
        };

        const scrollTowardPointer = () => {
            frame = requestAnimationFrame(scrollTowardPointer);

            const pointer = pointerRef.current;
            if (!pointer) {
                return;
            }
            const scrolled = scrollable ? scrollElementBy(scrollable, pointer) : neitherAxis;
            scrollWindowBy(pointer, scrolled);
        };

        document.addEventListener('dragover', trackPointer);
        frame = requestAnimationFrame(scrollTowardPointer);

        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('dragover', trackPointer);
            pointerRef.current = null;
        };
    }, [enabled, active, containerRef]);
};

export default useDragAutoScroll;
