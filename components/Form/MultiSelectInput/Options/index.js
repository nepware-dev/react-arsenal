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
    onItemAdd: PropTypes.func.isRequired,
    onItemRemove: PropTypes.func.isRequired,
    onItemStateChange: PropTypes.func.isRequired,
    renderItemLabel: PropTypes.func,
};

const defaultProps = {
    className: '',
    selectedItems: [],
};

const Options = ({
    data,
    className,
    classNameItem,
    selectedItems,
    keyExtractor,
    valueExtractor,
    onItemAdd,
    onItemRemove,
    onItemStateChange,
    renderItemLabel: ItemLabel,
    ...otherProps
}) => {
    const Item = ({item}) => {

        const selectedItem = useMemo(() =>
            selectedItems.find(i => keyExtractor(item) === keyExtractor(i)), [selectedItems, item, keyExtractor]);

        item = selectedItem?selectedItem:item;
        const selected = !!selectedItem;

        const onClick = useCallback((event) => {
            event.stopPropagation();
            selected?onItemRemove({item}):onItemAdd({item});
        }, [item, selected, onItemAdd, onItemRemove]);

        const onStateChange = useCallback(({item}) => {
            onItemStateChange({item});
        }, [item, onItemStateChange]);

        const Label = ItemLabel?
            <ItemLabel selected={selected} item={item} onStateChange={onStateChange} />:
            <div>{valueExtractor(item)}</div>;


        return (
            <Option
                className={classNameItem}
                label={Label}
                selected={selected}
                onClick={onClick}
            />
        );
    }

    return (
        <List
            className={cs(styles.options, className)}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={Item}
            {...otherProps}
        />
    );
}

Options.propTypes = propTypes;
Options.defaultProps = defaultProps;

export default Options;
