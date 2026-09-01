import type { PanelConstraint } from './types';

// Sub-pixel movements are noise from pointer events and float arithmetic.
const PIXEL_EPSILON = 0.1;

// Fine enough that a one-pixel change still counts, coarse enough to swallow the
// float noise a measurement carries.
const PERCENTAGE_EPSILON = 0.01;

type Room = (constraint: PanelConstraint) => number;

const growRoom: Room = ({ size, max }) => Math.max(0, max - size);
const shrinkRoom: Room = ({ size, min }) => Math.max(0, size - min);

const totalRoom = (constraints: PanelConstraint[], indices: number[], room: Room) =>
    indices.reduce((total, index) => total + room(constraints[index]), 0);

// Nearest to the resizer first. Room is read from the untouched constraints, so a
// panel is only ever visited once.
const distribute = (
    sizes: number[],
    constraints: PanelConstraint[],
    indices: number[],
    amount: number,
    room: Room,
    sign: 1 | -1,
) => {
    let remaining = amount;

    indices.forEach((index) => {
        if (remaining <= 0) {
            return;
        }
        const step = Math.min(remaining, room(constraints[index]));
        sizes[index] += sign * step;
        remaining -= step;
    });
};

const indicesFrom = (start: number, end: number, step: 1 | -1) => {
    const indices: number[] = [];
    for (let index = start; step > 0 ? index <= end : index >= end; index += step) {
        indices.push(index);
    }
    return indices;
};

/**
 * Moves the resizer at `resizerIndex` by `deltaPx` and returns the new panel sizes.
 * The move cascades outward once the adjacent panel is exhausted, so a fixed panel
 * (min === max) slides along instead of blocking the drag. Pass +/-Infinity to move
 * as far as the constraints permit.
 */
export const resizeLayout = (
    constraints: PanelConstraint[],
    resizerIndex: number,
    deltaPx: number,
): number[] => {
    const sizes = constraints.map(({ size }) => size);

    if (resizerIndex < 0 || resizerIndex >= constraints.length - 1) {
        return sizes;
    }
    if (Number.isNaN(deltaPx) || Math.abs(deltaPx) < PIXEL_EPSILON) {
        return sizes;
    }

    const before = indicesFrom(resizerIndex, 0, -1);
    const after = indicesFrom(resizerIndex + 1, constraints.length - 1, 1);
    const [growing, shrinking] = deltaPx > 0 ? [before, after] : [after, before];

    const movement = Math.min(
        Math.abs(deltaPx),
        totalRoom(constraints, growing, growRoom),
        totalRoom(constraints, shrinking, shrinkRoom),
    );

    if (movement < PIXEL_EPSILON) {
        return sizes;
    }

    distribute(sizes, constraints, growing, movement, growRoom, 1);
    distribute(sizes, constraints, shrinking, movement, shrinkRoom, -1);

    return sizes;
};

export const isSameLayout = (previous: number[] | undefined, next: number[]) =>
    !!previous &&
    previous.length === next.length &&
    previous.every((value, index) => Math.abs(value - next[index]) < PERCENTAGE_EPSILON);

// Percentages rather than pixels, so the layout keeps responding to CSS as the
// container resizes.
export const toPercentages = (sizes: number[]): number[] => {
    const total = sizes.reduce((sum, size) => sum + size, 0);

    if (total <= 0) {
        return sizes.map(() => 100 / sizes.length);
    }
    return sizes.map((size) => (size / total) * 100);
};
