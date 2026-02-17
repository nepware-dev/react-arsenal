import { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';

import styles from './styles.module.scss';
import type { AccordionProps, RenderAccordionHeader } from './types';
import cs from '../../cs';
import useControlledState from '../../hooks/useControlledState';

const Accordion: React.FC<AccordionProps> = (props) => {
    const {
        isExpandedByDefault = false,
        isExpanded,
        title,
        children,
        className,
        activeClassName,
        renderHeader,
        titleClassName,
    } = props;

    const content = useRef<HTMLDivElement>(null);

    const [active, setActive] = useControlledState(isExpandedByDefault, {
        value: isExpanded,
    });

    const [contentHeight, setContentHeight] = useState('0px');

    const toggleAccordion = useCallback(() => setActive(!active), [active, setActive]);

    useEffect(() => {
        if (active && content.current) {
            setContentHeight(`${content.current.scrollHeight}px`);
        } else {
            setContentHeight('0px');
        }
    }, [active, children]);

    return (
        <div className={cs(styles.accordionSection, className, active && activeClassName)}>
            <div className={styles.accordion} onClick={toggleAccordion}>
                {renderHeader ? (
                    renderHeader({ isExpanded: active })
                ) : (
                    <div className={cs(styles.accordionTitle, titleClassName)}>
                        {title}
                        <FiChevronRight
                            className={cs(styles.rightIcon, { [styles.rotateUp]: active })}
                        />
                    </div>
                )}
            </div>
            <div
                ref={content}
                style={{ maxHeight: contentHeight }}
                className={cs(styles.accordionContent, {
                    [styles.accordionContentActive]: active,
                })}
            >
                {children}
            </div>
        </div>
    );
};

export default Accordion;

export type { AccordionProps, RenderAccordionHeader };
