import React, { Component } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';
import {isArray} from '../../../utils';

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
    warning: PropTypes.string,
    showRequired: PropTypes.bool,
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
            errorMessage,
            warning,
            showRequired,
            info,
            textClassName,
            ...otherProps
        } = this.props;

        const hasError = !!errorMessage;
        const hasInfo = !!info;
        const hasWarning = !!warning || showRequired;

        const className = cs(
            styles.input,
            {[styles.inputError]: hasError},
            {[styles.inputWarning]: hasWarning && !hasError},
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
                    required={required}
                    {...otherProps}
                    onChange={this.handleChange}
                />
                {hasInfo && <span className={cs(textClassName, styles.infoText, 'input-info')}>{info}</span>}
                {hasError && <span className={cs(textClassName, styles.errorText, 'input-error')}>{errMsg}</span>}
                {hasWarning && <span className={cs(textClassName, styles.warningText, 'input-warning')}>{warning || 'Required'}</span>}
            </>
        );
    }
}
