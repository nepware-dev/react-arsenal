import React, {useCallback} from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';
import cs from '../../../cs';
import {isArray} from '../../../utils'

import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    size: PropTypes.number,
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
    size: 16,
    required: false,
    disabled: false,
    onChange: noop,
};

const CheckboxInput = ({
    className: _className,
    size,
    inputRef,
    disabled,
    required,
    onChange,
    errorMessage,
    warning,
    showRequired,
    info,
    ...otherProps
}) => {

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
    });

    const getErrorMessage = useCallback(() => {
        if(isArray(errorMessage)) {
            return errorMessage[0];
        }
        return errorMessage;
    });


    const errMsg = getErrorMessage();

    return (
        <>
        <div className={className} style={{fontSize: `${size}px`}}>
            <input
                ref={inputRef}
                type='checkbox'
                className={styles.input}
                onChange={handleChange}
                {...otherProps}
            />
            <span className={styles.checkbox} />
        </div>
        {hasInfo && <span className={styles.infoText}>{info}</span>}
        {hasError && <span className={styles.errorText}>{errMsg}</span>}
        {hasWarning && <span className={styles.warningText}>{warning || 'Required'}</span>}
        </>
    )
};

CheckboxInput.propTypes = propTypes;
CheckboxInput.defaultProps = defaultProps;;

export default CheckboxInput;
