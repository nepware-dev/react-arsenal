import type { PropsWithChildren, ReactNode } from 'react';

export type RenderAccordionHeader = (arg: {isExpanded: boolean}) => ReactNode;

export interface AccordionProps extends PropsWithChildren {
    /*
     * Title of the accordion. Is clickable and opens the content.
     * Not used when renderHeader is passed.
     */
    title?: string;
    /*
     * Custom renderer for the accordion header.
     * Called with isExpanded denoting whether accordion content is currently visible or not.
     */
    renderHeader?: RenderAccordionHeader;
    /*
     * Class applied to the container for the accordion.
     */
    className?: string;
    /*
     * Class applied to the expanded accordion.
     */
    activeClassName?: string;
    /*
     * Class applied to the title of the accordion when not custom rendered.
     */
    titleClassName?: string;
    /*
     * Indicates default state of the accordion.
     * Does not take affect if accordion is controlled.
     */
    isExpandedByDefault?: boolean;
    /*
     * Controlled boolean indicating if the accordion is expanded.
     * If controlled, this value overrides the default state.
     */
    isExpanded?: boolean;
}
