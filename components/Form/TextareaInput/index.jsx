import React, { useCallback, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import cs from '../../../cs';
import { isArray } from '../../../utils';

import Localize from '../../I18n/Localize';

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
    info: PropTypes.string,
};

const defaultProps = {
    className: '',
    required: false,
    disabled: false,
    onChange: noop,
};

const TextareaInput = (props) => {
    const {
        containerClassName,
        className,
        inputRef,
        disabled,
        required,
        errorMessage,
        showRequired,
        warning,
        info,
        textClassName,
        onChange,
        onInvalid,
        ...otherProps
    } = props;

    const [meta, setMeta] = useState({
        invalid: false,
        touched: false,
        error: null,
        warning: warning
    });

    useEffect(() => {
        if (showRequired) {
            setMeta((prevMeta) => ({ ...prevMeta, warning: 'Required' }));
        }
        if (errorMessage) {
            setMeta((prevMeta) => ({
                ...prevMeta,
                error: isArray(errorMessage) ? errorMessage[0] : errorMessage
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


    const handleChange = useCallback(
        (event) => {
            setMeta((prevMeta) => ({
                ...prevMeta,
                error: null,
                warning: required && !event.target.value ? 'Required' : null,
                invalid: false,
                touched: true
            }));
            onChange(event.target);
        },
        [onChange, required]
    );

    const handleInvalid = useCallback((e) => {
        setMeta(prevMeta => {
            if(required && !e.target.value) {
                return {...prevMeta, warning: 'Required', error: null};
            }
            return {...prevMeta, invalid: true, error: 'Invalid'};
        });
        onInvalid?.(e);
    }, [meta, onInvalid, required]);

    return (
        <Wrapper {...wrapperProps}>
            <textarea
                className={cs(className, styles.textarea, {
                    [styles.textareaWarning]: meta.warning,
                    [styles.textareaError]: meta.error,
                    required,
                    disabled
                })}
                rows={4}
                onChange={handleChange}
                onInvalid={handleInvalid}
                required={required}
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

TextareaInput.propTypes = propTypes;
TextareaInput.defaultProps = defaultProps;

export default TextareaInput;
