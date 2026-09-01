import type { PanelConstraint, PanelDirection } from './types';

// Large enough that a panel only reaches it when nothing caps its size.
const PROBE_BASIS = 1e6;

export interface PanelFlex {
    grow: string;
    shrink: string;
    basis: string;
}

const CLEARED: PanelFlex = { grow: '', shrink: '', basis: '' };
const MIN_PROBE: PanelFlex = { grow: '0', shrink: '0', basis: '0px' };
const MAX_PROBE: PanelFlex = { grow: '0', shrink: '0', basis: `${PROBE_BASIS}px` };

const readFlex = (el: HTMLElement): PanelFlex => ({
    grow: el.style.flexGrow,
    shrink: el.style.flexShrink,
    basis: el.style.flexBasis,
});

const writeFlex = (el: HTMLElement, { grow, shrink, basis }: PanelFlex) => {
    el.style.flexGrow = grow;
    el.style.flexShrink = shrink;
    el.style.flexBasis = basis;
};

const isSameFlex = (a: PanelFlex, b: PanelFlex) =>
    a.grow === b.grow && a.shrink === b.shrink && a.basis === b.basis;

const measure = (el: HTMLElement, direction: PanelDirection) => {
    const rect = el.getBoundingClientRect();
    return direction === 'horizontal' ? rect.width : rect.height;
};

/*
 * Measures every panel under `flex` in one layout pass, then puts the previous
 * inline flex back. Nothing paints until the task ends, so the probe is invisible.
 *
 * Disabling shrink is what makes the readings meaningful: at a zero basis a panel
 * settles on whatever its min-width forces, and at a huge basis it is free to
 * overflow the container so the reading isolates its own max-width.
 */
const probe = (elements: HTMLElement[], direction: PanelDirection, flex: PanelFlex): number[] => {
    const saved = elements.map(readFlex);

    elements.forEach((el) => writeFlex(el, flex));
    const sizes = elements.map((el) => measure(el, direction));
    elements.forEach((el, index) => writeFlex(el, saved[index]));

    return sizes;
};

export const getPanelSizes = (elements: HTMLElement[], direction: PanelDirection) =>
    elements.map((el) => measure(el, direction));

export const getPanelMinSizes = (elements: HTMLElement[], direction: PanelDirection) =>
    probe(elements, direction, MIN_PROBE);

export const getPanelMaxSizes = (elements: HTMLElement[], direction: PanelDirection) =>
    probe(elements, direction, MAX_PROBE).map((size) =>
        size >= PROBE_BASIS ? Number.POSITIVE_INFINITY : size,
    );

export const getPanelConstraints = (
    elements: HTMLElement[],
    direction: PanelDirection,
): PanelConstraint[] => {
    const sizes = getPanelSizes(elements, direction);
    const mins = getPanelMinSizes(elements, direction);
    const maxes = getPanelMaxSizes(elements, direction);

    return elements.map((_, index) => ({
        size: sizes[index],
        min: mins[index],
        max: maxes[index],
    }));
};

// Freezing the panels at pixel sizes stops the flex algorithm redistributing
// whatever a drag writes.
export const pinPanelSizes = (elements: HTMLElement[], direction: PanelDirection) => {
    const sizes = getPanelSizes(elements, direction);
    elements.forEach((el, index) =>
        writeFlex(el, { grow: '0', shrink: '0', basis: `${sizes[index]}px` }),
    );
    return sizes;
};

export const setPanelSizes = (elements: HTMLElement[], sizes: number[]) => {
    elements.forEach((el, index) => {
        el.style.flexBasis = `${sizes[index]}px`;
    });
};

/*
 * A finished layout is held as proportional growth, so the browser keeps applying the
 * CSS constraints from here on. Reports whether anything was written: a pointless write
 * would dirty layout and turn the next measurement into a forced reflow.
 */
export const setPanelGrowth = (elements: HTMLElement[], percentages: number[]) =>
    elements.reduce((wrote, el, index) => {
        const flex = { grow: `${percentages[index]}`, shrink: '1', basis: '0px' };

        if (isSameFlex(readFlex(el), flex)) {
            return wrote;
        }
        writeFlex(el, flex);
        return true;
    }, false);

export const readPanelFlex = (elements: HTMLElement[]): PanelFlex[] => elements.map(readFlex);

// React never re-applies a style value it did not see change, so a reset has to put
// the author's own inline flex back rather than clearing what the group wrote over it.
export const restorePanelFlex = (elements: HTMLElement[], saved: PanelFlex[] | null) => {
    elements.forEach((el, index) => writeFlex(el, saved?.[index] ?? CLEARED));
};
