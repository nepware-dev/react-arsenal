import * as React from 'react';

export interface CheckboxInputProps {
    className?: string;
    size?: number | string;
    value?: string;
    required?: boolean;
    warning?: boolean;
    showRequired?: boolean;
    disabled?: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
    onChange?: (payload: {name: string; value?: string}) => void;
    errorMessage?: any;
    info?: string;
}

declare const CheckboxInput;

export default CheckboxInput;
