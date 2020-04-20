import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';

import cs from '../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    value: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    required: false,
    disabled: false,
    onChange: noop,
};

export default class TextInput extends Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleChange = (event) => {
        const { onChange } = this.props;
        onChange(event.target.value);
    }

    render() {
        const { 
            className: _className,
            disabled,
            required,
            ...otherProps
        } = this.props;

        const className = cs(
            _className,
            styles.input,
            {
                required,
                disabled,
            }
        );

        return (
            <Input
                type="text"
                disabled={disabled}
                className={className}
                onChange={this.handleChange}
                {...otherProps}
            />
        );
    }
}
