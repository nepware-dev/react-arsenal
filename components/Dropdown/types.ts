import type { PropsWithChildren } from 'react';

export interface DropdownProps extends PropsWithChildren {
    /**
     * Label to be used for dropdown.
     */
    label?: string;
    /**
     * Custom renderer for the dropdown label component.
     */
    renderLabel?: () => React.ReactNode;
    /**
     * Classname for the dropdown content.
     */
    className?: string;
    /**
     * Classname for the label container.
     */
    labelContainerClassName?: string;
    /**
     * Classname for the dropdown content container.
     */
    contentContainerClassName?: string;
    /**
     * (left | center | right) - Decides which way the dropdown content is aligned compared to the label.
     */
    align?: 'left' | 'center' | 'right';
    /**
     * Whether or not the dropdown content is displayed on hovering the label.
     */
    showOnHover?: boolean;
    /**
     * Change the behavior of the dropdown to hide on document click.
     * Setting this to false will capture the event from bubbling, and does not hide the dropdown on clicking within it.
     *    true (default) - Dropdown event handler is executed in the capturing phase.
     *    false - Dropdown event handler is executed in the bubbling phase.
     */
    useCapture?: boolean;
}
