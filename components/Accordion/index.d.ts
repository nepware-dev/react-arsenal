import React from 'react';

export interface AccordionProps {
    title: PropTypes.string,
    renderHeader: PropTypes.func,
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    titleClassName: PropTypes.string,
    children: PropTypes.any,
};

declare const Accordion;

export default Accordion;
