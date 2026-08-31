import React from 'react';

import type { KeyExtractor } from '../List/types';
import type { DraggableListChangeMeta, ItemKey } from './types';

export const findIndexIn = <T,>(list: T[], key: ItemKey, keyExtractor: KeyExtractor<T>) =>
    list.findIndex((item, index) => keyExtractor(item, index) === key);

export const moveItem = <T,>(list: T[], from: number, to: number) => {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    return next;
};

/**
 * Which side of the target's centre the pointer is on, along whichever axis it
 * sits furthest from it, so rows, columns and grids all read correctly without
 * the list being told its own direction. Null when there is no box to measure.
 */
export const isPastTargetMidpoint = (rect: DOMRect, clientX: number, clientY: number) => {
    if (!rect.width || !rect.height) {
        return null;
    }
    const offsetX = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const offsetY = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
        return null;
    }

    return Math.abs(offsetX) > Math.abs(offsetY) ? offsetX > 0 : offsetY > 0;
};

/** Anything with viewport edges: an element's box, or the viewport itself. */
export type EdgeRect = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>;

export interface EdgeScrollPolicy {
    /** How deep the edge zones reach into the box, in pixels. */
    threshold: number;
    /** Speed at the edge itself, in pixels per frame. */
    maxSpeed: number;
}

const axisEdgeVelocity = (
    position: number,
    start: number,
    end: number,
    { threshold, maxSpeed }: EdgeScrollPolicy,
) => {
    const size = end - start;
    if (size <= 0 || position < start || position > end) {
        return 0;
    }
    // Halved on a short axis, or the two zones would overlap and the near one always win.
    const zone = Math.min(threshold, size / 2);
    if (zone <= 0) {
        return 0;
    }
    if (position < start + zone) {
        return -maxSpeed * ((start + zone - position) / zone);
    }
    if (position > end - zone) {
        return maxSpeed * ((position - (end - zone)) / zone);
    }

    return 0;
};

/**
 * Scroll speed in pixels per frame for a pointer near the edges of `rect`, each
 * axis on its own: zero in the middle and once the pointer leaves the box,
 * ramping linearly from zero at the edge of a zone to `maxSpeed` at the edge itself.
 */
export const edgeScrollVelocity = (
    rect: EdgeRect,
    clientX: number,
    clientY: number,
    policy: EdgeScrollPolicy,
) => ({
    x: axisEdgeVelocity(clientX, rect.left, rect.right, policy),
    y: axisEdgeVelocity(clientY, rect.top, rect.bottom, policy),
});

export interface ReorderPolicy<T> {
    keyExtractor: KeyExtractor<T>;
    isDraggable: (item: T, index: number) => boolean;
    sectionExtractor?: (item: T, index: number) => string | number | null | undefined;
    isPastMidpoint: boolean | null;
}

/** The next order, or null when the move is one this list will not make. */
export const resolveReorder = <T,>(
    order: T[],
    movingKey: ItemKey,
    targetKey: ItemKey,
    policy: ReorderPolicy<T>,
): T[] | null => {
    const { keyExtractor, isDraggable, sectionExtractor, isPastMidpoint } = policy;

    const from = findIndexIn(order, movingKey, keyExtractor);
    const to = findIndexIn(order, targetKey, keyExtractor);

    if (from === -1 || to === -1 || from === to) {
        return null;
    }
    if (!isDraggable(order[to], to)) {
        return null;
    }
    if (
        sectionExtractor &&
        sectionExtractor(order[from], from) !== sectionExtractor(order[to], to)
    ) {
        return null;
    }
    // Midpoint rule: only move past the target's centre in the direction of
    // travel, or the two items trade places forever.
    const isMovingForward = from < to;
    if (isPastMidpoint !== null && isPastMidpoint !== isMovingForward) {
        return null;
    }

    return moveItem(order, from, to);
};

export type HostResult<T> =
    | { accepted: false }
    /** A null order means the item already sits where it belongs. */
    | { accepted: true; order: T[] | null };

/**
 * Where another list's item lands in this one: at `targetKey`'s position, or at the end
 * for a null key, which leaves an item this list already holds where it is.
 * Rejected when the hovered target is inert.
 */
export const resolveHostedOrder = <T,>(
    order: T[],
    item: T,
    itemKey: ItemKey,
    targetKey: ItemKey | null,
    policy: Pick<ReorderPolicy<T>, 'keyExtractor' | 'isDraggable'>,
): HostResult<T> => {
    const { keyExtractor, isDraggable } = policy;

    const currentIndex = findIndexIn(order, itemKey, keyExtractor);
    if (targetKey === null && currentIndex !== -1) {
        return { accepted: true, order: null };
    }

    const toIndex = targetKey === null ? order.length : findIndexIn(order, targetKey, keyExtractor);
    if (toIndex === -1) {
        return { accepted: false };
    }
    if (toIndex < order.length && !isDraggable(order[toIndex], toIndex)) {
        return { accepted: false };
    }
    if (currentIndex === toIndex) {
        return { accepted: true, order: null };
    }
    if (currentIndex === -1) {
        const next = [...order];
        next.splice(toIndex, 0, item);

        return { accepted: true, order: next };
    }

    return { accepted: true, order: moveItem(order, currentIndex, toIndex) };
};

type RemoveChange<T> = Extract<DraggableListChangeMeta<T>, { action: 'remove' }>;

/** What to tell the consumer, or null when the drop changed nothing. */
export const buildRemoveChange = <T,>(
    data: T[],
    key: ItemKey,
    keyExtractor: KeyExtractor<T>,
): RemoveChange<T> | null => {
    const from = findIndexIn(data, key, keyExtractor);
    if (from === -1) {
        return null;
    }

    return {
        action: 'remove',
        data: data.filter((_, index) => index !== from),
        item: data[from],
        from,
    };
};

/** The origin is a fact about the committed data, the destination about the preview. */
export const buildReorderChange = <T,>(
    data: T[],
    order: T[],
    key: ItemKey,
    keyExtractor: KeyExtractor<T>,
): DraggableListChangeMeta<T> | null => {
    const from = findIndexIn(data, key, keyExtractor);
    const to = findIndexIn(order, key, keyExtractor);

    if (from === -1 || to === -1 || from === to) {
        return null;
    }

    return { action: 'reorder', data: order, item: order[to], from, to };
};

export const buildAddChange = <T,>(
    order: T[],
    to: number,
    from: number,
): DraggableListChangeMeta<T> => ({
    action: 'add',
    data: order,
    item: order[to],
    from,
    to,
});

export const allowDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
};
