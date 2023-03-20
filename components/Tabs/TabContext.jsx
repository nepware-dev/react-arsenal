import React, {useContext} from 'react';

const TabContext = React.createContext(null);

export function useTabContext(props) {
    const context = useContext(TabContext);

    const {activeTab, selectTab} = context;

    return {
        ...props,
        active: props.active
            ? props.active
            : activeTab && activeTab === props.label,
        selectTab
    };
}

export default TabContext;
