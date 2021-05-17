import React, {useMemo, useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';

import List from '../List';
import TabContext from './TabContext';
import TabHeader from './TabHeader';
import TabContent from './TabContent';

import cs from '../../cs';
import styles from './styles.module.scss';

const getChildren = children => React.Children.toArray(children);
const getDefaultActiveTab = children => children?.[0]?.props?.label;

export const Tab = () => null;

const Tabs = (props) => {
    const {children} = props;
    const _children = getChildren(children);

    const {
        onChange,
        defaultActiveTab = getDefaultActiveTab(_children),
        activeTab: controlledActiveTab,
        headerClassName,
        tabItemClassName,
        activeTabItemClassName,
        contentContainerClassName,
        mode = 'switch',
    } = props;

    const tabsRef = useRef();
    tabsRef.current = new Array(_children.length);

    const [activeTab, setActiveTab] = useState(controlledActiveTab ? controlledActiveTab : defaultActiveTab);

    const tabContext = useMemo(() => ({
        selectTab: (e, index) => {
            const selectedTab = e.target.getAttribute('label');
            onChange && onChange({activeTab: selectedTab, previousTab: tabContext.activeTab});
            if(!controlledActiveTab) {
                setActiveTab(selectedTab);
                if(mode === 'scroll' && tabsRef.current[index]) {
                    tabsRef.current[index].scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        },
        activeTab: controlledActiveTab?controlledActiveTab:activeTab
    }), [activeTab, mode, onChange, controlledActiveTab]);

    const renderTabHeader = useCallback(({item: child, index}) => {
        const childProps = {...child.props};

        delete childProps.className;

        return <TabHeader index={index} className={tabItemClassName} activeClassName={activeTabItemClassName} {...childProps} />;
    }, [activeTabItemClassName, tabItemClassName]);

    const renderTabContent = useCallback(({item: child, index}) => {
        const {title, ...childProps} = child.props;
        return <TabContent mode={mode} ref={el => tabsRef.current[index] = el} {...childProps} />;
    }, [mode]);

    return (
        <TabContext.Provider value={tabContext}>
            <List
                className={cs(headerClassName, styles.header)}
                data={_children}
                keyExtractor={item => item.label}
                renderItem={renderTabHeader}
            />
            <List
                className={contentContainerClassName}
                data={_children}
                keyExtractor={item => item.label}
                renderItem={renderTabContent}
            />
        </TabContext.Provider>
    );
};

export default Tabs;

Tabs.propTypes = {
    /**
     * Callback called when tab is changed. Called with activeTab and previousTab values
     */
    onChange: PropTypes.func,
    /**
     * Label of Initial active Tab. Use when tab is not controlled.
     */
    defaultActiveTab: PropTypes.string,
    /**
     * Label of active tab. Tab is controlled if used.
     */
    activeTab: PropTypes.string,
    /**
     * Classname for header
     */
    headerClassName: PropTypes.string,
    /**
     * Classname for each header item
     */
    tabItemClassName: PropTypes.string,
    /**
     * ClassName for active header Item
     */
    activeTabItemClassName: PropTypes.string,
    /**
     * ClassName for content container
     */
    contentContainerClassName: PropTypes.string,
    /**
     * Decides the mode of tab layout
     * One of 'switch' (default) or 'scroll'
     */
    mode: PropTypes.string,
}
