import * as React from 'react';

export interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    size?: number | string;
    value?: string;
    required?: boolean;
    warning?: boolean;
    showRequired?: boolean;
    disabled?: boolean;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    onChange?: (HTMLInputElement) => void;
    errorMessage?: any;
    info?: string;
    indeterminate?: boolean;
    checkboxClassName?: string;
}

declare const CheckboxInput;

export default CheckboxInput;
