import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import Option from './Option';
import List from '../../../List';

const noop = () => {};

const propTypes = {
    data: PropTypes.array.isRequired,
    className: PropTypes.string,
    classNameItem: PropTypes.string,
    selectedItem: PropTypes.object,
    focusedItem: PropTypes.object,
    keyExtractor: PropTypes.func.isRequired,
    valueExtractor: PropTypes.func.isRequired,
    isDisabledExtractor: PropTypes.func,
    onItemClick: PropTypes.func,
    onItemFocus: PropTypes.func,
};

const defaultProps = {
    className: '',
    onItemClick: noop,
    onItemFocus: noop,
    selectedItem: {},
    focusedItem: {},
};

export default class Options extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderItem = ({item}) => {
        const {
            onItemClick,
            onItemFocus,
            classNameItem,
            selectedItem,
            focusedItem,
            valueExtractor,
            keyExtractor,
            isDisabledExtractor,
        } = this.props;

        const _onItemClick = (event) => {
            event.stopPropagation();
            onItemClick({item});
        };

        const _onItemFocus = () => {
            onItemFocus({item});
        };

        const label = valueExtractor(item);
        const key = keyExtractor(item);
        const selected = selectedItem && key === keyExtractor(selectedItem);
        const focused = focusedItem && key === keyExtractor(focusedItem);

        const isDisabled = isDisabledExtractor && isDisabledExtractor(item);

        return (
            <Option 
                className={classNameItem}
                label={label}
                selected={selected}
                focused={focused}
                onClick={_onItemClick}
                onFocus={_onItemFocus}
                disabled={isDisabled}
            />
        );
    }

    render() {
        const {
            className,
            data,
            keyExtractor,
            ...otherProps
        } = this.props;

        return (
            <List
                className={cs(className)}
                data={data}
                keyExtractor={keyExtractor}
                renderItem={this.renderItem}
                {...otherProps}
            />
        );
    }
}
