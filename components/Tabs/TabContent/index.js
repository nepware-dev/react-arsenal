import React from 'react';
import {useTabContext} from '../TabContext';

const TabContent = React.forwardRef((props, ref) => {
    const {active, mode, disableUnmount} = useTabContext(props);

    if(mode !== 'scroll' && !active && !disableUnmount) {
        return null;
    }

    return (
        <div
            style={disableUnmount && !active && mode!=='scroll' ? {
                display: 'none'
            } : {}}
            ref={ref}
            {...props}
        />
    );
});

TabContent.displayName = 'TabContent';

export default TabContent;
