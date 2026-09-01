import { useCallback, useRef, useState } from 'react';

import type { PanelConstraint, PanelDirection } from './types';
import { resizeLayout } from './layout';
import {
    getPanelConstraints,
    getPanelSizes,
    type PanelFlex,
    pinPanelSizes,
    readPanelFlex,
    restorePanelFlex,
    setPanelSizes,
} from './measure';

interface DragSession {
    // Without this a second touch takes the drag over, and either finger commits it.
    pointerId: number;
    resizerIndex: number;
    origin: number;
    elements: HTMLElement[];
    constraints: PanelConstraint[];
    startFlex: PanelFlex[];
    moved: boolean;
}

interface DragSessionOptions {
    direction: PanelDirection;
    /** The panels to resize, or null while the group cannot account for all of them. */
    getElements: () => HTMLElement[] | null;
    /** Handed the panels a drag is about to pin, before their flex is written over. */
    onStart: (elements: HTMLElement[]) => void;
    onCommit: (pixelSizes: number[]) => void;
}

/**
 * One resize session at a time, owned by the pointer that opened it, ending either in
 * a committed layout or in the sizing the panels had before it started.
 */
const useDragSession = ({ direction, getElements, onStart, onCommit }: DragSessionOptions) => {
    const sessionRef = useRef<DragSession | null>(null);
    const [resizingIndex, setResizingIndex] = useState<number | null>(null);

    const close = useCallback(() => {
        sessionRef.current = null;
        setResizingIndex(null);
    }, []);

    const startResize = useCallback(
        (resizerIndex: number, pointerId: number, clientX: number, clientY: number) => {
            const elements = getElements();

            if (sessionRef.current || !elements || elements.length < 2) {
                return;
            }
            onStart(elements);

            const constraints = getPanelConstraints(elements, direction);
            const startFlex = readPanelFlex(elements);

            pinPanelSizes(elements, direction);

            sessionRef.current = {
                pointerId,
                resizerIndex,
                origin: direction === 'horizontal' ? clientX : clientY,
                elements,
                constraints,
                startFlex,
                moved: false,
            };
            setResizingIndex(resizerIndex);
        },
        [direction, getElements, onStart],
    );

    const moveResize = useCallback(
        (pointerId: number, clientX: number, clientY: number) => {
            const session = sessionRef.current;

            if (!session || session.pointerId !== pointerId) {
                return;
            }
            const position = direction === 'horizontal' ? clientX : clientY;
            // Measured against pointer down rather than the previous move, so the
            // drag never accumulates drift.
            const nextSizes = resizeLayout(
                session.constraints,
                session.resizerIndex,
                position - session.origin,
            );

            if (!session.moved) {
                session.moved = nextSizes.some(
                    (size, index) => size !== session.constraints[index].size,
                );
            }
            setPanelSizes(session.elements, nextSizes);
        },
        [direction],
    );

    const cancelResize = useCallback(() => {
        const session = sessionRef.current;

        if (!session) {
            return;
        }
        close();
        restorePanelFlex(session.elements, session.startFlex);
    }, [close]);

    const endResize = useCallback(
        (pointerId: number) => {
            const session = sessionRef.current;

            if (!session || session.pointerId !== pointerId) {
                return;
            }
            close();

            // A click that only focused the separator must not turn CSS sizing into a layout.
            if (!session.moved) {
                restorePanelFlex(session.elements, session.startFlex);
                return;
            }
            onCommit(getPanelSizes(session.elements, direction));
        },
        [close, direction, onCommit],
    );

    return { resizingIndex, startResize, moveResize, endResize, cancelResize };
};

export default useDragSession;
