import React, { PureComponent } from 'react';
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
    selectedItem: PropTypes.object,
    keyExtractor: PropTypes.func.isRequired,
    valueExtractor: PropTypes.func.isRequired,
    onItemClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    onItemClick: noop,
    selectedItem: {},
};

export default class Options extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderItem = ({item}) => {
        const {
            onItemClick,
            classNameItem,
            selectedItem,
            valueExtractor,
            keyExtractor,
        } = this.props;

        const _onItemClick = () => {
            onItemClick({item});
        }

        const label = valueExtractor(item);
        const selected = selectedItem && keyExtractor(item) === keyExtractor(selectedItem);

        return (
            <Option 
                className={classNameItem}
                label={label}
                selected={selected}
                onClick={_onItemClick}
            />
        );
    }

    render() {
        const {
            className,
            data,
            keyExtractor,
            onItemClick,
            ...otherProps
        } = this.props;


        return (
            <List
                className={cs(styles.options, className)}
                data={data}
                keyExtractor={keyExtractor}
                onItemClick={onItemClick}
                renderItem={this.renderItem}
                {...otherProps}
            />
        );
    }
}
