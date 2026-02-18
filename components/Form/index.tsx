import React, {
    type ComponentType,
    type ComponentProps,
    useImperativeHandle,
    useCallback,
    useRef,
    useMemo,
    useEffect,
    useState,
} from 'react';

import { FormContext, InputGroupContext, useInputGroupContext } from './FormContext';
import type { FormInputGroupProps, FormInputProps, FormProps, InputFieldRefHandle } from './types';
import Label from './Label';
import useControlledState from '../../hooks/useControlledState';
import { getErrorMessage } from '../../utils/error';

const defaultValueExtractor = (item: any) => item.value;

function InputGroup(props: FormInputGroupProps) {
    const { name, children } = useInputGroupContext(props);

    const inputGroupContext = useMemo(() => {
        return { name };
    }, [name]);

    return (
        <InputGroupContext.Provider value={inputGroupContext}>
            {children}
        </InputGroupContext.Provider>
    );
}

const Input = <T extends ComponentType<any>>(props: FormInputProps<T>) => {
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
        addField,
        removeField,
        showRequiredFields,
        onFormChange,
        ...inputProps
    } = useInputGroupContext(props);

    const inputFieldRef = useRef<InputFieldRefHandle>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const [showRequired] = useControlledState(false, { value: showRequiredFields });

    const handleChange = useCallback(
        (...changeProps: Parameters<ComponentProps<T>['onChange']>) => {
            const [payload, ...otherArgs] = changeProps;
            onChange && onChange(payload, ...otherArgs);
            if (!standaloneName) {
                return;
            }

            let name = inputProps.name;
            let value;
            if (fieldValueExtractor) {
                value = fieldValueExtractor(payload, ...otherArgs);
            } else if ((payload as any)?.nativeEvent instanceof Event) {
                value = (payload as any).target.value;
            } else {
                value = defaultValueExtractor(payload);
            }
            formData.set(name, value);
            onFormChange(inputProps);
        },
        [formData, onChange, fieldValueExtractor, inputProps, standaloneName],
    );

    useEffect(() => {
        if (standaloneName) {
            let value = inputProps.value ?? inputProps.defaultValue ?? null;
            if (formValueExtractor) {
                value = value ? formValueExtractor(value) : value;
            } else if (inputProps.valueExtractor) {
                value = value ? inputProps.valueExtractor(value) : value;
            }
            addField({
                name: inputProps.name,
                field: {
                    required: inputProps.required,
                    ref: inputFieldRef.current,
                },
            });
            formData.set(inputProps.name, value || '');
            return () => {
                removeField(inputProps.name);
                formData.delete(inputProps.name);
            };
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
        inputRef.current?.focus();
    }, []);

    useImperativeHandle(
        inputFieldRef,
        () => ({
            onInvalidSubmit: handleInvalidSubmit,
        }),
        [handleInvalidSubmit],
    );

    const fieldProps = useMemo(() => {
        const commonProps = {
            containerClassName: inputContainerClassName,
            onChange: handleChange,
        };
        const value = formData.get(inputProps.name);
        if (typeof Component !== 'string') {
            return {
                ...inputProps,
                showRequired:
                    inputProps.required &&
                    (!value || (typeof value === 'string' && ['undefined', 'null'].includes(value)))
                        ? showRequired
                        : false,
                errorMessage: error?.[inputProps.name],
                ...commonProps,
            } as ComponentProps<T>;
        }
        return { ...inputProps, ...commonProps } as ComponentProps<T>;
    }, [Component, inputProps, showRequired, formData, error, handleChange]);

    return (
        <div
            ref={inputRef}
            className={containerClassName}
            style={{ outline: 'none' }}
            tabIndex={-1}
        >
            {Boolean(label) && <Label className={labelClassName}>{label}</Label>}
            <Component {...fieldProps} />
        </div>
    );
};

function Form<T, V>(props: FormProps<T, V>) {
    const {
        children,
        onSubmit,
        onChange,
        error,
        formErrorClassName,
        onInvalidSubmit,
        defaultFormData,
        ref,
        ...formProps
    } = props;

    const formRef = useRef<HTMLFormElement>(null);

    const [showRequiredFields, setShowRequiredFields] = useState(false);
    const fieldsObject = useRef<{ [key: string]: { ref: any; required?: boolean } }>({});

    const addField = useCallback(
        (fieldObj: { name: string; field: { ref: any; required?: boolean } }) => {
            if (!fieldsObject.current[fieldObj.name]) {
                fieldsObject.current[fieldObj.name] = fieldObj.field;
            }
        },
        [],
    );

    const removeField = useCallback((fieldName: string) => {
        if (fieldsObject.current[fieldName]) {
            delete fieldsObject.current[fieldName];
        }
    }, []);

    const formDataObject = useRef(defaultFormData || new FormData());
    const formData = useMemo(() => formDataObject.current, [formDataObject.current]);

    const handleSubmitForm = useCallback(
        (evnt: React.FormEvent<HTMLFormElement>) => {
            evnt.preventDefault();
            for (const [key, value] of formData) {
                if (
                    fieldsObject.current[key] &&
                    fieldsObject.current[key].required &&
                    (!value || (typeof value === 'string' && ['undefined', 'null'].includes(value)))
                ) {
                    fieldsObject.current[key].ref.onInvalidSubmit();
                    onInvalidSubmit?.('required');
                    setShowRequiredFields(true);
                    return;
                }
            }
            onSubmit?.(formData);
        },
        [formData, onInvalidSubmit, onSubmit],
    );

    const handleFormChange = useCallback(
        (payload: any) => {
            if (payload?.target) {
                if (!payload.target.name) {
                    return;
                }
                return onChange?.(payload);
            }
            if (onChange) {
                return onChange({ ...payload, formData });
            }
        },
        [formData, onChange],
    );

    const formContext = useMemo(() => {
        return {
            formData,
            addField,
            removeField,
            showRequiredFields,
            error,
            onFormChange: handleFormChange,
        };
    }, [formData, addField, removeField, showRequiredFields, error, handleFormChange]);

    const hasFormError = useMemo(() => {
        if (!error) {
            return false;
        }
        for (let key of Object.keys(fieldsObject.current)) {
            if (error[key]) {
                return false;
            }
        }
        return true;
    }, [error]);

    useImperativeHandle(
        ref,
        () => ({
            getFormData: () => {
                return formData;
            },
            nativeForm: formRef.current,
        }),
        [formData],
    );

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
}

Form.InputGroup = InputGroup;
Form.Input = Input;

export default Form;

export * from './types';
