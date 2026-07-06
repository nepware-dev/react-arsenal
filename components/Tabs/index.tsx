import React, { useMemo, useCallback, useRef, useState, type ReactElement } from 'react';

import styles from './styles.module.scss';
import type { TabProps, TabsProps } from './types';
import List, { type ListRenderItem } from '../List';
import TabContext, { type TabContextType } from './TabContext';
import TabHeader from './TabHeader';
import TabContent from './TabContent';
import cs from '../../cs';
import { scrollToElement } from '../../utils';


const noop = () => null;

const getChildren = (children: TabsProps['children']) =>
    React.Children.toArray(children) as ReactElement<TabProps>[];

const getDefaultActiveTab = (children: ReactElement<TabProps>[]) => children?.[0]?.props?.label;

const headerKeyExtractor = (item: ReactElement<TabProps>) => item.props.label;
const contentKeyExtractor = (item: ReactElement<TabProps>) => item.props.label;

export const Tab: React.FC<TabProps> = noop;

const Tabs: React.FC<TabsProps> = (props) => {
    const {
        children: _children,
        ref,
        onChange,
        defaultActiveTab: _defaultActiveTab,
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
        scrollRootMarginPercent,
    } = props;

    const children = getChildren(_children);
    const defaultActiveTab = _defaultActiveTab || getDefaultActiveTab(children);

    const tabsRef = useRef(new Array(children.length));

    const [activeTab, setActiveTab] = useState(
        controlledActiveTab ? controlledActiveTab : defaultActiveTab,
    );

    const tabContext: TabContextType = useMemo(
        () => ({
            selectTab: ({ currentTarget }: { currentTarget: Element }, index: number) => {
                const selectedTab = currentTarget.getAttribute('label');

                if (!selectedTab) {
                    console.warn('Selected tab does not have a label attribute');
                    return;
                }

                onChange?.({ activeTab: selectedTab, previousTab: tabContext.activeTab });
                if (!controlledActiveTab) {
                    if (mode === 'scroll' && tabsRef.current?.[index]) {
                        return scrollToElement(tabsRef.current[index]);
                    }
                    setActiveTab(selectedTab);
                }
            },
            activeTab: controlledActiveTab ? controlledActiveTab : activeTab,
        }),
        [activeTab, mode, onChange, controlledActiveTab],
    );

    const renderTabHeader: ListRenderItem<ReactElement<TabProps>> = useCallback(
        ({ item: child, index }) => {
            const childProps = { ...child.props };

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
        },
        [activeTabItemClassName, tabItemClassName, renderHeader],
    );

    const renderTabContent: ListRenderItem<ReactElement<TabProps>> = useCallback(
        ({ item: child, index }) => {
            const { ...childProps } = child.props;

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
        },
        [mode, disableUnmount, scrollRootMarginPercent],
    );

    return (
        <TabContext.Provider value={tabContext}>
            <div ref={ref} className={className}>
                <List
                    className={cs(headerClassName, styles.header)}
                    style={headerStyle}
                    data={children}
                    keyExtractor={headerKeyExtractor}
                    renderItem={renderTabHeader}
                    contentContainerClassName={headerContainerClassName}
                    HeaderComponent={PreHeaderComponent}
                    FooterComponent={PostHeaderComponent}
                />
                <List
                    className={contentContainerClassName}
                    data={children}
                    keyExtractor={contentKeyExtractor}
                    renderItem={renderTabContent}
                />
            </div>
        </TabContext.Provider>
    );
};

Tabs.displayName = 'Tabs';

export default Tabs;

export * from './types';
