import React, {useContext, useCallback, useRef} from 'react';

const FormContext = React.createContext(null);

export function useFormContext(props) {
    const context = useContext(FormContext);

    const {
        error, 
        warning, 
        formData, 
        setFormData, 
        onChangeData, 
        emptyFields, 
        eventEmitter,
        register,
    } = context;

    return {
        ...props,
        error,
        warning,
        formData,
        setFormData,
        onChangeData,
        emptyFields,
        registerField: register,
        eventEmitter,
    };
}

export default FormContext;
