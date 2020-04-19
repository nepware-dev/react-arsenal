import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    selected: PropTypes.bool,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const defaultProps = {
    onClick: noop,
    selected: false,
};

export default class Option extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className: _className,
            label,
            selected,
            onClick,
        } = this.props;

        const className = cs(
            styles.option, 
            _className,
            {
                [styles.selected]: selected,
            }
        );
        return (
            <div 
                className={className} 
                onClick={onClick}
            >
                {label}
            </div>
        );
    }
}
