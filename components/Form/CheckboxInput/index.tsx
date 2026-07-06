import React, { useCallback, useEffect } from 'react';

import styles from './styles.module.scss';
import { CheckboxInputProps } from './types';
import Localize from '../../I18n/Localize';
import cs from '../../../cs';
import { isArray } from '../../../utils';

const noop = () => {};

const CheckboxInput: React.FC<CheckboxInputProps> = (props) => {
    const {
        className: _className = '',
        checkboxClassName,
        size = '1em',
        inputRef,
        disabled = false,
        required = false,
        onChange = noop,
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

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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

export default CheckboxInput;

export type { CheckboxInputProps };
