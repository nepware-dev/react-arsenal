import React, { useContext } from 'react';

import type { TabProps } from './types';

export interface TabContextType {
    activeTab: string;
    selectTab: (e: { currentTarget: Element }, index: number) => void;
}

const TabContext = React.createContext<TabContextType>({
    activeTab: '',
    selectTab: () => {},
});

export function useTabContext<T extends Pick<TabProps, 'label' | 'active'>>(props: T) {
    const context = useContext(TabContext);

    const { activeTab, selectTab } = context;

    return {
        ...props,
        active: props.active ? props.active : activeTab && activeTab === props.label,
        activeTab,
        selectTab,
    };
}

export default TabContext;
