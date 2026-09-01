import { createContext, useContext } from 'react';

import type { PanelDirection, RenderPanelResizer } from './types';

export interface PanelGroupContextType {
    /** Axis the group lays its panels out along. */
    direction: PanelDirection;
    /**
     * Percentages the panels actually render at, measured rather than requested, so
     * there is always something accurate to report to assistive technology.
     */
    reported?: number[];
    /** Index of the resizer being dragged, or null when idle. */
    resizingIndex: number | null;
    /** Class the group applies to every resizer. */
    resizerClassName?: string;
    /** Custom content the group renders inside each resizer. */
    renderResizer?: RenderPanelResizer;
    /** Id of the panel at `index`, for the resizer's `aria-controls`. */
    getPanelId: (index: number) => string;
    /** Called by a panel to hand the group its element, and null on unmount. */
    registerPanel: (index: number, el: HTMLElement | null) => void;
    /** Begins a drag on the resizer at `index`, owned by the pointer that opened it. */
    startResize: (index: number, pointerId: number, clientX: number, clientY: number) => void;
    /** Sizes the panels to the pointer, without committing the layout. */
    moveResize: (pointerId: number, clientX: number, clientY: number) => void;
    /** Ends the drag and commits the sizes it left behind. */
    endResize: (pointerId: number) => void;
    /** Ends the drag and gives the panels back the sizing they had before it. */
    cancelResize: () => void;
    /**
     * Moves a resizer by `steps` multiples of the keyboard step.
     * Infinite steps move as far as the constraints permit.
     */
    nudge: (index: number, steps: number) => void;
    /** Drops the applied layout so the panels fall back to their CSS sizes. */
    reset: () => void;
}

const PanelGroupContext = createContext<PanelGroupContextType | null>(null);

export const usePanelGroupContext = () => {
    const context = useContext(PanelGroupContext);

    if (!context) {
        throw new Error('Panel must be rendered inside a PanelGroup');
    }
    return context;
};

// Provided per child so panels stay plain elements the consumer composes freely,
// without cloning private props into them.
export const PanelIndexContext = createContext(0);

export default PanelGroupContext;
