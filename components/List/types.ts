import React, { type JSX } from "react";

export type ListRenderItemProps<T> = { item: T; index: number };

export type KeyExtractor<T> = (item: T, index: number) => string | number;
export type ListRenderItem<T> = (props: ListRenderItemProps<T>) => React.ReactNode;

export interface ListProps<T> {
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
    component?: keyof JSX.IntrinsicElements | typeof React.Fragment;
    EmptyComponent?: React.ComponentType | React.ReactElement | null;
    LoadingComponent?: React.ComponentType | React.ReactElement | null;
    HeaderComponent?: React.ComponentType | React.ReactElement | null;
    FooterComponent?: React.ComponentType | React.ReactElement | null;
}
