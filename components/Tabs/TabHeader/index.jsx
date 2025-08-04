import React, { useCallback, useEffect, useRef } from 'react';
import { useTabContext } from '../TabContext';

import cs from '../../../cs';
import styles from './styles.module.scss';

const TabHeader = (props) => {
    const {
        title,
        renderHeader,
        index,
        className,
        activeClassName,
        active,
        selectTab,
        ...childProps
    } = useTabContext(props);

    const tabRef = useRef(null);

    const handleClick = useCallback((e) => {
        selectTab && selectTab(e, index);
    }, [index, selectTab]);

    useEffect(() => {
        if (active && tabRef.current && tabRef.current.scrollIntoView) {
            tabRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [active]);

    if (renderHeader) {
        return renderHeader({ title, index, active, onClick: handleClick, ...childProps });
    }

    if (!title) {
        return null;
    }

    return (
        <div
            ref={tabRef}
            className={cs(styles.headerItem, className, {
                [activeClassName]: active
            })}
            onClick={handleClick}
            {...childProps}
        >
            {title}
        </div>
    );
};

export default TabHeader;
