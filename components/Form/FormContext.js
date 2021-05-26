import React, {useContext} from 'react';

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
    } = context;

    return {...props, error, warning, formData, setFormData, onChangeData, emptyFields};
}

export default FormContext;
