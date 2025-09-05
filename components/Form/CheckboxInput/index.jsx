import React, {useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';
import {isArray} from '../../../utils';

import Localize from '../../I18n/Localize';

import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]).isRequired,
    value: PropTypes.string,
    required: PropTypes.bool,
    warning: PropTypes.bool,
    showRequired: PropTypes.bool,
    disabled: PropTypes.bool,
    inputRef: PropTypes.shape({
        current: PropTypes.elementType
    }),
    onChange: PropTypes.func,
    errorMessage: PropTypes.any,
    info: PropTypes.string,
    checkboxClassName: PropTypes.string,
    indeterminate: PropTypes.bool // Requires inputRef to be sent
};

const defaultProps = {
    className: '',
    size: '1em',
    required: false,
    disabled: false,
    onChange: noop,
};

const CheckboxInput = (props) => {
    const {
        className: _className,
        checkboxClassName,
        size,
        inputRef,
        disabled,
        required,
        onChange,
        errorMessage,
        warning,
        showRequired,
        info,
        indeterminate,
        ...otherProps
    } = props;

    const hasError = !!errorMessage;
    const hasInfo = !!info;
    const hasWarning = !!warning || showRequired;

    const className = cs(
        styles.container,
        {[styles.inputError]: hasError},
        {[styles.inputWarning]: hasWarning},
        {
            required,
            disabled,
        },
        _className,
    );

    const handleChange = useCallback(event => {
        onChange(event.target);
    }, [onChange]);

    const getErrorMessage = useCallback(() => {
        if(isArray(errorMessage)) {
            return errorMessage[0];
        }
        return errorMessage;
    }, [errorMessage]);

    useEffect(() => {
        if(inputRef?.current) {
            if(indeterminate) {
                inputRef.current.indeterminate = true;
            } else {
                inputRef.current.indeterminate = false;
            }
        }
    }, [indeterminate]);

    const errMsg = getErrorMessage();

    return (
        <>
            <div className={className} style={{fontSize: size}}>
                <input
                    disabled={disabled}
                    ref={inputRef}
                    type='checkbox'
                    className={styles.input}
                    onChange={handleChange}
                    {...otherProps}
                />
                <span className={cs(styles.checkbox, checkboxClassName)} />
            </div>
            {hasInfo && (
                <span className={styles.infoText}>
                    <Localize>{info}</Localize>
                </span>
            )}
            {hasError && (
                <span className={styles.errorText}>
                    <Localize>{errMsg}</Localize>
                </span>
            )}
            {hasWarning && (
                <span className={styles.warningText}>
                    <Localize>{warning || 'Required'}</Localize>
                </span>
            )}
        </>
    );
};

CheckboxInput.propTypes = propTypes;
CheckboxInput.defaultProps = defaultProps;

export default CheckboxInput;
