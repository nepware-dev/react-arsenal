import React, {useContext} from 'react';

export const FormContext = React.createContext(null);
export const InputGroupContext = React.createContext(null);

export function useFormContext(props) {
    const context = useContext(FormContext);

    return {...props, ...context};
};

export function useInputGroupContext(props) {
    const formContext = useFormContext(props);
    const groupContext = useContext(InputGroupContext);

    if(!groupContext) {
        return {
            ...props,
            standaloneName: props.name,
            ...formContext            
        };
    }

    if(groupContext) {
        const {name: groupName} = groupContext;
        const {name: inputName, ...otherProps} = props;
        return {
            ...otherProps,
            ...formContext,
            name: groupName.concat(groupName.endsWith(']') ? '' : '.', inputName),
            standaloneName: inputName,
        };
    }
};
