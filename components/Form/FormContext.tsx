import React, { type ComponentType, useContext } from 'react';

import type {
    FormContextType,
    FormInputGroupProps,
    InputGroupContextType,
    FormInputProps as InputProps,
} from './types';

export const FormContext = React.createContext<FormContextType | null>(null);
export const InputGroupContext = React.createContext<InputGroupContextType | null>(null);

type ContextMeta = {
    standaloneName: string;
    defaultValue?: string;
    name?: string;
};
type FormInputProps = InputProps<ComponentType<any>> | FormInputGroupProps;

type UseInputGroupContextResult<T extends FormInputProps> =
    T & FormContextType & ContextMeta;

export function useFormContext<T>(props: T) {
    const context = useContext(FormContext);

    if (!context) {
        throw new Error('Input components must be wrapped in a <Form />');
    }

    return { ...props, ...context };
}

export function useInputGroupContext<
    T extends FormInputProps,
>(props: T): UseInputGroupContextResult<T> {
    const formContext = useFormContext(props);
    const groupContext = useContext(InputGroupContext);
    const defaultValueExtractor = (inputName?: string) => {
        return (inputName && (formContext?.formData?.get(inputName) as string)) || '';
    };

    if (!groupContext) {
        return {
            ...props,
            standaloneName: props.name || '',
            defaultValue: defaultValueExtractor(props.name),
            ...formContext,
        };
    }

    const { name: groupName } = groupContext;
    const { name: inputName = '', ...otherProps } = props;

    const contextMeta = {
        name: groupName.concat(groupName.endsWith(']') ? '' : '.', inputName),
        standaloneName: inputName,
        defaultValue: defaultValueExtractor(inputName),
    };

    return {
        ...otherProps,
        ...formContext,
        ...contextMeta,
    };
}
