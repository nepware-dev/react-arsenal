import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onClick?: React.MouseEventHandler;
    success?: boolean;
    warning?: boolean;
    danger?: boolean;
    outline?: boolean;
    disabled?: boolean;
}

declare const Button;

export default Button;
