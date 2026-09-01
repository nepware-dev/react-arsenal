import { describe, it, expect } from 'vitest';

import { resizeLayout, toPercentages } from '../../components/ResizablePanel/layout';
import type { PanelConstraint } from '../../components/ResizablePanel/types';

const panel = (size: number, min = 0, max = Number.POSITIVE_INFINITY): PanelConstraint => ({
    size,
    min,
    max,
});

describe('resizeLayout', () => {
    describe('Basic resizing', () => {
        it('moves the delta from one panel to the other', () => {
            const constraints = [panel(400), panel(400)];

            expect(resizeLayout(constraints, 0, 100)).toEqual([500, 300]);
            expect(resizeLayout(constraints, 0, -100)).toEqual([300, 500]);
        });

        it('preserves the total size', () => {
            const constraints = [panel(200), panel(300), panel(500)];
            const total = (sizes: number[]) => sizes.reduce((sum, size) => sum + size, 0);

            expect(total(resizeLayout(constraints, 1, 120))).toBe(1000);
            expect(total(resizeLayout(constraints, 0, -80))).toBe(1000);
        });

        it('is computed from the given sizes, so repeated calls do not drift', () => {
            const constraints = [panel(400), panel(400)];

            expect(resizeLayout(constraints, 0, 50)).toEqual(resizeLayout(constraints, 0, 50));
        });

        it('ignores sub-pixel deltas', () => {
            const constraints = [panel(400), panel(400)];

            expect(resizeLayout(constraints, 0, 0.05)).toEqual([400, 400]);
        });

        it('ignores an out of range resizer index', () => {
            const constraints = [panel(400), panel(400)];

            expect(resizeLayout(constraints, 1, 100)).toEqual([400, 400]);
            expect(resizeLayout(constraints, -1, 100)).toEqual([400, 400]);
        });
    });

    describe('Constraints', () => {
        it('clamps to the shrinking panel minimum', () => {
            const constraints = [panel(400), panel(400, 300)];

            expect(resizeLayout(constraints, 0, 250)).toEqual([500, 300]);
        });

        it('clamps to the growing panel maximum', () => {
            const constraints = [panel(400, 0, 450), panel(400)];

            expect(resizeLayout(constraints, 0, 250)).toEqual([450, 350]);
        });

        it('does nothing when neither side has room', () => {
            const constraints = [panel(400, 400, 400), panel(400)];

            expect(resizeLayout(constraints, 0, 100)).toEqual([400, 400]);
        });

        it('treats an already out of bounds panel as having no room', () => {
            const constraints = [panel(400), panel(200, 300)];

            expect(resizeLayout(constraints, 0, 100)).toEqual([400, 200]);
        });
    });

    describe('Cascading', () => {
        it('takes from the next panel out once the adjacent one is at its minimum', () => {
            const constraints = [panel(200), panel(200, 150), panel(200)];

            expect(resizeLayout(constraints, 0, 100)).toEqual([300, 150, 150]);
        });

        it('gives to the next panel out once the adjacent one is at its maximum', () => {
            const constraints = [panel(200), panel(200, 0, 250), panel(200)];

            expect(resizeLayout(constraints, 1, 100)).toEqual([250, 250, 100]);
        });

        it('slides a fixed panel without resizing it', () => {
            const fixed = panel(200, 200, 200);
            const constraints = [panel(200), fixed, panel(200)];

            expect(resizeLayout(constraints, 0, 100)).toEqual([300, 200, 100]);
        });
    });

    describe('Infinite deltas', () => {
        it('moves as far as the constraints allow', () => {
            const constraints = [panel(400, 100), panel(400, 150)];

            expect(resizeLayout(constraints, 0, Number.POSITIVE_INFINITY)).toEqual([650, 150]);
            expect(resizeLayout(constraints, 0, Number.NEGATIVE_INFINITY)).toEqual([100, 700]);
        });

        it('ignores a NaN delta', () => {
            const constraints = [panel(400), panel(400)];

            expect(resizeLayout(constraints, 0, Number.NaN)).toEqual([400, 400]);
        });
    });
});

describe('toPercentages', () => {
    it('normalizes sizes to percentages of their total', () => {
        expect(toPercentages([250, 250, 500])).toEqual([25, 25, 50]);
    });

    it('always sums to a hundred', () => {
        const percentages = toPercentages([137, 411, 92]);

        expect(percentages.reduce((sum, value) => sum + value, 0)).toBeCloseTo(100);
    });

    it('falls back to equal shares when nothing has a size', () => {
        expect(toPercentages([0, 0, 0, 0])).toEqual([25, 25, 25, 25]);
    });
});
