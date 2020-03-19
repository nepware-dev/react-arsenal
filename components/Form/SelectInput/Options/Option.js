import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    item: PropTypes.object.isRequired,
    onClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    onClick: noop,
};

export default class Option extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleClick = () => {
        const {onClick, item } = this.props;

        onClick({item}); 
    }

    render() {
        const {
            className: _className,
            selectedItem,
            item,
        } = this.props;

        const className = cs(
            styles.option, 
            _className,
            {
                [styles.selected]: selectedItem && selectedItem.key===item.key,
            }
        );
        return (
            <div 
                className={className} 
                onClick={this.handleClick}
            >
                {item.name}
            </div>
        );
    }
}
