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
        headerStyle,
        headerContainerClassName,
        tabItemClassName,
        activeTabItemClassName,
        contentContainerClassName,
        PreHeaderComponent = noop,
        PostHeaderComponent = noop,
        mode = 'switch',
        disableUnmount,
        scrollRootMarginPercent
    } = props;

    const tabsRef = useRef(new Array(_children.length));

    const [activeTab, setActiveTab] = useState(controlledActiveTab ? controlledActiveTab : defaultActiveTab);

    const tabContext = useMemo(() => ({
        selectTab: (e, index) => {
            const selectedTab = e.currentTarget.getAttribute('label');
            onChange && onChange({activeTab: selectedTab, previousTab: tabContext.activeTab});
            if(!controlledActiveTab) {
               if(mode === 'scroll' && tabsRef.current?.[index]) {
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
                ref={tabsRef}
                disableUnmount={disableUnmount}
                index={index}
                scrollRootMarginPercent={scrollRootMarginPercent}
                {...childProps}
            />
        );
    }, [mode, disableUnmount, scrollRootMarginPercent]);

    return (
        <TabContext.Provider value={tabContext}>
            <div ref={ref} className={className}>
                <List
                    className={cs(headerClassName, styles.header)}
                    style={headerStyle}
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
     * Style for header
     */
    headerStyle: PropTypes.object,
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
     * Decides the threshold from top that a tab's content needs to cross to be considered active.
     * Applies only for scroll mode.
     * A value of 75 means that a tab becomes active if it crosses 75% from top of the viewport.
     * Higher values allow tabs at the bottom with small content height to become active. May require some hit-and-trial for the optimal value.
     * Default value - 50.
     */
    scrollRootMarginPercent: PropTypes.number,
    /**
     * Children components
     */
    children: PropTypes.node,
};
