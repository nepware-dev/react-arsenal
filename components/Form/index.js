import React, {useCallback, useMemo, useState} from 'react';

import Label from './Label';
import FormContext, {useFormContext} from './FormContext';

const getChildren = children => React.Children.toArray(children);

const noop = () => {};

const getInputFields = (childComponents) => {
    return childComponents.reduce((acc, curValue) => {
        if(curValue.type.name==='InputField') {
            return (acc[curValue.props.name]='', acc);
        }
        return acc;
    }, {});
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
        ...inputProps
    } = useFormContext(props);

    const handleChange = useCallback((payload) => {
        let name, value;
        if(payload?.nativeEvent instanceof Event) {
            name = payload.target.name;
            value = payload.target.value;
        } else {
            name = payload.name;
            value = payload.value;
        }
        const updatedData = {
            ...formData,
            [name]: value,
        };
        setFormData(updatedData);
        onChangeData(updatedData);
    }, [setFormData, formData]);

    return (
        <div className={containerClassName}>
            {!!label && <Label className={labelClassName}>{label}</Label>}
            <Component 
                errorMessage={error?.[inputProps.name]}
                warning={warning?.[inputProps.name]}
                onChange={onChange ? onChange : handleChange}
                {...inputProps} 
            />
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
        ...formProps
    } = props;

    const _children = React.useMemo(() => getChildren(children), [children]);
    const initialData = React.useMemo(() => getInputFields(_children), [_children]);

    const [formData, setFormData] = useState(initialData);

    const handleSubmitForm = useCallback((event) => {
        event.preventDefault();
        onSubmit(formData);
    }, [onSubmit, formData]);

    const formContext = useMemo(() => ({
        error,
        warning,
        formData,
        setFormData,
        onChangeData,
    }), [error, warning, formData]);

    return (
        <FormContext.Provider value={formContext}>
            <form {...formProps} onSubmit={handleSubmitForm}>
                {_children}
            </form>
        </FormContext.Provider>
    );
};

export default Form;

