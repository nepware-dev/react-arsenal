import React, {useImperativeHandle, useCallback, useRef, useMemo, useEffect, useState} from 'react';

import useControlledState from '../../../hooks/useControlledState';
import {getErrorMessage} from '../../../utils/error';

import {FormContext, InputGroupContext, useFormContext, useInputGroupContext} from './FormContext';
import Label from '../Label';

const defaultValueExtractor = item => item.value;

const InputGroup = (props) => {
    const {name, children} = useInputGroupContext(props);

    const inputGroupContext = useMemo(() => {
        return {name};
    }, [name]);

    return (
        <InputGroupContext.Provider value={inputGroupContext}>
            {children}
        </InputGroupContext.Provider>
    );
};

const Input = (props) => {
    const {
        error,
        component: Component,
        formData,
        onChange,
        formValueExtractor,
        fieldValueExtractor,
        containerClassName,
        inputContainerClassName,
        labelClassName,
        label,
        standaloneName,
        fields,
        addField,
        removeField,
        showRequiredFields,
        ...inputProps
    } = useInputGroupContext(props);

    const inputFieldRef = useRef(null);
    const inputRef = useRef(null);
    const [showRequired] = useControlledState(false, {value: showRequiredFields});

    const handleChange = useCallback((payload, ...otherArgs) => {
        onChange && onChange(payload, ...otherArgs);
        if(!standaloneName) {
            return;
        }

        let name = inputProps.name;
        let value;
        if (fieldValueExtractor) {
            value = fieldValueExtractor(payload, ...otherArgs);
        } else if (payload?.nativeEvent instanceof Event) {
            value = payload.target.value;
        } else {
            value = defaultValueExtractor(payload);
        }
        formData.set(name, value);
    }, [formData, onChange, fieldValueExtractor, inputProps, standaloneName]);

    useEffect(() => {
        if(standaloneName) {
            let value = inputProps.value ?? inputProps.defaultValue ?? null;
            if(formValueExtractor) {
                value = value ? formValueExtractor(value) : value;
            } else if(inputProps.valueExtractor) {
                value = value ? inputProps.valueExtractor(value) : value;
            };
            addField({
                name: inputProps.name,
                field: {
                    name: inputProps.name,
                    required: inputProps.required,
                    ref: inputFieldRef.current
                }
            });
            formData.set(inputProps.name, value);
            return () => {
                removeField(inputProps.name);
                formData.delete(inputProps.name);
            }
        }
    }, [
        formData,
        inputProps.name,
        inputProps.required,
        inputProps.value,
        inputProps.defaultValue,
        inputProps.valueExtractor,
        formValueExtractor,
        standaloneName,
    ]);

    const handleInvalidSubmit = useCallback(() => {
        inputRef.current.focus();
    }, []);

    useImperativeHandle(inputFieldRef, () => ({
        onInvalidSubmit: handleInvalidSubmit,
    }), [handleInvalidSubmit]);

    const fieldProps = useMemo(() => {
        const value = formData.get(inputProps.name);
        if(
            typeof Component !== 'string') {
            return {
                ...inputProps,
                showRequired: (
                    inputProps.required && 
                    (!value || ['undefined', 'null'].includes(value))
                ) ? showRequired : false,
                errorMessage: error?.[inputProps.name],
            };
        }
        return inputProps;
    }, [Component, inputProps, showRequired, formData, error]);

    return (
        <div ref={inputRef} className={containerClassName} style={{outline: 'none'}} tabIndex={-1}>
            {Boolean(label) && (
                <Label className={labelClassName}>
                    {label}
                </Label>
            )}
            <Component
                {...fieldProps}
                containerClassName={inputContainerClassName}
                onChange={handleChange}
            />
        </div>
    );
};

const Form = React.forwardRef((props, ref) => {
    const {
        children,
        onSubmit,
        error,
        formErrorClassName,
        onInvalidSubmit,
        ...formProps
    } = props;

    const formRef = useRef();

    const [showRequiredFields, setShowRequiredFields] = useState(false);
    const [fields, setFields] = useState({});

    const addField = useCallback(fieldObj => {
        setFields(fs => {
            if(!fs[fieldObj.name]) {
                const newFields = {...fs, [fieldObj.name]: fieldObj.field};
                return {...newFields};
            }
            return fs;
        });
    }, []);

    const removeField = useCallback(fieldName => {
        setFields(fs => {
            if(fs[fieldName]) {
                const newFields = {...fs};
                delete newFields[fieldName];
                return {...newFields};
            }
            return fs;
        });
    }, []);

    const formDataObject = useRef(new FormData());
    const formData = useMemo(() => formDataObject.current, [formDataObject.current]);

    const handleSubmitForm = useCallback((evnt) => {
        evnt.preventDefault();
        for(const [key, value] of formData) {
            if(fields[key] && fields[key].required && (!value || ['undefined', 'null'].includes(value))) {
                fields[key].ref.onInvalidSubmit();
                onInvalidSubmit?.('required');
                setShowRequiredFields(true);
                return;
            }
        }
        onSubmit(formData);
    }, [formData, fields, onInvalidSubmit]);

    const formContext = useMemo(() => {
        return {
            formData,
            fields,
            addField,
            removeField,
            showRequiredFields,
            error,
        };
    }, [formData, fields, addField, removeField, showRequiredFields, error]);

    const hasFormError = useMemo(() => {
        if(!error) {
            return false;
        }
        for(let key of Object.keys(fields)) {
            if(error[key]) {
                return false;;
            }
        }
        return true;
    }, [fields, error]);

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return formData;
        },
        nativeForm: formRef.current,
    }), [formData]);

    return (
        <FormContext.Provider value={formContext}>
            <form ref={formRef} noValidate {...formProps} onSubmit={handleSubmitForm}>
                {children}
            </form>
            {hasFormError && (
                <div className={formErrorClassName}>
                    <span>{getErrorMessage(error)}</span>
                </div>
            )}
        </FormContext.Provider>
    );
});

Form.InputGroup = InputGroup;
Form.Input = Input;

export default Form;
