import * as React from 'react';

export type ListRenderItemProps<T> = {item: T; index: number;};

export type KeyExtractor<T> = (item: T, index: number) => string | number;
export type ListRenderItem<T> = (props: ListRenderItemProps<T>) => React.ReactNode;

export interface ListProps<T> {
    className?: string;
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
    component?: keyof JSX.IntrinsicElements;
    EmptyComponent?: React.ReactNode;
    LoadingComponent?: React.ReactNode;
    HeaderComponent?: React.ReactNode;
    FooterComponent?: React.ReactNode;
}

declare const List;

export default List;
