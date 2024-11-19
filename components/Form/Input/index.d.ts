import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    value?: string;
    required?: boolean;
    warning?: string;
    showRequired?: boolean;
    disabled?: boolean;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    onChange?: (target: HTMLInputElement) => void;
    errorMessage?: any;
    info?: string;
}

declare const Input;

export default Input;
