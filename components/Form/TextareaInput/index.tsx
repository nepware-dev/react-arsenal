import React, { useCallback, useEffect, useState, useMemo } from 'react';

import styles from './styles.module.scss';
import type { TextareaInputProps, TextareaMeta } from './types';
import Localize from '../../I18n/Localize';
import cs from '../../../cs';
import { isArray } from '../../../utils';

const noop = () => {};

const TextareaInput: React.FC<TextareaInputProps> = (props) => {
    const {
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
    } = props;

    const [meta, setMeta] = useState<TextareaMeta>({
        invalid: false,
        touched: false,
        error: null,
        warning: warning,
    });

    useEffect(() => {
        if (showRequired) {
            setMeta((prevMeta) => ({ ...prevMeta, warning: 'Required' }));
        }
        if (errorMessage) {
            setMeta((prevMeta) => ({
                ...prevMeta,
                error: isArray(errorMessage) ? errorMessage[0] : (errorMessage as string),
            }));
        }
    }, [showRequired, errorMessage]);

    useEffect(() => {
        if (otherProps.value && meta.warning === 'Required') {
            setMeta((prevMeta) => ({ ...prevMeta, warning: null }));
        }
    }, [otherProps.value]);

    const [Wrapper, wrapperProps] = useMemo(() => {
        if (containerClassName) {
            return ['div', { className: containerClassName }];
        }
        return [React.Fragment, {}];
    }, [containerClassName]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setMeta((prevMeta) => ({
                ...prevMeta,
                error: null,
                warning: required && !event.target.value ? 'Required' : null,
                invalid: false,
                touched: true,
            }));
            onChange(event.target);
        },
        [onChange, required],
    );

    const handleInvalid = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
            setMeta((prevMeta) => {
                if (required && !e.currentTarget.value) {
                    return { ...prevMeta, warning: 'Required', error: null };
                }
                return { ...prevMeta, invalid: true, error: 'Invalid' };
            });
            onInvalid?.(e);
        },
        [meta, onInvalid, required],
    );

    return (
        <Wrapper {...wrapperProps}>
            <textarea
                ref={inputRef}
                className={cs(className, styles.textarea, {
                    [styles.textareaWarning]: meta.warning,
                    [styles.textareaError]: meta.error,
                    required,
                    disabled,
                })}
                rows={4}
                onChange={handleChange}
                onInvalid={handleInvalid}
                required={required}
                disabled={disabled}
                {...otherProps}
            />
            {!!meta.warning && (
                <p className={cs(textClassName, styles.warningText, 'input-warning')}>
                    <Localize>{meta.warning}</Localize>
                </p>
            )}
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
        </Wrapper>
    );
};

export default TextareaInput;
