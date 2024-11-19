import React from 'react';

export type OriginPosition = 'top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center';

export interface PopupProps<T> {
    anchor: React.RefObject<T | null>;
    anchorOrigin?: OriginPosition;
    transformOrigin?: OriginPosition;
    children?: React.ReactNode;
    className?: string,
    closeOnOutsideClick?: boolean;
    disableFocusLock?: boolean;
    onClose: React.MouseEventHandler;
};

declare const Popup;

export default Popup;
