import React, {
    useCallback,
    useMemo,
    useState,
    useRef,
    useEffect,
    useImperativeHandle
} from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'events';

import {getErrorMessage} from '../../utils/error';

import Label from './Label';
import FormContext, {useFormContext} from './FormContext';

const noop = () => {};
const defaultValueExtractor = item => item.value;

const getChildren = children => React.Children.toArray(children);

const FormPropTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]).isRequired,
    /**
     * Function called when form is submitted.
     * @param {object} formData - Object containing the data of all input fields in the form.
     */
    onSubmit: PropTypes.func.isRequired,
    /**
     * Function called when any form data changes.
     * @param {object} formData - Object containing the data of all input fields in the form.
     */
    onChangeData: PropTypes.func,
    /**
     * Form Error.
     * If object contains a key having the name of one of the input fields, it is show on the input field.
     * If not, error messages is appended as the second-last child.
     */
    error: PropTypes.any,
    /**
     * Classname for the form error message.
     */
    formErrorClassName: PropTypes.string,
    /**
     * Form Warning.
     */
    warning: PropTypes.any,
    /**
     * Function called when form submit fails.
     * @param {string} reason - Reason for failing submission.
     */
    onInvalidSubmit: PropTypes.func,
};

const InputFieldPropTypes = {
    /**
     * Label of the input field.
     */
    label: PropTypes.string, 
    /**
     * Classname applied to the input field label.
     */
    labelClassName: PropTypes.string,
    /**
     * ClassName applied to the input field container.
     */
    containerClassName: PropTypes.string,
    /**
     * Classname passed as containerClassName for the input component within the input field.
     */
    inputContainerClassName: PropTypes.string,
    /**
     * The associated input's onChange callback.
     */
    onChange: PropTypes.func,
    /**
     * Value extractor for the input field.
     * Determines how the value is stored in the form data.
     * @param {any} item - Contains the target item of the input. 
     * Defaults to value key of the changed target item.
     */
    fieldValueExtractor: PropTypes.func,
    /**
     * The input component to be used.
     * Can be an existing HTML element as string, or a React Component.
     */
    component: PropTypes.elementType.isRequired,
    /**
     * The skip logic function for the current input.
     * @param {object} formData - Current data in the form.
     * @returns {boolean} - Whether the input field should be skipped or not.
     */
    skipCondition: PropTypes.func,
};

export const InputField = (props) => {
    const {
        error, 
        warning, 
        formData,
        setFormData,
        component: Component, 
        label, 
        labelClassName, 
        containerClassName,
        inputContainerClassName,
        onChange,
        onChangeData,
        emptyFields,
        fieldValueExtractor,
        registerField,
        skipCondition,
        eventEmitter,
        ...inputProps
    } = useFormContext(props);

    const fieldRef = useRef();

    const [componentProps, setComponentProps] = useState({});

    const handleChange = useCallback((payload, ...otherArgs) => {
        onChange && onChange(payload, ...otherArgs);

        let name = inputProps.name;
        let value;
        if(fieldValueExtractor) {
            value = fieldValueExtractor(payload, ...otherArgs);
        } else if(payload?.nativeEvent instanceof Event) {
            value = payload.target.value;
        } else {
            value = defaultValueExtractor(payload);
        }
        const updatedData = {
            ...formData,
            [name]: value,
        };
        setFormData(updatedData);
        onChangeData(updatedData);
    }, [setFormData, formData, onChangeData, fieldValueExtractor]);

    const fieldProps = inputProps;
    if (typeof Component!=='string') {
        fieldProps.errorMessage = error?.[inputProps.name];
        fieldProps.warning = warning?.[inputProps.name];
        fieldProps.showRequired = emptyFields.some(field => field===inputProps.name);
    }
    const shouldSkip = useMemo(() => {
        if(skipCondition) {
            const skipValue = skipCondition(formData);
            if(skipValue) {
                eventEmitter.emit('unregisterField', inputProps.name);
            }
            return skipValue;
        }
        return false;
    }, [formData, skipCondition, eventEmitter]);

    const handleEmptySubmit = useCallback((fieldName) => {
        fieldRef?.current?.focus();
    }, []); 

    if(shouldSkip) {
        return null;
    }

    return (
        <div ref={fieldRef} style={{outline: 'none'}} tabIndex={-1} className={containerClassName}>
            {!!label && <Label className={labelClassName}>{label}</Label>}
            <Component 
                {...registerField({...fieldProps, onEmpty: handleEmptySubmit})}
                containerClassName={inputContainerClassName}
                onChange={handleChange}
            />
        </div>
    );
};

InputField.propTypes = InputFieldPropTypes;

const Form = React.forwardRef((props, ref) => {
    const {
        children, 
        onSubmit = noop,
        onChangeData = noop,
        error,
        warning,
        formErrorClassName,
        onInvalidSubmit,
        ...formProps
    } = props;
    const _children = React.useMemo(() => getChildren(children), [children]);

    const internalFormRef = useRef();

    const eventEmitter = useRef(new EventEmitter());
    
    const [emptyFields, setEmptyFields] = useState([]);
    const [fields, setFields] = useState({});
    const [formData, setFormData] = useState({});
    
    const handleSubmitForm = useCallback((event) => {
        event.preventDefault();
        const emptyFields = Object.entries(fields).filter(([fieldName, field]) => field.required && !formData[fieldName]).map(([fieldName,]) => fieldName);
        if(emptyFields.length!==0) {
            fields[emptyFields[emptyFields.length - 1]]?.onEmpty?.();
            onInvalidSubmit?.('required');
            return setEmptyFields(emptyFields);
        }
        setEmptyFields([]);
        onSubmit(formData);
    }, [onSubmit, formData, fields, onInvalidSubmit]);

    const handleRegisterField = useCallback(field => {
        const {onEmpty, ...restField} = field;
        if(fields[field.name]) {
            return {...restField};
        }
        setFormData({...formData, [field.name]: field.defaultValue ?? null});
        setFields({...fields, [field.name]: field});
        return {...restField};
    }, [formData, fields]);

    const handleUnregisterField = useCallback(fieldName => {
        const newFields = {...fields};
        delete newFields[fieldName];
        setFields(newFields);
    }, [fields, formData]);

    useEffect(() => {
        eventEmitter.current.on('registerField', handleRegisterField);
        eventEmitter.current.on('unregisterField', handleUnregisterField);
        return () => {
            eventEmitter.current.off('registerField', handleRegisterField);
            eventEmitter.current.off('unregisterField', handleUnregisterField);
        }
    }, [handleRegisterField, handleUnregisterField]);

    useEffect(() => {
        const dataToRemove = Object.keys(formData).filter(fieldName => !fields[fieldName]);
        dataToRemove.forEach(dt => delete formData[dt]);
    }, [fields, formData]);

    const formContext = useMemo(() => {
        return {
            error,
            warning,
            formData,
            setFormData,
            onChangeData,
            emptyFields,
            eventEmitter: eventEmitter.current,
            register: handleRegisterField,
        };
    }, [error, warning, formData, emptyFields, onChangeData, handleRegisterField]);

    const hasFormError = useMemo(() => {
        if(!error) {
            return false;
        }
        for(let key of Object.keys(formData)) {
            if(error[key]) {
                return false;
            }
        }
        return true;
    }, [formData, error]);

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return formData;
        },
        reset: () => {
            if(internalFormRef.current) {
                internalFormRef.current.reset?.();
            }
        }
    }), [formData]);

    return (
        <FormContext.Provider value={formContext}>
            <form noValidate {...formProps} onSubmit={handleSubmitForm} ref={internalFormRef}>
                {_children.slice(0, -1)}
                {hasFormError && (
                    <div className={formErrorClassName}>
                        <span>{getErrorMessage(error) || 'An error occured! Please try again.'}</span>
                    </div>
                )}
                {_children.slice(-1)}
            </form>
        </FormContext.Provider>
    );
});

Form.propTypes = FormPropTypes;

export {useFormContext};
export default Form;
