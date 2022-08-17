import React from 'react';

export type TabChangeCallback = (payload: {activeTab: string; previousTab: string}) => void;
export type HeaderClickCallback = (e: React.MouseEvent, index: number) => void;

export type TabRenderHeader = (payload: {
    title: string;
    index: number;
    active: boolean;
    handleClick:
    HeaderClickCallback;
    [key: string]: any;
}) => React.ReactNode;

export interface TabsProps {
    className?: string;
    onChange?: TabChangeCallback;
    defaultActiveTab?: string;
    activeTab?: string;
    renderHeader?: TabRenderHeader;
    headerContainerClassName?: string;
    headerClassName?: string;
    headerStyle?: React.CSSProperties;
    PreHeaderComponent?: React.ReactNode;
    PostHeaderComponent?: React.ReactNode;
    tabItemClassName?: string;
    activeTabItemClassName?: string;
    contentContainerClassName?: string;
    mode?: 'switch' | 'scroll';
    children: React.ReactNode;
}

export interface TabProps {
    label: string;
    title: string;
}

declare const Tab;
declare const Tabs;

export {Tab};
export default Tabs;
