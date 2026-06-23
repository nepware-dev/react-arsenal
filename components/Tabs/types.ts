import React, { type HTMLAttributes, type PropsWithChildren, type ReactElement } from 'react';

type ElementOrElementType = React.ReactElement | React.ElementType;

export type TabChangeCallback = (payload: { activeTab: string; previousTab: string }) => void;
export type HeaderClickCallback = (e: React.MouseEvent<HTMLDivElement>) => void;

export interface TabProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
    /**
     * Label for the tab. Should be unique across tabs.
     * Used to identify the tab and its content.
     */
    label: string;
    /**
     * Title of the tab.
     * Used as the title for the tab header
     */
    title: string;
    /**
     * Boolean to set the tab as active
     */
    active?: boolean;
}

export type TabRenderHeader = (
    payload: {
        title: string;
        index: number;
        active: boolean;
        onClick: HeaderClickCallback;
    } & TabProps,
) => React.ReactNode;

export interface TabsProps {
    /**
     * Children components
     */
    children: ReactElement<TabProps> | ReactElement<TabProps>[];
    /**
     * Ref for the container element of Tabs component.
     */
    ref?: React.Ref<HTMLDivElement>;
    /**
     * Classname for tabs container
     */
    className?: string;
    /**
     * Callback called when tab is changed. Called with activeTab and previousTab values
     */
    onChange?: TabChangeCallback;
    /**
     * Label of Initial active Tab. Use when tab is not controlled.
     */
    defaultActiveTab?: string;
    /**
     * Label of active tab. Tab is controlled if used.
     */
    activeTab?: string;
    /**
     * Render callback for header item.
     */
    renderHeader?: TabRenderHeader;
    /**
     * Classname for headers container
     */
    headerContainerClassName?: string;
    /**
     * Classname for header
     */
    headerClassName?: string;
    /**
     * Style for header
     */
    headerStyle?: React.CSSProperties;
    /**
     * Component before the header component
     */
    PreHeaderComponent?: ElementOrElementType;
    /**
     * Component after the header component
     */
    PostHeaderComponent?: ElementOrElementType;
    /**
     * Classname for each header item
     */
    tabItemClassName?: string;
    /**
     * ClassName for active header Item
     */
    activeTabItemClassName?: string;
    /**
     * ClassName for content container
     */
    contentContainerClassName?: string;
    /**
     * Decides the mode of tab layout
     * One of 'switch' (default) or 'scroll'
     * When using scroll mode, the scroll-margin-top property on Tab will be used to calculate scroll offset.
     */
    mode?: 'switch' | 'scroll';
    /**
     * Decides the threshold from top that a tab's content needs to cross to be considered active.
     * Applies only for scroll mode.
     * A value of 75 means that a tab becomes active if it crosses 75% from top of the viewport.
     * Higher values allow tabs at the bottom with small content height to become active. May require some hit-and-trial for the optimal value.
     * Default value - 50.
     */
    scrollRootMarginPercent?: number;
    /**
     * When true, the content of inactive tabs will not be unmounted. This is useful when you want to preserve the state of components in inactive tabs.
     * Default value - false.
     */
    disableUnmount?: boolean;
}

export interface TabContentProps extends TabProps {
    ref: React.RefObject<HTMLDivElement[]>;
    mode: 'switch' | 'scroll';
    index: number;
    disableUnmount?: boolean;
    scrollRootMarginPercent?: number;
}

export interface TabHeaderProps extends Omit<TabProps, 'onClick'> {
    renderHeader?: TabRenderHeader;
    index: number;
    className?: string;
    activeClassName?: string;
    active?: boolean;
    onClick?: HeaderClickCallback;
}
