import * as React from 'react';

import {ListRenderItemProps} from '../List';

export interface Column {
    Header: string;
    accessor: string;
}

export type TableRenderHeaderItem = ({col}: {column: Column}) => React.ReactNode | string;
export type TableRenderDataItem<T> = ({item, index, column}: {item: T; index: number; column: Column}) => React.ReactNode | string;

export type TableRowRenderer = (props: ListRenderItemProps & {column: Column}) => React.ReactNode | string;

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
    columns: Column[];
    renderHeaderItem?: TableRenderHeaderItem;
    renderDataItem?: TableRenderDataItem;
    rowRenderer?: TableRowRenderer;
    page?: number;
    maxRows?: number;
    loading?: boolean;
    LoadingComponent?: React.ReactNode;
    EmptyComponent?: React.ReactNode;
    controlled?: boolean;
}

declare const Table;

export default Table;
