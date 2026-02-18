import React, {useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import Option from './Option';
import List from '../../../List';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    data: PropTypes.array.isRequired,
    className: PropTypes.string,
    classNameItem: PropTypes.string,
    selectedItems: PropTypes.array,
    keyExtractor: PropTypes.func.isRequired,
    valueExtractor: PropTypes.func.isRequired,
    isDisabledExtractor: PropTypes.func,
    onItemAdd: PropTypes.func.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    onItemStateChange: PropTypes.func.isRequired,
    renderItemLabel: PropTypes.func,
    LoadingComponent: PropTypes.any,
    FilterEmptyComponent: PropTypes.any,
    EmptyComponent: PropTypes.any,
};

const defaultProps = {
    className: '',
    selectedItems: [],
};

const Item = ({
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
}) => {
    const selectedItem = useMemo(() =>
        selectedItems.find(i => keyExtractor(initialItem) === keyExtractor(i)), [selectedItems, initialItem, keyExtractor]);

    const item = useMemo(() => selectedItem || initialItem, [selectedItem, initialItem]);
    const selected = useMemo(() => !!selectedItem, [selectedItem]);

    const disabled = useMemo(() => isDisabledExtractor?.(item) || false, [item, isDisabledExtractor]);

    const onClick = useCallback((event) => {
        event.stopPropagation();
        selected ? onItemRemove({item}) : onItemAdd({item});
    }, [item, selected, onItemAdd, onItemRemove]);

    const onStateChange = useCallback(({item}) => {
        onItemStateChange({item});
    }, [onItemStateChange]);

    const Label = useMemo(() => {
        return ItemLabel ? <ItemLabel item={item} selected={selected} disabled={disabled} onStateChange={onStateChange} /> : <div>{valueExtractor(item)}</div>;
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
};

const Options = ({
    data,
    className,
    classNameItem,
    selectedItems,
    keyExtractor,
    valueExtractor,
    isDisabledExtractor,
    onItemAdd,
    onItemRemove,
    onItemStateChange,
    renderItemLabel: ItemLabel,
    ...otherProps
}) => {
    const renderItem = useCallback(({item}) => (
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
    ), [selectedItems, keyExtractor, valueExtractor, isDisabledExtractor, onItemAdd, onItemRemove, onItemStateChange, classNameItem, ItemLabel]);

    return (
        <List
            className={cs(styles.options, className)}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            {...otherProps}
        />
    );
}

Options.propTypes = propTypes;
Options.defaultProps = defaultProps;

export default Options;
