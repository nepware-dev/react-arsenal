import React from 'react';

export interface PopupProps<T> {
    anchor: React.RefObject<T>;
    anchorOrigin?: 'top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center';
transformOrigin?: 'top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center';
    children?: React.ReactNode;
    className?: string,
    closeOnOutsideClick?: boolean;
    onClose: React.MouseEventHandler;
};

declare const Popup;

export default Popup;
