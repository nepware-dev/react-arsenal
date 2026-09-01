import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type PanelDirection = 'horizontal' | 'vertical';

/**
 * Pixel constraints of one panel along the group's axis, measured rather than
 * declared, so anything CSS can express (calc, clamp, %, intrinsic keywords) is
 * already accounted for.
 */
export interface PanelConstraint {
    /** Size the panel currently renders at. */
    size: number;
    /** Smallest size the panel's CSS allows. */
    min: number;
    /** Infinity when nothing in the panel's CSS caps it. */
    max: number;
}

/** The group owns each panel's `id` so a resizer can point `aria-controls` at it. */
export interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
    /**
     * Where a panel gets its size: `flex-basis` for the initial size, `min`/`max-width`
     * (`min`/`max-height` in a vertical group) for the limits a drag respects.
     */
    className?: string;
    /** Sizing set here is overridden by the flex value of a resized panel. */
    style?: HTMLAttributes<HTMLDivElement>['style'];
    /** Ref to the panel element. */
    ref?: Ref<HTMLDivElement>;
}

export interface RenderPanelResizerArg {
    index: number;
    direction: PanelDirection;
    isResizing: boolean;
}

export type RenderPanelResizer = (arg: RenderPanelResizerArg) => ReactNode;

export interface PanelGroupProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Axis the panels lay out along. Nest groups for mixed layouts.
     *
     * @default 'horizontal'
     */
    direction?: PanelDirection;
    /**
     * One `Panel` per child, fragments looked through. A child that renders no panel
     * leaves the group unable to tell which element owns which index, and it stops
     * resizing rather than move the wrong pair.
     */
    children?: ReactNode;
    /**
     * Controlled sizes, one percentage of the group per panel.
     * Leave undefined to let CSS size the panels. Ignored, rather than partly applied,
     * while its length does not match the number of panels.
     */
    layout?: number[];
    /**
     * Called with the percentages after a resize, or with nothing when a
     * double click resets the layout and CSS takes over again.
     */
    onLayout?: (layout?: number[]) => void;
    /** Class applied to the group container. */
    className?: string;
    /** Class applied to every resizer in the group. */
    resizerClassName?: string;
    /** Custom content rendered inside each resizer. */
    renderResizer?: RenderPanelResizer;
    /**
     * Percentage of the group one arrow key press moves a resizer.
     *
     * @default 10
     */
    keyboardStep?: number;
    /** Ref to the group container element. */
    ref?: Ref<HTMLDivElement>;
}
