import React, {useCallback, useMemo, useState} from 'react';
import PropTypes from 'prop-types';

import {getErrorMessage} from '../../utils/error';

import Label from './Label';
import FormContext, {useFormContext} from './FormContext';

const getChildren = children => React.Children.toArray(children);

const noop = () => {};
const defaultValueExtractor = item => item.value;

const getInputFields = (childComponents) => {
    return childComponents.reduce((acc, curValue) => {
        if(curValue.type===InputField) {
            return (acc[curValue.props.name]=curValue.props.defaultValue, acc);
        }
        return acc;
    }, {});
};

const getRequiredFields = (childComponents) => {
    return childComponents.filter(child => child.type===InputField && child.props.required).map(el => el.props.name);
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
        onChange,
        onChangeData,
        emptyFields,
        fieldValueExtractor = defaultValueExtractor,
        ...inputProps
    } = useFormContext(props);

    const handleChange = useCallback((payload) => {
        onChange && onChange(payload);

        let name, value;
        if(payload?.nativeEvent instanceof Event) {
            name = payload.target.name;
            value = payload.target.value;
        } else {
            name = payload.name;
            value = fieldValueExtractor(payload);
        }
        const updatedData = {
            ...formData,
            [name]: value,
        };
        setFormData(updatedData);
        onChangeData(updatedData);
    }, [setFormData, formData, onChangeData, fieldValueExtractor]);

    const fieldProps = {
        onChange: handleChange,
        ...inputProps
    };
    if (typeof Component!=='string') {
        fieldProps.errorMessage = error?.[inputProps.name];
        fieldProps.warning = warning?.[inputProps.name];
        fieldProps.showRequired = emptyFields.some(field => field===inputProps.name);
    }

    return (
        <div className={containerClassName}>
            {!!label && <Label className={labelClassName}>{label}</Label>}
            <Component {...fieldProps} />
        </div>
    );
};

const Form = (props) => {
    const {
        children, 
        onSubmit = noop,
        onChangeData = noop,
        error,
        warning,
        formErrorClassName,
        ...formProps
    } = props;

    const _children = React.useMemo(() => getChildren(children), [children]);
    const initialData = React.useMemo(() => getInputFields(_children), [_children]);
    const requiredFields = React.useMemo(() => getRequiredFields(_children), [_children]);

    const [formData, setFormData] = useState(initialData);
    const [emptyFields, setEmptyFields] = useState([]);

    const handleSubmitForm = useCallback((event) => {
        event.preventDefault();
        const emptyFields = requiredFields.filter(field => !formData[field]);
        if(emptyFields.length!==0) {
            return setEmptyFields(emptyFields);
        }
        setEmptyFields([]);
        onSubmit(formData);
    }, [onSubmit, formData, requiredFields]);

    const formContext = useMemo(() => ({
        error,
        warning,
        formData,
        setFormData,
        onChangeData,
        emptyFields,
    }), [error, warning, formData, emptyFields, onChangeData]);

    const hasFormError = useMemo(() => {
        if(!error) {
            return false;
        }
        for(let key of Object.keys(initialData)) {
            if(error[key]) {
                return false;
            }
        }
        return true;
    }, [initialData, error]);

    return (
        <FormContext.Provider value={formContext}>
            <form {...formProps} onSubmit={handleSubmitForm}>
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
};

Form.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChangeData: PropTypes.func,
    error: PropTypes.any,
    formErrorClassName: PropTypes.string,
    warning: PropTypes.any,
};

export default Form;

