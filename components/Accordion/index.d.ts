import * as React from 'react';

export type RenderAccordionHeader = (arg: {isExpanded: boolean}) => React.ReactNode;

export interface AccordionProps {
    title: PropTypes.string,
    renderHeader: PropTypes.func,
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    titleClassName: PropTypes.string,
    children: PropTypes.any,
    renderHeader: RenderAccordionHeader,
};

declare const Accordion;

export default Accordion;
