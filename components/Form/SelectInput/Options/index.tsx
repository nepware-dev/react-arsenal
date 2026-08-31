import { useCallback, type ReactNode } from 'react';

import Option from './Option';
import List, { type ListRenderItem } from '../../../List';
import type { OptionsProps } from './types';

const noop = () => {};

function Options<T, V extends ReactNode>(props: OptionsProps<T, V>) {
    const {
        data,
        className = '',
        keyExtractor,
        onItemClick = noop,
        onItemFocus = noop,
        selectedItem,
        focusedItem,
        listRef,
        ...otherProps
    } = props;

    const renderOptionItem: ListRenderItem<T> = useCallback(
        ({ item, index }) => {
            return (
                <OptionItem
                    item={item}
                    index={index}
                    keyExtractor={keyExtractor}
                    onItemClick={onItemClick}
                    onItemFocus={onItemFocus}
                    selectedItem={selectedItem}
                    focusedItem={focusedItem}
                    {...otherProps}
                />
            );
        },
        [selectedItem, focusedItem, otherProps, keyExtractor, onItemClick, onItemFocus],
    );

    return (
        <List
            containerRef={listRef}
            className={className}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderOptionItem}
            {...otherProps}
        />
    );
}

export default Options;

function OptionItem<T, V extends ReactNode>(
    props: Omit<OptionsProps<T, V>, 'data'> & { item: T; index: number },
) {
    const {
        item,
        index,
        onItemClick,
        onItemFocus,
        classNameItem,
        selectedItem,
        focusedItem,
        valueExtractor,
        keyExtractor,
        isDisabledExtractor,
    } = props;

    const handleOptionClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onItemClick?.({ item });
    };

    const handleOptionFocus = () => {
        onItemFocus?.({ item });
    };

    const label = valueExtractor(item);
    const key = keyExtractor(item, index);

    // TODO: Add Correct selected and focused Item key
    const selected = selectedItem && key === keyExtractor(selectedItem, -99);
    const focused = focusedItem && key === keyExtractor(focusedItem, -99);

    const isDisabled = isDisabledExtractor && isDisabledExtractor(item);

    return (
        <Option
            className={classNameItem}
            label={label}
            selected={selected}
            focused={focused}
            onClick={handleOptionClick}
            onFocus={handleOptionFocus}
            disabled={isDisabled}
        />
    );
}
