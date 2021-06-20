import React, { Component } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';
import {isArray} from '../../../utils'

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
    errorMessage: PropTypes.any,
    info: PropTypes.string,
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

    getErrorMessage = () => {
        if(isArray(this.props.errorMessage)) {
            return this.props.errorMessage[0];
        }
        return this.props.errorMessage;
    }

    render() {
        const { 
            className: _className,
            inputRef,
            disabled,
            required,
            onChange,
            errorMessage,
            warning,
            showRequired,
            info,
            ...otherProps
        } = this.props;

        const hasError = !!errorMessage;
        const hasInfo = !!info;
        const hasWarning = !!warning || showRequired;

        const className = cs(
            styles.input,
            {[styles.inputError]: hasError},
            {[styles.inputWarning]: hasWarning},
            {
                required,
                disabled,
            },
            _className,
        );

        const errMsg = this.getErrorMessage();

        return (
            <>
                <input
                    ref={inputRef}
                    disabled={disabled}
                    className={className}
                    onChange={this.handleChange}
                    {...otherProps}
                />
                {hasInfo && <span className={styles.infoText}>{info}</span>}
                {hasError && <span className={styles.errorText}>{errMsg}</span>}
                {hasWarning && <span className={styles.warningText}>{warning || 'Required'}</span>}
            </>
        );
    }
}
