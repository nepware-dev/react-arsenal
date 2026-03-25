import React, { useMemo, useCallback, type ReactNode } from 'react';

import styles from './styles.module.scss';
import type { OptionItemProps, OptionsProps } from './types';
import Option from './Option';
import List, { type ListRenderItem } from '../../../List';
import cs from '../../../../cs';

function Item<T, V extends ReactNode>({
    item: initialItem,
    classNameItem,
    selectedItems,
    keyExtractor,
    valueExtractor,
    isDisabledExtractor,
    onItemAdd,
    onItemRemove,
    onItemStateChange,
    ItemLabel,
}: OptionItemProps<T, V>) {
    const selectedItem = useMemo(
        () => selectedItems.find((i) => keyExtractor(initialItem, -1) === keyExtractor(i, -1)),
        [selectedItems, initialItem, keyExtractor],
    );

    const item = useMemo(() => selectedItem || initialItem, [selectedItem, initialItem]);
    const selected = useMemo(() => !!selectedItem, [selectedItem]);

    const disabled = useMemo(
        () => isDisabledExtractor?.(item) || false,
        [item, isDisabledExtractor],
    );

    const onClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            selected ? onItemRemove({ item }) : onItemAdd({ item });
        },
        [item, selected, onItemAdd, onItemRemove],
    );

    const onStateChange = useCallback(
        ({ item }: { item: T }) => {
            onItemStateChange({ item });
        },
        [onItemStateChange],
    );

    const Label = useMemo(() => {
        return ItemLabel ? (
            <ItemLabel
                item={item}
                selected={selected}
                disabled={disabled}
                onStateChange={onStateChange}
            />
        ) : (
            <div>{valueExtractor(item)}</div>
        );
    }, [ItemLabel, item, valueExtractor, selected, disabled, onStateChange]);

    return (
        <Option
            className={classNameItem}
            label={Label}
            selected={selected}
            onClick={onClick}
            disabled={disabled}
        />
    );
}

const Options = <T, V extends ReactNode>({
    data,
    className = '',
    classNameItem,
    selectedItems = [],
    keyExtractor,
    valueExtractor,
    isDisabledExtractor,
    onItemAdd,
    onItemRemove,
    onItemStateChange,
    renderItemLabel: ItemLabel,
    ...otherProps
}: OptionsProps<T, V>) => {
    const renderItem: ListRenderItem<T> = useCallback(
        ({ item }) => (
            <Item
                item={item}
                selectedItems={selectedItems}
                keyExtractor={keyExtractor}
                valueExtractor={valueExtractor}
                isDisabledExtractor={isDisabledExtractor}
                onItemAdd={onItemAdd}
                onItemRemove={onItemRemove}
                onItemStateChange={onItemStateChange}
                classNameItem={classNameItem}
                ItemLabel={ItemLabel}
            />
        ),
        [
            selectedItems,
            keyExtractor,
            valueExtractor,
            isDisabledExtractor,
            onItemAdd,
            onItemRemove,
            onItemStateChange,
            classNameItem,
            ItemLabel,
        ],
    );

    return (
        <List
            className={cs(styles.options, className)}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            {...otherProps}
        />
    );
};

export default Options;
