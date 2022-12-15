import * as React from 'react';

export type FormSubmitCallback = (formData: FormData) => void;
export type FormInvalidCallback = (reason: string) => void;

export type FormFieldValueExtractor<T,V> = (arg: T) => V;

export interface FormInputGroupProps {
    name: string;
    children: React.ReactNode;
}

export interface FormProps {
    children: React.ReactNode;
    onSubmit: FormSubmitCallback;
    error: any;
    onInvalidSubmit: FormInvalidCallback;
    formErrorClassName?: string;
    fieldValueExtractor: FormFieldValueExtractor;
}

declare const Form;
declare const Input;
declare const InputGroup;

Form.Input = Input;
Form.InputGroup = InputGroup;

export default Form;
