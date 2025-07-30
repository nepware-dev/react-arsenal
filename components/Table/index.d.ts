import * as React from 'react';

import type { ListRenderItemProps, KeyExtractor } from '../List';

export type { KeyExtractor };

export interface Column {
    Header: string;
    accessor: string;
}

export type TableRenderHeader = ({ columns }: { columns: Column[] }) => React.ReactNode;
export type TableRenderHeaderItem = ({ col }: { column: Column }) => React.ReactNode | string;

export type TableRenderDataItemProps<T> = { item: T; index: number; column: Column; path?: (string | number)[] };
export type TableRenderDataItem<T> = ({ item, index, column, path }: TableRenderDataItemProps<T>) => React.ReactNode | string;

export type TableRowRendererProps<T> = ListRenderItemProps<T> & { columns: Column[] };
export type TableRowRenderer<T> = (props: TableRowRendererProps<T>) => React.ReactNode | string;

export interface TableProps<T> {
    className?: string;
    style?: React.CSSProperties;
    headerClassName?: string;
    headerRowClassName?: string;
    headerItemClassName?: string;
    bodyClassName?: string;
    bodyRowClassName?: string;
    dataClassName?: string;
    data: T[];
    keyExtractor?: KeyExtractor<T>;
    columns: Column[];
    renderHeader?: TableRenderHeader;
    renderHeaderItem?: TableRenderHeaderItem;
    renderDataItem?: TableRenderDataItem;
    rowRenderer?: TableRowRenderer;
    onRowClick?: (item: T) => void;
    page?: number;
    maxRows?: number;
    loading?: boolean;
    LoadingComponent?: React.ReactNode;
    EmptyComponent?: React.ReactNode;
    controlled?: boolean;
    rowSpacing?: string | number;
}

declare const Table;

export default Table;
