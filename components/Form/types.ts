import React, {
    type ComponentProps,
    type ComponentType,
    type HTMLAttributes,
    type PropsWithChildren,
} from 'react';

type Override<T, U> = Omit<T, keyof U> & U;

export type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type CustomFormChangeEvent = HTMLAttributes<HTMLInputElement> & {
    formData: FormData;
};

export type FormSubmitCallback = (formData: FormData) => Promise<void> | void;
export type FormInvalidCallback = (reason: string) => void;
export type FormChangeCallback = (payload: InputChangeEvent | CustomFormChangeEvent) => void;

export type FormFieldValueExtractor<T, V> = (arg: T) => V;

export interface FormInputGroupProps {
    name: string;
    children: React.ReactNode;
}

export type FormRefHandle = {
    getFormData: () => FormData;
    nativeForm: HTMLFormElement | null;
};

export interface FormProps<T, V>
    extends
        PropsWithChildren,
        Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onChange'> {
    onSubmit?: FormSubmitCallback;
    error?: any;
    onInvalidSubmit?: FormInvalidCallback;
    formErrorClassName?: string;
    fieldValueExtractor?: FormFieldValueExtractor<T, V>;
    onChange?: FormChangeCallback;
    defaultFormData?: FormData;
    ref?: React.Ref<FormRefHandle>;
}

export interface FormContextType {
    formData: FormData;
    addField: (args: { name: string; field: { ref: any; required?: boolean } }) => void;
    removeField: (name: string) => void;
    showRequiredFields: boolean;
    error?: any;
    onFormChange: (payload: any) => any;
}

export interface InputGroupContextType {
    name: string;
}

export interface InputFieldRefHandle {
    onInvalidSubmit: () => void;
}

type InputComponentProps<T extends ComponentType<any>> = {
    component: T;
    name: string;
    label?: string;
    required?: boolean;
    formValueExtractor?: FormFieldValueExtractor<ComponentProps<T>['value'], string | Blob>;
    fieldValueExtractor?: ComponentProps<T>['onChange'];
    containerClassName?: string;
    inputContainerClassName?: string;
    labelClassName?: string;
    children?: React.ReactNode;
};

export type FormInputProps<T extends ComponentType<any>> = Override<
    ComponentProps<T>,
    InputComponentProps<T>
>;
