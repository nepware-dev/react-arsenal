import React from 'react';

export interface ModalProps {
    children: React.ReactNode;
    className?: string;
    overlayClassName?: string;
    closeOnEscape?: boolean;
    closeOnOutsideClick?: boolean;
    disableFocusLock?: boolean;
    onClose?: (payload?: {outsideClick?: boolean}) => void;
    isVisible?: boolean;
};

declare const Modal;

export default Modal;
