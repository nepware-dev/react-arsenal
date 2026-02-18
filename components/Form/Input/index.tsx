import React, { useState, useMemo, useCallback, useEffect } from 'react';

import cs from '../../../cs';
import {isArray} from '../../../utils';

import Localize from '../../I18n/Localize';

import styles from './styles.module.scss';
import { InputProps } from './types';

const noop = () => {};

const getErrorMessage = (msg: InputProps['errorMessage']): string => {
    if(isArray(msg)) {
        return msg[0];
    }
    return msg;
};

interface MetaState {
    invalid: boolean;
    touched: boolean;
    error: string | null;
    warning: string | null;
}

const Input: React.FC<InputProps> = ({
    containerClassName,
    className = '',
    inputRef,
    disabled = false,
    required = false,
    errorMessage,
    showRequired,
    warning,
    info,
    textClassName,
    onChange = noop,
    onInvalid,
    ...otherProps
}) => {
    const [meta, setMeta] = useState<MetaState>({
        invalid: false,
        touched: false,
        error: null,
        warning: null,
    });

    useEffect(() => {
        if(showRequired) {
            setMeta(prevMeta => ({...prevMeta, warning: 'Required'}));
        }
        if(errorMessage) {
            setMeta(prevMeta => ({
                ...prevMeta,
                error: getErrorMessage(errorMessage),
            }));
        }
    }, [showRequired, errorMessage]);

    useEffect(() => {
        if(otherProps.value && meta.warning === 'Required') {
            setMeta(prevMeta => ({...prevMeta, warning: null}));
        }
    }, [otherProps.value]);

    const [Wrapper, wrapperProps] = useMemo(() => {
        if(containerClassName) {
            return ['div', {className: containerClassName}];
        }
        return [React.Fragment, {}];
    }, [containerClassName]);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setMeta(prevMeta => ({
            ...prevMeta,
            error: null,
            warning: required && !event.target.value ? 'Required' : null,
            invalid: false,
            touched: true
        }));
        onChange(event.target);
    }, [onChange, required]);

    const handleInvalid = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        setMeta(prevMeta => {
            if(required && !e.currentTarget.value) {
                return {...prevMeta, warning: 'Required', error: null};
            }
            return {...prevMeta, invalid: true, error: 'Invalid'};
        });
        onInvalid?.(e);
    }, [meta, onInvalid, required]);

    return (
        <Wrapper {...wrapperProps}>
            <input
                ref={inputRef}
                disabled={disabled}
                className={cs(
                    styles.input,
                    {
                        [styles.inputWarning]: meta.warning,
                        [styles.inputError]: meta.error,
                        required,
                        disabled,
                    },
                    className,
                )}
                required={required}
                onInvalid={handleInvalid}
                onChange={handleChange}
                {...otherProps}
            />
            {!!info && (
                <span className={cs(textClassName, styles.infoText, 'input-info')}>
                    <Localize>{info}</Localize>
                </span>
            )}
            {!!meta.error && (
                <span className={cs(textClassName, styles.errorText, 'input-error')}>
                     <Localize>{meta.error}</Localize>
                </span>
            )}
            {!!meta.warning && (
                <span className={cs(textClassName, styles.warningText, 'input-warning')}>
                    <Localize>{meta.warning}</Localize>
                </span>
            )}
        </Wrapper>
    );
};

export default Input;

export * from './types';
