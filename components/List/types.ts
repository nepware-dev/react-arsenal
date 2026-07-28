import React from "react";

export type ListRenderItemProps<T> = { item: T; index: number };

export type KeyExtractor<T> = (item: T, index: number) => string | number;
export type ListRenderItem<T> = (props: ListRenderItemProps<T>) => React.ReactNode;

export interface VirtualizedListProps {
    /**
     * Whether the list is horizontal or vertical.
     * Default is false (vertical).
     */
    horizontal?: boolean;
    /**
     * Number of items to render outside the visible area of the list.
     * This can help reduce flickering when scrolling quickly.
     * Default is 3.
     */
    overscan?: number;
    virtualContainerClassName?: string;
}

export interface ListProps<T> extends VirtualizedListProps {
    ref?: React.Ref<HTMLDivElement>;
    className?: string;
    style?: React.CSSProperties;
    classNameItem?: string;
    contentContainerClassName?: string;
    data: T[];
    loading?: boolean;
    keyExtractor: KeyExtractor<T>;
    renderItem: ListRenderItem<T>;
    onEndReachedThreshold?: number;
    onEndReached?: () => void;
    onClick?: React.MouseEventHandler;
    onItemClick?: React.MouseEventHandler;
    component?: React.ElementType;
    EmptyComponent?: React.ComponentType | React.ReactElement | null;
    LoadingComponent?: React.ComponentType | React.ReactElement | null;
    HeaderComponent?: React.ComponentType | React.ReactElement | null;
    FooterComponent?: React.ComponentType | React.ReactElement | null;
    /*
     * Whether to use virtualization for the list.
     * Default is false.
     */
    virtual?: boolean;
}
