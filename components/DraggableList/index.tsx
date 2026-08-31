import React, { useRef, useState } from 'react';

import styles from './styles.module.scss';
import type { DraggableListProps, ItemKey } from './types';
import useDragAutoScroll from './useDragAutoScroll';
import useDragGroup from './useDragGroup';
import useOwnItemDrag from './useOwnItemDrag';
import { allowDrop } from './utils';
import List, { type ListRenderItemProps } from '../List';
import cs from '../../cs';

const allDraggable = () => true;

const DraggableList = <T,>(props: DraggableListProps<T>) => {
    const {
        data,
        keyExtractor,
        renderItem,
        onChange,
        group,
        className,
        classNameItem,
        style,
        component: Component = 'div',
        disabled = false,
        dragHandle = false,
        autoScroll = false,
        isDraggableExtractor = allDraggable,
        sectionExtractor,
        ...otherProps
    } = props;

    /** The speculative order the drag is building, until it is dropped or cancelled. */
    const [previewOrder, setPreviewOrder] = useState<T[] | null>(null);
    const visibleOrder = previewOrder ?? data;

    const containerRef = useRef<HTMLElement>(null);

    const latestPropsRef = useRef({ data, keyExtractor, onChange });
    latestPropsRef.current = { data, keyExtractor, onChange };

    const isItemDraggable = (item: T, index: number) =>
        !disabled && isDraggableExtractor(item, index);

    const dragGroup = useDragGroup<T>({
        group,
        disabled,
        visibleOrder,
        keyExtractor,
        isItemDraggable,
        setPreviewOrder,
        latestPropsRef,
    });

    const ownItemDrag = useOwnItemDrag<T>({
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
    });

    useDragAutoScroll({
        containerRef,
        enabled: autoScroll,
        active: ownItemDrag.draggedItemKey !== null,
    });

    const handleItemDragOver = (event: React.DragEvent, targetItemKey: ItemKey) => {
        allowDrop(event);

        // Screen coordinates: the client ones shift under a still pointer when
        // a reorder scrolls the page.
        const pointerMoved = ownItemDrag.hasPointerMoved(event.screenX, event.screenY);

        // A gesture belongs to the lowest list that owns it, so an outer list of
        // the same group never sees an inner list's own drag as a visitor.
        if (ownItemDrag.isDraggingOwnItem()) {
            event.stopPropagation();

            if (pointerMoved) {
                ownItemDrag.previewReorderAt(event, targetItemKey);
            }
            return;
        }
        if (!pointerMoved) {
            if (dragGroup.wasForeignItemHosted()) {
                event.stopPropagation();
            }
            return;
        }
        if (dragGroup.hostForeignItemAt(targetItemKey)) {
            event.stopPropagation();
        }
    };

    const handleContainerDragOver = (event: React.DragEvent) => {
        allowDrop(event);

        if (ownItemDrag.isDraggingOwnItem()) {
            event.stopPropagation();
            return;
        }
        if (dragGroup.hostForeignItemAtEnd()) {
            event.stopPropagation();
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();

        if (ownItemDrag.isDraggingOwnItem()) {
            ownItemDrag.commitReorder();
            return;
        }
        dragGroup.commitForeignDrop();
    };

    const handleDragEnd = () => {
        ownItemDrag.resetDrag();
        dragGroup.endGroupDrag();
    };

    /** Rendered by List, so `index` is the position within the preview order. */
    const renderDraggableItem = ({ item, index }: ListRenderItemProps<T>) => {
        const itemKey = keyExtractor(item, index);
        const isDragging =
            itemKey === ownItemDrag.draggedItemKey || itemKey === dragGroup.hostedForeignItemKey;
        const isDraggable = isItemDraggable(item, index);
        // Draggable only while its grip is held, so its text stays selectable.
        const gripAllowsDrag = !dragHandle || ownItemDrag.grippedItemKey === itemKey;
        const dragHandleProps = {
            onPointerDown: () => ownItemDrag.gripItem(itemKey),
        };

        return (
            <div
                draggable={isDraggable && gripAllowsDrag}
                className={cs(classNameItem, { [styles.dragging]: isDragging })}
                style={itemKey === dragGroup.hiddenItemKey ? { display: 'none' } : undefined}
                onDragStart={(event) => {
                    if (isDraggable) {
                        ownItemDrag.startDrag(event, itemKey, item);
                    }
                }}
                onDragOver={(event) => handleItemDragOver(event, itemKey)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
            >
                {renderItem({ item, index, isDragging, isDraggable, dragHandleProps })}
            </div>
        );
    };

    const Container = Component as React.ElementType;

    return (
        <Container
            ref={containerRef}
            className={className}
            style={style}
            onDragOver={handleContainerDragOver}
            onDragEnter={dragGroup.trackContainerEnter}
            onDragLeave={dragGroup.releaseOnContainerLeave}
            onDrop={handleDrop}
        >
            <List<T>
                {...otherProps}
                component={React.Fragment}
                data={visibleOrder}
                keyExtractor={keyExtractor}
                renderItem={renderDraggableItem}
            />
        </Container>
    );
};

export default DraggableList;
export * from './types';
