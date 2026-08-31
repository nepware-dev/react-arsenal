import React, { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

import dragRegistry, { type ActiveDrag } from './dragRegistry';
import type { DraggableListProps, ItemKey } from './types';
import { buildAddChange, findIndexIn, resolveHostedOrder } from './utils';
import type { KeyExtractor } from '../List/types';

type LatestProps<T> = Pick<DraggableListProps<T>, 'data' | 'keyExtractor' | 'onChange'>;

/** The last hosting decision, so an identical dragover is not acted on twice. */
type HostDecision = {
    foreignItemKey: ItemKey;
    targetItemKey: ItemKey | null;
    didHost: boolean;
};

interface DragGroupOptions<T> {
    group?: string;
    disabled: boolean;
    visibleOrder: T[];
    keyExtractor: KeyExtractor<T>;
    isItemDraggable: (item: T, index: number) => boolean;
    setPreviewOrder: React.Dispatch<React.SetStateAction<T[] | null>>;
    latestPropsRef: React.RefObject<LatestProps<T>>;
}

/** Ungrouped lists take no part in the shared drag, so they never subscribe. */
const noopSubscribe = () => () => {};
const nullSnapshot = () => null;

/**
 * This list's standing with its `group`, and the whole flow for showing and
 * committing an item dragged in from another list of it.
 */
const useDragGroup = <T,>({
    group,
    disabled,
    visibleOrder,
    keyExtractor,
    isItemDraggable,
    setPreviewOrder,
    latestPropsRef,
}: DragGroupOptions<T>) => {
    const idRef = useRef<symbol | null>(null);
    if (idRef.current === null) {
        idRef.current = Symbol('DraggableList');
    }
    const ownId = idRef.current;

    // Snapshots are narrowed to this list's group and referentially stable, so a
    // drag elsewhere never re-renders a non-participant.
    const getGroupDrag = useCallback((): ActiveDrag | null => {
        const drag = dragRegistry.get();

        return drag && group && drag.group === group ? drag : null;
    }, [group]);

    const getGroupReceiverId = useCallback(
        () => (getGroupDrag() ? dragRegistry.getReceiverId() : null),
        [getGroupDrag],
    );

    const subscribe = group ? dragRegistry.subscribe : noopSubscribe;
    const activeDrag = useSyncExternalStore(subscribe, getGroupDrag, nullSnapshot);
    const receiverId = useSyncExternalStore(subscribe, getGroupReceiverId, nullSnapshot);

    const hostedItemKeyRef = useRef<ItemKey | null>(null);
    /** Outstanding dragenter events, to tell a real leave from a move between children. */
    const enterDepthRef = useRef(0);
    const lastDecisionRef = useRef<HostDecision | null>(null);

    const getForeignDrag = () => {
        if (!group || disabled) {
            return null;
        }
        const drag = dragRegistry.get();
        if (!drag || drag.group !== group || drag.sourceId === ownId) {
            return null;
        }

        return drag;
    };

    const stopHosting = () => {
        const hostedItemKey = hostedItemKeyRef.current;
        hostedItemKeyRef.current = null;
        enterDepthRef.current = 0;
        lastDecisionRef.current = null;

        return hostedItemKey;
    };

    const removeHostedItemFromPreview = () => {
        const hostedItemKey = stopHosting();
        if (hostedItemKey === null) {
            return;
        }
        setPreviewOrder((previewOrder) => {
            if (!previewOrder) {
                return previewOrder;
            }
            const { keyExtractor: latestKeyExtractor } = latestPropsRef.current;
            const index = findIndexIn(previewOrder, hostedItemKey, latestKeyExtractor);
            if (index === -1) {
                return previewOrder;
            }
            const next = [...previewOrder];
            next.splice(index, 1);

            return next;
        });
    };

    /** Shows the foreign item before `targetItemKey`, or at the end for a null key. */
    const placeForeignItem = (targetItemKey: ItemKey | null) => {
        const foreignDrag = getForeignDrag();
        if (!foreignDrag) {
            return false;
        }
        const result = resolveHostedOrder(
            visibleOrder,
            foreignDrag.item as T,
            foreignDrag.itemKey,
            targetItemKey,
            { keyExtractor, isDraggable: isItemDraggable },
        );
        if (!result.accepted) {
            return false;
        }
        dragRegistry.setReceiver(ownId);
        hostedItemKeyRef.current = foreignDrag.itemKey;

        if (result.order) {
            setPreviewOrder(result.order);
        }

        return true;
    };

    const matchesLastDecision = (foreignItemKey: ItemKey, targetItemKey: ItemKey | null) => {
        const lastDecision = lastDecisionRef.current;

        return (
            lastDecision !== null &&
            lastDecision.foreignItemKey === foreignItemKey &&
            lastDecision.targetItemKey === targetItemKey
        );
    };

    useEffect(() => {
        lastDecisionRef.current = null;
        // A committed drop stops hosting first, so this does not remove the item twice.
        if (receiverId !== ownId) {
            removeHostedItemFromPreview();
        }
    }, [receiverId, ownId]);

    // Fires as a gesture begins or ends, never within one, so a count left unbalanced
    // by an enter without a matching leave cannot leak into the next drag.
    useEffect(() => {
        enterDepthRef.current = 0;
    }, [activeDrag]);

    useEffect(() => {
        if (!disabled || hostedItemKeyRef.current === null) {
            return;
        }
        removeHostedItemFromPreview();
        dragRegistry.setReceiver(null);
    }, [disabled]);

    useEffect(
        () => () => {
            if (dragRegistry.get()?.sourceId === ownId) {
                dragRegistry.clear();
            } else if (dragRegistry.getReceiverId() === ownId) {
                dragRegistry.setReceiver(null);
            }
        },
        [ownId],
    );

    /** Another list's item, shown here and drawn as though it were being dragged here. */
    const hostedForeignItemKey = activeDrag && receiverId === ownId ? activeDrag.itemKey : null;

    const isShownElsewhere = receiverId !== null && receiverId !== ownId;
    /**
     * This list's own item, hidden while another list of the group shows it. It stays
     * mounted, since unmounting detaches the node the browser fires `dragend` on.
     */
    const hiddenItemKey =
        activeDrag && activeDrag.sourceId === ownId && isShownElsewhere ? activeDrag.itemKey : null;

    return {
        activeDrag,
        receiverId,
        hostedForeignItemKey,
        hiddenItemKey,

        startGroupDrag: (drag: Omit<ActiveDrag, 'group' | 'sourceId'>) => {
            if (group) {
                dragRegistry.start({ ...drag, group, sourceId: ownId });
            }
        },

        endGroupDrag: () => {
            if (dragRegistry.get()?.sourceId === ownId) {
                dragRegistry.clear();
            }
        },

        isSourceOfActiveDrag: () => dragRegistry.get()?.sourceId === ownId,

        releaseReceivership: () => dragRegistry.setReceiver(null),

        wasForeignItemHosted: () => lastDecisionRef.current?.didHost === true,

        /** True when this list took the item, so the container must not park it at the end. */
        hostForeignItemAt: (targetItemKey: ItemKey) => {
            const foreignDrag = getForeignDrag();
            if (!foreignDrag) {
                return false;
            }
            if (matchesLastDecision(foreignDrag.itemKey, targetItemKey)) {
                return lastDecisionRef.current?.didHost === true;
            }
            const didHost = placeForeignItem(targetItemKey);
            lastDecisionRef.current = {
                foreignItemKey: foreignDrag.itemKey,
                targetItemKey,
                didHost,
            };

            return didHost;
        },

        /**
         * Gaps between items, and empty lists: the arriving item parks at the end.
         * True when this list took it, so an outer list must not park it as well.
         */
        hostForeignItemAtEnd: () => {
            const foreignDrag = getForeignDrag();
            if (!foreignDrag) {
                return false;
            }
            if (matchesLastDecision(foreignDrag.itemKey, null)) {
                return lastDecisionRef.current?.didHost === true;
            }
            const didHost = placeForeignItem(null);
            lastDecisionRef.current = {
                foreignItemKey: foreignDrag.itemKey,
                targetItemKey: null,
                didHost,
            };

            return didHost;
        },

        commitForeignDrop: () => {
            const foreignDrag = getForeignDrag();
            const hostedItemKey = hostedItemKeyRef.current;
            if (!foreignDrag || hostedItemKey === null) {
                return;
            }
            // A drop bubbles item to container, so stopping hosting here commits exactly once.
            stopHosting();
            const dropIndex = findIndexIn(visibleOrder, hostedItemKey, keyExtractor);

            setPreviewOrder(null);

            // The source's 'remove' fires from its latest props, immediately before this 'add'.
            const removed = dropIndex === -1 ? null : foreignDrag.commitRemove();
            if (removed) {
                // The source may have replaced the item since dragstart, so the
                // committed order carries the object it actually removed.
                const nextOrder = [...visibleOrder];
                nextOrder[dropIndex] = removed.item as T;

                latestPropsRef.current.onChange(
                    buildAddChange(nextOrder, dropIndex, removed.from),
                );
            }
            dragRegistry.clear();
        },

        trackContainerEnter: () => {
            if (getForeignDrag()) {
                enterDepthRef.current += 1;
            }
        },

        releaseOnContainerLeave: (event: React.DragEvent) => {
            // Mirrors the dragenter condition, so the depth stays balanced.
            if (!getForeignDrag()) {
                return;
            }
            enterDepthRef.current -= 1;
            // dragleave also fires between descendants: relatedTarget settles that in a
            // browser but is absent in jsdom, so the enter and leave balance decides.
            const related = event.relatedTarget as Node | null;
            if (related && (event.currentTarget as HTMLElement).contains(related)) {
                return;
            }
            if (enterDepthRef.current <= 0 && hostedItemKeyRef.current !== null) {
                removeHostedItemFromPreview();
                dragRegistry.setReceiver(null);
            }
        },
    };
};

export default useDragGroup;
