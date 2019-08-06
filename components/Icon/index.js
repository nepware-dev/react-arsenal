import React, { Component } from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const defaultProps = {
    className: '',
    onClick: noop,
};

export default class Icon extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            name,
            className: _className,
            onClick,
        } = this.props;

        const className = cs(
            name,
            'icon',
            styles.icon,
            _className,
            {
                [styles.clickable]: onClick!==noop,
            }
        );

        return (
            <span
                className={className}
                onClick={onClick}
            />
        );
    }
}
