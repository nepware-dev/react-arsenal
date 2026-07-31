import React from 'react';

export type OriginPosition =
    | 'top left'
    | 'top center'
    | 'top right'
    | 'bottom left'
    | 'bottom center'
    | 'bottom right'
    | 'center left'
    | 'center center'
    | 'center right';

export interface PopupProps<T extends HTMLElement | null> {
    /**
     * Component or element that acts as anchor/base point for the popup
     */
    anchor: React.RefObject<T>;
    /**
     * Anchor position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for anchor position reference check https://mui.com/components/popover/
     */
    anchorOrigin?: OriginPosition;
    /**
     * Transform position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for transform position reference check https://mui.com/components/popover/
     */
    transformOrigin?: OriginPosition;
    /**
     * Content of the popup
     */
    children?: React.ReactNode;
    /**
     * Classname applied to container element
     */
    className?: string;
    /**
     * Auto close popup when user clicks outside the popup
     */
    closeOnOutsideClick?: boolean;
    /**
     * Auto close popup when user presses escape key
     */
    closeOnEscape?: boolean;
    /**
     * DOM node the popup is portalled into
     * Defaults to document.body
     */
    container?: Element | DocumentFragment;
    /**
     * Disable focus capture
     */
    disableFocusLock?: boolean;
    /**
     * Function to run when close is called
     */
    onClose?: (event: MouseEvent | KeyboardEvent) => void;
}
