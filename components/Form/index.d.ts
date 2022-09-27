import * as React from 'react';

export type FormDataObject = {[key: string]: any};

export type FormSubmitCallback = (formData: FormDataObject) => void;
export type FormDataChangeCallback = (formData: FormDataObject) => void;

export interface InputFieldProps<T, V> {
    label?: string; 
    labelClassName?: string; 
    containerClassName?: string;
    inputContainerClassName?: string;
    onChange?: (target: HTMLInputElement) => void;
    fieldValueExtractor?: (item: T) => V;
    component: React.ReactNode | string;
    skipCondition?: (formData: FormDataObject) => boolean;
}

export interface FormProps {
    children: React.ReactNode;
    onSubmit: FormSubmitCallback;
    onChangeData?: FormDataChangeCallback;
    onInvalidSubmit?: (reason: string) => void;
    error?: any;
    formErrorClassName?: string;
    warning?: string;
}

declare const InputField;
declare const Form;

export {InputField};
export default Form;
