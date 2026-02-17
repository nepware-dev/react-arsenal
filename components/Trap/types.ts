export interface TrapProps {
    children: React.ReactNode;
    onCatchError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface TrapState {
    error: Error | false;
    errorInfo: React.ErrorInfo | null;
}
