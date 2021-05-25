import React, {useMemo, useCallback, useRef, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import List from '../List';
import TabContext from './TabContext';
import TabHeader from './TabHeader';
import TabContent from './TabContent';

import cs from '../../cs';
import {scrollToElement} from '../../utils';

import styles from './styles.module.scss';

const noop = () => null;

const getChildren = children => React.Children.toArray(children);
const getDefaultActiveTab = children => children?.[0]?.props?.label;

export const Tab = noop;

const Tabs = (props) => {
    const {children} = props;
    const _children = getChildren(children);

    const {
        onChange,
        defaultActiveTab = getDefaultActiveTab(_children),
        activeTab: controlledActiveTab,
        className,
        renderHeader,
        headerClassName,
        headerContainerClassName,
        tabItemClassName,
        activeTabItemClassName,
        contentContainerClassName,
        renderPreHeaderComponent = noop,
        renderPostHeaderComponent = noop,
        mode = 'switch',
    } = props;

    const tabsRef = useRef();
    tabsRef.current = new Array(_children.length);

    const [activeTab, setActiveTab] = useState(controlledActiveTab ? controlledActiveTab : defaultActiveTab);

    const onScroll = useCallback(() => {
        const scrollPos = document.body.scrollTop || document.documentElement.scrollTop;
        tabsRef.current?.forEach(refElement => {
            const elOffset = refElement.offsetTop;
            const dims = refElement.getBoundingClientRect();
            if(scrollPos > elOffset - dims.height && scrollPos < elOffset) {
                const newActive = refElement.getAttribute('label');
                if(activeTab!==newActive) {
                    setActiveTab(newActive);
                }
            }
        });
    }, [activeTab]);

    useEffect(() => {
        if(mode==='scroll') {
            document.addEventListener('scroll', onScroll);
        }
        return () => document.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    const tabContext = useMemo(() => ({
        selectTab: (e, index) => {
            const selectedTab = e.currentTarget.getAttribute('label');
            onChange && onChange({activeTab: selectedTab, previousTab: tabContext.activeTab});
            if(!controlledActiveTab) {
                setActiveTab(selectedTab);
                if(mode === 'scroll' && tabsRef.current[index]) {
                    scrollToElement(tabsRef.current[index]);
                }
            }
        },
        activeTab: controlledActiveTab?controlledActiveTab:activeTab
    }), [activeTab, mode, onChange, controlledActiveTab]);

    const renderTabHeader = useCallback(({item: child, index}) => {
        const childProps = {...child.props};

        delete childProps.className;

        return (
            <TabHeader 
                renderHeader={renderHeader} 
                index={index} 
                className={tabItemClassName} 
                activeClassName={activeTabItemClassName} 
                {...childProps} 
            />
        );
    }, [activeTabItemClassName, tabItemClassName, renderHeader]);

    const renderTabContent = useCallback(({item: child, index}) => {
        const {title, ...childProps} = child.props;
        return (
            <TabContent 
                mode={mode} 
                ref={el => tabsRef.current[index] = el} 
                {...childProps} 
            />
        );
    }, [mode]);

    const PreHeader = renderPreHeaderComponent;
    const PostHeader = renderPostHeaderComponent;

    return (
        <TabContext.Provider value={tabContext}>
            <div className={className}>
                <List
                    className={cs(headerClassName, styles.header)}
                    data={_children}
                    keyExtractor={item => item.label}
                    renderItem={renderTabHeader}
                    contentContainerClassName={headerContainerClassName}
                    ListHeaderComponent={() => <PreHeader />}
                    ListFooterComponent={() => <PostHeader />}
                />
                <List
                    className={contentContainerClassName}
                    data={_children}
                    keyExtractor={item => item.label}
                    renderItem={renderTabContent}
                />
            </div>
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
     * Render callback for header item.
     */
    renderHeader: PropTypes.any,
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
     * When using scroll mode, the scroll-margin-top property on Tab will be used to calculate scroll offset.
     */
    mode: PropTypes.string,
}
