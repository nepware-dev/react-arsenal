import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import PanelGroup, { Panel } from '../../components/ResizablePanel';
import type { PanelConstraint } from '../../components/ResizablePanel/types';

// jsdom has no layout engine, so the one module that reads it is replaced. Every
// calculation above it stays real, and the pure math is covered in
// resizablePanelLayout.test.ts.
vi.mock('../../components/ResizablePanel/measure', () => ({
    getPanelSizes: vi.fn(),
    getPanelMinSizes: vi.fn(),
    getPanelMaxSizes: vi.fn(),
    getPanelConstraints: vi.fn(),
    pinPanelSizes: vi.fn(),
    setPanelSizes: vi.fn(),
    setPanelGrowth: vi.fn(),
    readPanelFlex: vi.fn(),
    restorePanelFlex: vi.fn(),
}));

const measure = await import('../../components/ResizablePanel/measure');

const constraintsOf = (sizes: number[], min = 0): PanelConstraint[] =>
    sizes.map((size) => ({ size, min, max: Number.POSITIVE_INFINITY }));

// Panels start at 400px each.
const stubLayout = (sizes: number[], min = 0) => {
    vi.mocked(measure.getPanelSizes).mockReturnValue(sizes);
    vi.mocked(measure.getPanelConstraints).mockReturnValue(constraintsOf(sizes, min));
    vi.mocked(measure.readPanelFlex).mockReturnValue(authorFlex);
};

// The inline flex the panels carry before the group writes over it.
const authorFlex = [
    { grow: '', shrink: '', basis: '300px' },
    { grow: '', shrink: '', basis: '' },
];

const renderGroup = (props = {}, count = 2) =>
    render(
        <PanelGroup {...props}>
            {Array.from({ length: count }, (_, index) => (
                <Panel key={index}>Panel {index}</Panel>
            ))}
        </PanelGroup>,
    );

describe('PanelGroup', () => {
    beforeAll(() => {
        HTMLElement.prototype.setPointerCapture = vi.fn();
        HTMLElement.prototype.releasePointerCapture = vi.fn();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        stubLayout([400, 400]);
    });

    describe('Basic rendering', () => {
        it('renders the panels it is given', () => {
            renderGroup({}, 3);

            expect(screen.getByText('Panel 0')).toBeInTheDocument();
            expect(screen.getByText('Panel 2')).toBeInTheDocument();
        });

        it('renders one resizer between each pair of panels', () => {
            stubLayout([400, 400, 400]);
            renderGroup({}, 3);

            expect(screen.getAllByRole('separator')).toHaveLength(2);
        });

        it('looks inside fragments for panels', () => {
            stubLayout([400, 400]);
            render(
                <PanelGroup>
                    <>
                        <Panel>Panel 0</Panel>
                        <Panel>Panel 1</Panel>
                    </>
                </PanelGroup>,
            );

            expect(screen.getAllByRole('separator')).toHaveLength(1);
            expect(screen.getByText('Panel 0').id).not.toBe(screen.getByText('Panel 1').id);
        });

        it('renders no resizer for a single panel', () => {
            stubLayout([400]);
            renderGroup({}, 1);

            expect(screen.queryByRole('separator')).not.toBeInTheDocument();
        });

        it('leaves panel sizing to css until a resize happens', () => {
            const { container } = renderGroup();
            const panel = container.querySelector('[id$="-panel-0"]') as HTMLElement;

            expect(panel.style.flex).toBe('');
        });

        it('throws when a panel is rendered outside a group', () => {
            vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => render(<Panel>Orphan</Panel>)).toThrow(
                'Panel must be rendered inside a PanelGroup',
            );
        });
    });

    describe('Accessibility', () => {
        it('orients the separator across the group axis', () => {
            const { unmount } = renderGroup({ direction: 'horizontal' });
            expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');

            unmount();

            renderGroup({ direction: 'vertical' });
            expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
        });

        it('reports the measured size of the panel it controls', () => {
            stubLayout([250, 750]);
            renderGroup();

            const separator = screen.getByRole('separator');
            expect(separator).toHaveAttribute('aria-valuenow', '25');
            expect(separator).toHaveAttribute('aria-valuemin', '0');
            expect(separator).toHaveAttribute('aria-valuemax', '100');
            expect(separator).toHaveAttribute('aria-controls', expect.stringContaining('panel-0'));
        });

        // CSS minimums and maximums clamp the growth a layout asks for, so the number
        // a panel renders at is the only one worth announcing.
        it('reports the size the panel renders at, not the one requested', () => {
            stubLayout([400, 400]);
            renderGroup({ layout: [30, 70] });

            expect(screen.getByRole('separator')).toHaveAttribute('aria-valuenow', '50');
        });

        it('names the separator', () => {
            renderGroup();

            expect(screen.getByRole('separator')).toHaveAccessibleName('Resize panel');
        });

        it('is focusable', () => {
            renderGroup();

            expect(screen.getByRole('separator')).toHaveAttribute('tabindex', '0');
        });
    });

    describe('Pointer resizing', () => {
        const drag = (separator: HTMLElement, from: number, to: number, resultingSizes?: number[]) => {
            fireEvent.pointerDown(separator, { button: 0, clientX: from, clientY: from });
            fireEvent.pointerMove(separator, { clientX: to, clientY: to });

            if (resultingSizes) {
                vi.mocked(measure.getPanelSizes).mockReturnValue(resultingSizes);
            }
            fireEvent.pointerUp(separator);
        };

        it('pins the panels before dragging and writes sizes as the pointer moves', () => {
            renderGroup();

            drag(screen.getByRole('separator'), 400, 500);

            expect(measure.pinPanelSizes).toHaveBeenCalled();
            expect(measure.setPanelSizes).toHaveBeenCalledWith(expect.anything(), [500, 300]);
        });

        it('reports the new layout as percentages once the drag ends', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout });

            drag(screen.getByRole('separator'), 400, 500, [500, 300]);

            expect(onLayout).toHaveBeenCalledWith([62.5, 37.5]);
        });

        it('holds the finished layout as proportional growth', () => {
            renderGroup();

            drag(screen.getByRole('separator'), 400, 500, [500, 300]);

            expect(measure.setPanelGrowth).toHaveBeenCalledWith(expect.anything(), [62.5, 37.5]);
        });

        it('honours the minimum resolved from css', () => {
            stubLayout([400, 400], 350);
            renderGroup();

            drag(screen.getByRole('separator'), 400, 900);

            expect(measure.setPanelSizes).toHaveBeenCalledWith(expect.anything(), [450, 350]);
        });

        it('follows the vertical axis in a vertical group', () => {
            renderGroup({ direction: 'vertical' });
            const separator = screen.getByRole('separator');

            fireEvent.pointerDown(separator, { button: 0, clientX: 0, clientY: 400 });
            fireEvent.pointerMove(separator, { clientX: 999, clientY: 300 });

            expect(measure.setPanelSizes).toHaveBeenCalledWith(expect.anything(), [300, 500]);
        });

        it('does not commit a layout when a click never moves the pointer', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout });
            const separator = screen.getByRole('separator');

            fireEvent.pointerDown(separator, { button: 0, clientX: 400, clientY: 400 });
            fireEvent.pointerUp(separator);

            expect(onLayout).not.toHaveBeenCalled();
            expect(measure.restorePanelFlex).toHaveBeenCalled();
            expect(measure.setPanelGrowth).not.toHaveBeenCalled();
        });

        it('does not commit a layout when no size could change', () => {
            const onLayout = vi.fn();
            stubLayout([400, 400], 400);
            renderGroup({ onLayout });

            drag(screen.getByRole('separator'), 400, 900);

            expect(onLayout).not.toHaveBeenCalled();
            expect(measure.restorePanelFlex).toHaveBeenCalled();
        });

        it('ignores non-primary buttons', () => {
            renderGroup();
            const separator = screen.getByRole('separator');

            fireEvent.pointerDown(separator, { button: 2, clientX: 400 });
            fireEvent.pointerMove(separator, { clientX: 500 });

            expect(measure.setPanelSizes).not.toHaveBeenCalled();
        });

        it('ignores a pointer move that is not part of a drag', () => {
            renderGroup();

            fireEvent.pointerMove(screen.getByRole('separator'), { clientX: 500 });

            expect(measure.setPanelSizes).not.toHaveBeenCalled();
        });

        it('keeps the drag on the pointer that opened it', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout });
            const separator = screen.getByRole('separator');

            fireEvent.pointerDown(separator, { button: 0, pointerId: 1, clientX: 400, clientY: 400 });
            fireEvent.pointerDown(separator, { button: 0, pointerId: 2, clientX: 100, clientY: 100 });
            fireEvent.pointerMove(separator, { pointerId: 2, clientX: 500, clientY: 500 });
            fireEvent.pointerUp(separator, { pointerId: 2 });

            expect(measure.pinPanelSizes).toHaveBeenCalledTimes(1);
            expect(measure.setPanelSizes).not.toHaveBeenCalled();
            expect(onLayout).not.toHaveBeenCalled();

            fireEvent.pointerMove(separator, { pointerId: 1, clientX: 500, clientY: 500 });

            expect(measure.setPanelSizes).toHaveBeenCalledWith(expect.anything(), [500, 300]);
        });

        // Nothing else closes the session, and an open one suspends the layout sync.
        it('releases a drag whose resizer is removed before the pointer is', () => {
            const Group = ({ count, layout }: { count: number; layout: number[] }) => (
                <PanelGroup layout={layout}>
                    {Array.from({ length: count }, (_, index) => (
                        <Panel key={index}>Panel {index}</Panel>
                    ))}
                </PanelGroup>
            );

            stubLayout([300, 300, 300]);
            const { rerender } = render(<Group count={3} layout={[20, 30, 50]} />);
            const separator = screen.getAllByRole('separator')[1];

            fireEvent.pointerDown(separator, { button: 0, clientX: 400, clientY: 400 });
            fireEvent.pointerMove(separator, { clientX: 500, clientY: 500 });

            vi.clearAllMocks();
            stubLayout([400, 400]);
            rerender(<Group count={2} layout={[40, 60]} />);

            expect(measure.restorePanelFlex).toHaveBeenCalled();
            expect(measure.setPanelGrowth).toHaveBeenCalledWith(expect.anything(), [40, 60]);
        });
    });

    describe('Keyboard resizing', () => {
        it('moves by the keyboard step', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout, keyboardStep: 10 });

            fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });

            // 10% of 800px moves 80px, so 480/320 of the total.
            expect(onLayout).toHaveBeenCalledWith([60, 40]);
        });

        it('moves the other way on the opposite arrow', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout });

            fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowLeft' });

            expect(onLayout).toHaveBeenCalledWith([40, 60]);
        });

        it('uses the vertical arrows in a vertical group', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout, direction: 'vertical' });
            const separator = screen.getByRole('separator');

            fireEvent.keyDown(separator, { key: 'ArrowRight' });
            expect(onLayout).not.toHaveBeenCalled();

            fireEvent.keyDown(separator, { key: 'ArrowDown' });
            expect(onLayout).toHaveBeenCalledWith([60, 40]);
        });

        it('moves as far as the constraints allow on home and end', () => {
            const onLayout = vi.fn();
            stubLayout([400, 400], 200);
            renderGroup({ onLayout });

            fireEvent.keyDown(screen.getByRole('separator'), { key: 'End' });

            expect(onLayout).toHaveBeenCalledWith([75, 25]);
        });

        it('ignores unrelated keys', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout });

            fireEvent.keyDown(screen.getByRole('separator'), { key: 'a' });

            expect(onLayout).not.toHaveBeenCalled();
        });
    });

    describe('Controlled layout', () => {
        const drag = (separator: HTMLElement, from: number, to: number, resultingSizes: number[]) => {
            fireEvent.pointerDown(separator, { button: 0, clientX: from, clientY: from });
            fireEvent.pointerMove(separator, { clientX: to, clientY: to });
            vi.mocked(measure.getPanelSizes).mockReturnValue(resultingSizes);
            fireEvent.pointerUp(separator);
        };

        it('applies the layout it is given', () => {
            renderGroup({ layout: [30, 70] });

            expect(measure.setPanelGrowth).toHaveBeenCalledWith(expect.anything(), [30, 70]);
        });

        it('does not change the applied layout on its own', () => {
            const onLayout = vi.fn();
            renderGroup({ layout: [30, 70], onLayout });

            fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });

            expect(onLayout).toHaveBeenCalledWith([60, 40]);
            expect(measure.setPanelGrowth).toHaveBeenLastCalledWith(expect.anything(), [30, 70]);
        });

        it('puts the panels back when a drag is not accepted', () => {
            renderGroup({ layout: [30, 70] });

            drag(screen.getByRole('separator'), 400, 500, [500, 300]);

            expect(measure.setPanelGrowth).toHaveBeenLastCalledWith(expect.anything(), [30, 70]);
        });

        it('puts the panels back when a reset is not accepted', () => {
            renderGroup({ layout: [30, 70] });
            vi.mocked(measure.setPanelGrowth).mockClear();

            fireEvent.doubleClick(screen.getByRole('separator'));

            expect(measure.restorePanelFlex).toHaveBeenCalled();
            expect(measure.setPanelGrowth).toHaveBeenLastCalledWith(expect.anything(), [30, 70]);
        });
    });

    describe('Reset', () => {
        it('drops the applied layout on double click so css takes over', () => {
            const onLayout = vi.fn();
            renderGroup({ onLayout });
            const separator = screen.getByRole('separator');

            fireEvent.keyDown(separator, { key: 'ArrowRight' });
            expect(measure.setPanelGrowth).toHaveBeenLastCalledWith(expect.anything(), [60, 40]);

            fireEvent.doubleClick(separator);

            expect(onLayout).toHaveBeenLastCalledWith(undefined);
        });

        /*
         * React never re-applies a style value it did not see change, so clearing the
         * flex the group wrote would take the author's own sizing with it.
         */
        it('gives back the inline sizing the panels started with', () => {
            renderGroup();
            const separator = screen.getByRole('separator');

            fireEvent.keyDown(separator, { key: 'ArrowRight' });
            fireEvent.doubleClick(separator);

            expect(measure.restorePanelFlex).toHaveBeenCalledWith(expect.anything(), authorFlex);
        });

        it('reads that sizing before anything is written over it', () => {
            renderGroup();

            fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight' });

            expect(measure.readPanelFlex).toHaveBeenCalledTimes(1);
            expect(vi.mocked(measure.readPanelFlex).mock.invocationCallOrder[0]).toBeLessThan(
                vi.mocked(measure.setPanelGrowth).mock.invocationCallOrder[0],
            );
        });
    });

    describe('Customization', () => {
        it('applies the resizer class', () => {
            renderGroup({ resizerClassName: 'custom-resizer' });

            expect(screen.getByRole('separator')).toHaveClass('custom-resizer');
        });

        it('renders custom resizer content', () => {
            renderGroup({
                renderResizer: ({ index }: { index: number }) => (
                    <span data-testid="grip">grip {index}</span>
                ),
            });

            expect(screen.getByTestId('grip')).toHaveTextContent('grip 0');
        });

        it('applies the group class', () => {
            const { container } = renderGroup({ className: 'custom-group' });

            expect(container.firstChild).toHaveClass('custom-group');
        });
    });
});
