import React, { Component } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    inputRef: PropTypes.shape({ 
        current: PropTypes.elementType 
    }),
    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    required: false,
    disabled: false,
    onChange: noop,
};

export default class Input extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleChange = (event) => {
        const { onChange } = this.props;
        onChange(event.target);
    }

    render() {
        const { 
            className: _className,
            inputRef,
            disabled,
            required,
            onChange,
            ...otherProps
        } = this.props;

        const className = cs(
            styles.input,
            {
                required,
                disabled,
            },
            _className,
        );

        return (
            <input
                ref={inputRef}
                className={className}
                onChange={this.handleChange}
                {...otherProps}
            />
        );
    }
}
