import React, { useCallback, useEffect, useRef } from 'react';

import styles from './styles.module.scss';
import type { TabHeaderProps } from '../types';
import { useTabContext } from '../TabContext';
import cs from '../../../cs';

const TabHeader: React.FC<TabHeaderProps> = (props) => {
    const {
        title,
        renderHeader,
        index,
        className,
        activeClassName = '',
        active,
        selectTab,
        ...childProps
    } = useTabContext(props);

    const tabRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            selectTab && selectTab(e, index);
        },
        [index, selectTab],
    );

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
                [activeClassName]: active,
            })}
            onClick={handleClick}
            {...childProps}
        >
            {title}
        </div>
    );
};

export default TabHeader;
