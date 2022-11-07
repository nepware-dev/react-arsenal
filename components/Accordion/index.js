import React, {useRef, useCallback, useState} from 'react';
import PropTypes from 'prop-types';

import {FiChevronRight} from 'react-icons/fi';

import cs from '../../cs';
import styles from './styles.module.scss';

const propTypes = {
    /*
     * Title of the accordion. Is clickable and opens the content.
     * Not used when renderHeader is passed.
     */
    title: PropTypes.string,
    /*
     * Custom renderer for the accordion header.
     * Called with isExpanded denoting whether accordion content is currently visible or not.
     */
    renderHeader: PropTypes.func,
    /*
     * Class applied to the container for the accordion.
     */
    className: PropTypes.string,
    /*
     * Class applied to the expanded accordion.
     */
    activeClassName: PropTypes.string,
    /*
     * Class applied to the title of the accordion when not custom rendered.
     */
    titleClassName: PropTypes.string,
    children: PropTypes.any,
};

const Accordion = (props) => {
    const {
        title, 
        children, 
        className, 
        activeClassName,
        renderHeader,
        titleClassName,
    } = props;

    const [active, setActive] = useState(false);
    const [height, setHeight] = useState('0px');

    const content = useRef();

    const toggleAccordion = useCallback(() => {
        setHeight(active ? '0px' : `${content.current.scrollHeight}px`);
        setActive(!active);
    }, [active]);

    return (
        <div className={cs(styles.accordionSection, className, active && activeClassName)}>
            <div className={styles.accordion} onClick={toggleAccordion}>
                {renderHeader ? renderHeader({isExpanded: active}) : (
                    <div className={cs(styles.accordionTitle, titleClassName)}>
                        {title}
                        <FiChevronRight 
                            className={cs(styles.rightIcon, {[styles.rotateUp]: active})} 
                        />
                    </div>
                )}
            </div>
            <div
                ref={content}
                style={{maxHeight: height}}
                className={cs(styles.accordionContent, {
                    [styles.accordionContentActive]: active
                })}
            >
                {children}
            </div>
        </div>
    );
};

Accordion.propTypes = propTypes;

export default Accordion;
