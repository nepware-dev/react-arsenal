import React, {useMemo, useCallback, useRef, useState} from 'react';

import List from '../List';
import TabContext from './TabContext';
import TabHeader from './TabHeader';
import TabContent from './TabContent';

import cs from '../../cs';
import styles from './styles.module.scss';

const getDefaultActiveTab = children => children?.[0]?.props?.label;

export const Tab = () => null;

export default (props) => {
    const {
        onChange,
        children,
        defaultActiveTab = getDefaultActiveTab(children),
        headerClassName,
        tabItemClassName,
        activeTabItemClassName,
        contentContainerClassName,
        mode = 'switch',
    } = props;

    const tabsRef = useRef();
    tabsRef.current = new Array(children.length);

    const [activeTab, setActiveTab] = useState(defaultActiveTab);

    const tabContext = useMemo(() => ({
        selectTab: (e, index) => {
            const selectedTab = e.target.getAttribute('label');
            onChange && onChange({activeTab: selectedTab, previousTab: tabContext.activeTab});
            setActiveTab(selectedTab);
            if(mode === 'scroll' && tabsRef.current[index]) {
                tabsRef.current[index].scrollIntoView({
                    behavior: 'smooth'
                });
            }
        },
        activeTab
    }), [activeTab, mode, onChange]);

    const renderTabHeader = useCallback(({item: child, index}) => {
        const childProps = {...child.props};

        delete childProps.className;

        return <TabHeader index={index} className={tabItemClassName} activeClassName={activeTabItemClassName} {...childProps} />;
    }, [activeTabItemClassName, tabItemClassName]);

    const renderTabContent = useCallback(({item: child, index}) => {
        return <TabContent mode={mode} ref={el => tabsRef.current[index] = el} {...child.props} />;
    }, [mode]);

    return (
        <TabContext.Provider value={tabContext}>
            <List
                className={cs(headerClassName, styles.header)}
                data={children}
                keyExtractor={item => item.label}
                renderItem={renderTabHeader}
            />
            <List
                className={contentContainerClassName}
                data={children}
                keyExtractor={item => item.label}
                renderItem={renderTabContent}
            />
        </TabContext.Provider>
    );
};
