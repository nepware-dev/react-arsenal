import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    ref?: React.Ref<HTMLButtonElement>;
    success?: boolean;
    warning?: boolean;
    danger?: boolean;
    outline?: boolean;
}
