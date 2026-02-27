export interface TextareaInputProps extends Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange'
> {
    containerClassName?: string;
    inputRef?: React.Ref<HTMLTextAreaElement>;
    errorMessage?: string | string[];
    textClassName?: string;
    warning?: string;
    info?: string;
    showRequired?: boolean;
    onChange?: (target: HTMLTextAreaElement) => void;
    onInvalid?: (event: React.FormEvent<HTMLTextAreaElement>) => void;
}

export interface TextareaMeta {
    invalid: boolean;
    touched: boolean;
    error: string | null;
    warning?: string | null;
}
