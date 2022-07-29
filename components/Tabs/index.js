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

const headerKeyExtractor = item => item.props.label;
const contentKeyExtractor = item => item.props.label;

export const Tab = noop;

const Tabs = React.forwardRef((props, ref) => {
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
        PreHeaderComponent = noop,
        PostHeaderComponent = noop,
        mode = 'switch',
    } = props;

    const tabsRef = useRef();
    tabsRef.current = new Array(_children.length);

    const [activeTab, setActiveTab] = useState(controlledActiveTab ? controlledActiveTab : defaultActiveTab);

    const onScroll = useCallback(() => {
        const scrollPos = document.body.scrollTop || document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        const newActiveElement = tabsRef.current?.find(refElement => {
            const elOffset = refElement?.offsetTop;
            const height = refElement?.getBoundingClientRect()?.height;
            const offsetHeight = height > clientHeight ? height/2 : height;
            return scrollPos > elOffset - offsetHeight && scrollPos < elOffset;
        });
        const newActiveTab = newActiveElement?.getAttribute('label');
        if(newActiveTab && activeTab!==newActiveTab) {
            setActiveTab(newActiveTab);
        }
    }, [activeTab]);

    useEffect(() => {
        if(mode==='scroll') {
            document.addEventListener('scroll', onScroll);
        }
        return () => document.removeEventListener('scroll', onScroll);
    }, [onScroll, mode]);

    const tabContext = useMemo(() => ({
        selectTab: (e, index) => {
            const selectedTab = e.currentTarget.getAttribute('label');
            onChange && onChange({activeTab: selectedTab, previousTab: tabContext.activeTab});
            if(!controlledActiveTab) {
                if(mode === 'scroll' && tabsRef.current[index]) {
                    return scrollToElement(tabsRef.current[index]);
                }
                setActiveTab(selectedTab);
            }
        },
        activeTab: controlledActiveTab ? controlledActiveTab : activeTab
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
        const {title, ...childProps} = child.props; //eslint-disable-line no-unused-vars
        return (
            <TabContent 
                mode={mode} 
                ref={el => tabsRef.current[index] = el} 
                {...childProps} 
            />
        );
    }, [mode]);

    return (
        <TabContext.Provider value={tabContext}>
            <div ref={ref} className={className}>
                <List
                    className={cs(headerClassName, styles.header)}
                    data={_children}
                    keyExtractor={headerKeyExtractor}
                    renderItem={renderTabHeader}
                    contentContainerClassName={headerContainerClassName}
                    HeaderComponent={PreHeaderComponent}
                    FooterComponent={PostHeaderComponent}
                />
                <List
                    className={contentContainerClassName}
                    data={_children}
                    keyExtractor={contentKeyExtractor}
                    renderItem={renderTabContent}
                />
            </div>
        </TabContext.Provider>
    );
});

Tabs.displayName = 'Tabs';

export default Tabs;

const ElementOrElementType = PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.elementType,
]);

Tabs.propTypes = {
    /**
     * Classname for tabs container
     */
    className: PropTypes.string,
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
     * Classname for headers container
     */
    headerContainerClassName: PropTypes.string,
    /**
     * Classname for header
     */
    headerClassName: PropTypes.string,
    /**
     * Component before the header component
     */
    PreHeaderComponent: ElementOrElementType,
    /**
     * Component after the header component
     */
    PostHeaderComponent: ElementOrElementType,
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
    /**
     * Children components
     */
    children: PropTypes.node,
};
