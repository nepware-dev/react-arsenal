import React from 'react';
import {useTabContext} from './TabContext';

const TabContent = React.forwardRef((props, ref) => {
    const {active, mode} = useTabContext(props);

    if(mode !== 'scroll' && !active) {
        return null;
    }

    return <div ref={ref} {...props} />;
});

export default TabContent;
