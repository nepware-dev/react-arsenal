import React, { useEffect, useRef, useState } from 'react';

import type { DraggableListProps, ItemKey } from './types';
import type useDragGroup from './useDragGroup';
import {
    buildRemoveChange,
    buildReorderChange,
    isPastTargetMidpoint,
    resolveReorder,
} from './utils';
import type { KeyExtractor } from '../List/types';

type LatestProps<T> = Pick<DraggableListProps<T>, 'data' | 'keyExtractor' | 'onChange'>;

/** The last reorder decision, so an identical dragover is not acted on twice. */
type ReorderDecision = {
    draggedItemKey: ItemKey;
    targetItemKey: ItemKey;
    isPastMidpoint: boolean | null;
};

interface OwnItemDragOptions<T> {
    data: T[];
    disabled: boolean;
    visibleOrder: T[];
    keyExtractor: KeyExtractor<T>;
    onChange: DraggableListProps<T>['onChange'];
    isItemDraggable: (item: T, index: number) => boolean;
    sectionExtractor: DraggableListProps<T>['sectionExtractor'];
    setPreviewOrder: React.Dispatch<React.SetStateAction<T[] | null>>;
    latestPropsRef: React.RefObject<LatestProps<T>>;
    dragGroup: ReturnType<typeof useDragGroup<T>>;
}

/** Dragging one of this list's own items within it, from the grip to the drop. */
const useOwnItemDrag = <T,>({
    data,
    disabled,
    visibleOrder,
    keyExtractor,
    onChange,
    isItemDraggable,
    sectionExtractor,
    setPreviewOrder,
    latestPropsRef,
    dragGroup,
}: OwnItemDragOptions<T>) => {
    const [draggedItemKey, setDraggedItemKeyState] = useState<ItemKey | null>(null);
    const [grippedItemKey, setGrippedItemKey] = useState<ItemKey | null>(null);

    // Drag events fire faster than React renders, so what a handler reads mid-drag lives in a ref.
    const draggedItemKeyRef = useRef<ItemKey | null>(null);
    const lastDecisionRef = useRef<ReorderDecision | null>(null);
    const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

    const setDraggedItemKey = (itemKey: ItemKey | null) => {
        draggedItemKeyRef.current = itemKey;
        setDraggedItemKeyState(itemKey);
    };

    const resetDrag = () => {
        setGrippedItemKey(null);
        setDraggedItemKey(null);
        setPreviewOrder(null);
        lastDecisionRef.current = null;
        lastPointerRef.current = null;
    };

    // A new data identity settles the order, so a drag in flight starts over.
    useEffect(() => {
        resetDrag();
    }, [data]);

    // Disabling cancels: nothing may be committed from a gesture the list no longer allows.
    useEffect(() => {
        if (!disabled) {
            return;
        }
        resetDrag();
        dragGroup.endGroupDrag();
    }, [disabled]);

    // Fires as a gesture begins or ends, never within one, so the reflow guard stands.
    useEffect(() => {
        lastPointerRef.current = null;
    }, [dragGroup.activeDrag]);

    // Receivership moved, so a cached decision describes a preview that has changed under it.
    useEffect(() => {
        lastDecisionRef.current = null;
    }, [dragGroup.receiverId]);

    useEffect(() => {
        if (grippedItemKey === null) {
            return;
        }
        // Pressed the grip but never dragged; a real drag ends through dragend instead.
        const releaseGrip = () => setGrippedItemKey(null);
        window.addEventListener('pointerup', releaseGrip);
        window.addEventListener('pointercancel', releaseGrip);

        return () => {
            window.removeEventListener('pointerup', releaseGrip);
            window.removeEventListener('pointercancel', releaseGrip);
        };
    }, [grippedItemKey]);

    const matchesLastDecision = (targetItemKey: ItemKey, isPastMidpoint: boolean | null) => {
        const lastDecision = lastDecisionRef.current;

        return (
            lastDecision !== null &&
            lastDecision.draggedItemKey === draggedItemKeyRef.current &&
            lastDecision.targetItemKey === targetItemKey &&
            lastDecision.isPastMidpoint === isPastMidpoint
        );
    };

    return {
        draggedItemKey,
        grippedItemKey,
        gripItem: setGrippedItemKey,
        isDraggingOwnItem: () => draggedItemKeyRef.current !== null,
        resetDrag,

        /**
         * A reorder slides another item under a still pointer, which arrives as a dragover
         * for it. Acting on that would move the drag where the user never pointed.
         */
        hasPointerMoved: (screenX: number, screenY: number) => {
            // An event carrying no coordinates is no evidence the pointer stayed put.
            if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) {
                return true;
            }
            const lastPointer = lastPointerRef.current;
            const hasMoved = !lastPointer || lastPointer.x !== screenX || lastPointer.y !== screenY;
            if (hasMoved) {
                lastPointerRef.current = { x: screenX, y: screenY };
            }

            return hasMoved;
        },

        startDrag: (event: React.DragEvent, itemKey: ItemKey, item: T) => {
            // Nested lists: the browser drags the innermost draggable, so a bubbling
            // dragstart must not make an outer list drag its own item too.
            event.stopPropagation();
            lastDecisionRef.current = null;
            lastPointerRef.current = null;
            setDraggedItemKey(itemKey);

            dragGroup.startGroupDrag({
                itemKey,
                item,
                // Run by the receiving list on drop, so this reads the latest props.
                commitRemove: () => {
                    const latest = latestPropsRef.current;
                    const change = buildRemoveChange(latest.data, itemKey, latest.keyExtractor);
                    if (!change) {
                        return null;
                    }
                    latest.onChange(change);

                    return { from: change.from, item: change.item };
                },
            });

            // Firefox refuses to start a drag unless data is set on the transfer.
            event.dataTransfer.setData('text/plain', '');
            event.dataTransfer.effectAllowed = 'move';
        },

        previewReorderAt: (event: React.DragEvent, targetItemKey: ItemKey) => {
            const movingItemKey = draggedItemKeyRef.current;
            if (movingItemKey === null) {
                return;
            }
            // Read now: currentTarget is not available once this handler returns.
            const isPastMidpoint = isPastTargetMidpoint(
                event.currentTarget.getBoundingClientRect(),
                event.clientX,
                event.clientY,
            );
            if (matchesLastDecision(targetItemKey, isPastMidpoint)) {
                return;
            }
            lastDecisionRef.current = {
                draggedItemKey: movingItemKey,
                targetItemKey,
                isPastMidpoint,
            };

            if (dragGroup.isSourceOfActiveDrag()) {
                dragGroup.releaseReceivership();
            }

            setPreviewOrder((previewOrder) => {
                const next = resolveReorder(previewOrder ?? data, movingItemKey, targetItemKey, {
                    keyExtractor,
                    isDraggable: isItemDraggable,
                    sectionExtractor,
                    isPastMidpoint,
                });

                return next ?? previewOrder;
            });
        },

        commitReorder: () => {
            const movingItemKey = draggedItemKeyRef.current;
            if (movingItemKey === null) {
                return;
            }
            // A drop bubbles item to container, so clearing the key here commits exactly once.
            setDraggedItemKey(null);
            lastDecisionRef.current = null;
            setPreviewOrder(null);

            const change = buildReorderChange(data, visibleOrder, movingItemKey, keyExtractor);
            if (change) {
                onChange(change);
            }
        },
    };
};

export default useOwnItemDrag;
