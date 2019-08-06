import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import Option from './Option';
import List from '../../../List';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    keyExtractor: PropTypes.func,
    onItemClick: PropTypes.func,
    emptyComponent: PropTypes.elementType,
};

const defaultProps = {
    className: '',
    keyExtractor: item => item.key,
    onItemClick: noop,
};

export default class Options extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderItem = (props) => {
        const { 
            className,
            item,
            onClick,
            ...otherProps
        } = props;

        return (
            <Option 
                className={className}
                item={item}
                onClick={onClick}
                {...otherProps}
            />
        );
    }

    renderEmptyComponent() {
        const { emptyComponent } = this.props;
        if(emptyComponent) {
            return emptyComponent;
        } else {
            return (
                <div className={styles.empty}>
                    No item to display
                </div>
            )
        }
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
