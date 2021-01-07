import React, {useCallback} from 'react';
import {useTabContext} from './TabContext';

import cs from '../../cs';
import styles from './styles.module.scss';

const TabHeader = (props) => {
    const {title, index, className, activeClassName, active, selectTab, ...childProps} = useTabContext(props);

    const handleClick = useCallback((e) => {
        selectTab && selectTab(e, index);
    }, [index, selectTab]);

    if(!title) {
        return null;
    }

    return (
        <div className={cs(styles.headerItem, className, {
            [styles.headerItemActive]: active,
            [activeClassName]: active
        })} onClick={handleClick} {...childProps}>
            {title}
        </div>
    );
};

export default TabHeader;
