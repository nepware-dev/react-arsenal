import React, { type JSX } from 'react';

import type { KeyExtractor, ListProps, ListRenderItemProps } from '../List/types';

export type ItemKey = string | number;

/**
 * Spread onto whatever element should pick the item up. Only meaningful under
 * `dragHandle`; without it the whole item is already draggable.
 */
export interface DragHandleProps {
    onPointerDown: (event: React.PointerEvent) => void;
}

export type DraggableListRenderItemProps<T> = ListRenderItemProps<T> & {
    isDragging: boolean;
    isDraggable: boolean;
    dragHandleProps: DragHandleProps;
};

export type DraggableListRenderItem<T> = (
    props: DraggableListRenderItemProps<T>,
) => React.ReactNode;

/**
 * Every variant carries `data`, this list's next data as a new array, so
 * `({ data }) => setData(data)` is a complete handler for all of them.
 */
export type DraggableListChangeMeta<T> =
    /** Moved within this list, from `from` to `to`. */
    | { action: 'reorder'; data: T[]; item: T; from: number; to: number }
    /** Arrived from another list of the group, where it sat at `from`. */
    | { action: 'add'; data: T[]; item: T; from: number; to: number }
    /** Left this list for another of the group, from `from`. */
    | { action: 'remove'; data: T[]; item: T; from: number };

export interface DraggableListProps<T>
    extends Pick<
        ListProps<T>,
        'loading' | 'EmptyComponent' | 'LoadingComponent' | 'HeaderComponent' | 'FooterComponent'
    > {
    /**
     * A new array identity mid-drag cancels the in-flight preview, so hold this
     * in state rather than deriving it inline on every render.
     */
    data: T[];
    /**
     * Keys must be stable per item and independent of position: one derived from
     * the index (`(_, index) => index`) silently breaks reorder tracking.
     */
    keyExtractor: KeyExtractor<T>;
    renderItem: DraggableListRenderItem<T>;
    /**
     * Fired once per drop on each list the drop changed: 'reorder' for a move
     * inside this list, 'add' for an item arriving from another list of the
     * `group`, 'remove' for one of this list's items landing in another. A
     * cross-list drop fires the source's 'remove' immediately before the
     * receiver's 'add', so a consumer holding both lists in one state object
     * must use functional updates.
     */
    onChange: (meta: DraggableListChangeMeta<T>) => void;
    /**
     * Lists sharing a group accept each other's items. Their keys must come from
     * one scheme, unique across the group, and their items must be a shape every
     * list in the group can render: a list draws an arriving item with its own
     * `renderItem` and `classNameItem`, so the item takes on the destination's
     * look as soon as it is hovered.
     */
    group?: string;
    /** Layout (rows, columns, grid) is entirely up to the consumer's styles. */
    className?: string;
    classNameItem?: string;
    style?: React.CSSProperties;
    component?: keyof JSX.IntrinsicElements;
    disabled?: boolean;
    /**
     * Restricts dragging to the element `renderItem` spreads `dragHandleProps` on.
     * Set this wherever items carry text worth selecting: a browser makes a
     * `draggable` element's text unselectable.
     */
    dragHandle?: boolean;
    /**
     * Scrolls the nearest scrollable ancestor of this list, falling back to the
     * window, while a drag started here nears an edge. Off by default: Chrome and
     * Edge already auto-scroll during an HTML5 drag, and a second scroller on top
     * of the native one feels jumpy, so turn this on for the browsers or the
     * scroll containers the native behaviour does not cover.
     */
    autoScroll?: boolean;
    /**
     * Return false to make an item non-draggable and inert as a drag-over target
     * (e.g. section headers). Defaults to all items draggable.
     */
    isDraggableExtractor?: (item: T, index: number) => boolean;
    /**
     * Groups items into sections: a reorder only applies while hovering an item
     * whose section key equals the dragged item's, so items never cross section
     * boundaries. Omit for a single unconstrained list. Items arriving from
     * another list of a `group` are not constrained by it.
     */
    sectionExtractor?: (item: T, index: number) => string | number | null | undefined;
}

export type { KeyExtractor };
