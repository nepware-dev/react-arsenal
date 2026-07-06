import * as React from 'react';

export interface CheckboxInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    className?: string;
    size?: number | string;
    value?: string;
    required?: boolean;
    warning?: string;
    showRequired?: boolean;
    disabled?: boolean;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    onChange?: (arg0: HTMLInputElement) => void;
    errorMessage?: any;
    info?: string;
    /*
        Requires inputRef to be passed to set indeterminate state
    */
    indeterminate?: boolean;
    checkboxClassName?: string;
    ref?: React.RefObject<HTMLInputElement | null>;
}

