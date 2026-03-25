export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    containerClassName?: string;
    textClassName?: string;
    warning?: string;
    showRequired?: boolean;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    ref?: React.RefObject<HTMLInputElement | null>;
    onChange?: (target: HTMLInputElement) => void;
    errorMessage?: any;
    info?: string;
}
