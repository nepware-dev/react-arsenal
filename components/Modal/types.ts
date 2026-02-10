import React from 'react';

export interface ModalProps {
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    disableFocusLock?: boolean;
    onClose?: (payload?: { outsideClick?: boolean; escape?: boolean }) => void;
    isVisible?: boolean;
}
