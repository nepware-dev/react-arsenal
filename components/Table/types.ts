import * as React from 'react';

import type { ListRenderItemProps, KeyExtractor, ListProps } from '../List';

export type { KeyExtractor };

export interface Column {
    Header: string;
    accessor: string;
}

export type TableRenderHeader = ({ columns }: { columns: Column[] }) => React.ReactNode;
export type TableRenderHeaderItem = ({ column }: { column: Column }) => React.ReactNode | string;

export type TableRenderDataItemProps<T> = {
    item: T;
    index: number;
    column: Column;
    path?: (string | number)[];
};
export type TableRenderDataItem<T> = ({
    item,
    index,
    column,
    path,
}: TableRenderDataItemProps<T>) => React.ReactNode | string;

export type TableRowRendererProps<T> = ListRenderItemProps<T> & {
    columns: Column[];
    isSelected: boolean;
};
export type TableRowRenderer<T> = (props: TableRowRendererProps<T>) => React.ReactNode | string;

export interface TableProps<T> {
    /*
     * Class Applied to table element.
     */
    className?: string;
    /*
     * Style applied to table.
     */
    style?: React.CSSProperties;
    /*
     * Class Applied to thead element.
     */
    headerClassName?: string;
    /*
     * Class applied to tr element of thead.
     */
    headerRowClassName?: string;
    /*
     * Class applied to th element of table.
     */
    headerItemClassName?: string;
    /*
     * Class applied to tbody element.
     */
    bodyClassName?: string;
    /*
     * Class applied to every tr element of tbody.
     */
    bodyRowClassName?: string;
    /*
     * Class applied to td element of table.
     */
    dataClassName?: string;
    /*
     * Array of data to render in the table.
     */
    data: T[];
    /*
     * Array of columns for the table.
     * Requires Header and accessor keys for each column
     */
    columns: Column[];
    /*
     * Extract key from data items.
     * Note: Avoid using index as the key for tables
     * @param item - Contains each data item present in the data array.
     */
    keyExtractor: KeyExtractor<T>;
    /*
     * Renderer for header.
     * @param {{columns: array}} payload - Contains the columns array of table for rendering header.
     */
    renderHeader?: TableRenderHeader;
    /*
     * Renderer for each data item in header.
     * Appears as a direct child of td element.
     */
    renderHeaderItem?: TableRenderHeaderItem;
    /*
     * Renderer for each data item in body.
     * Appears as a direct child of td element.
     */
    renderDataItem?: TableRenderDataItem<T>;
    /*
     * Renderer for row component.
     * @param {{columns: array, ...listProps}} payload - Contains the columns array of table and list props for rendering rows.
     */
    rowRenderer?: TableRowRenderer<T>;
    /*
     * Current page of data to display.
     * Does not take effect if table is controlled.
     */
    page?: number;
    /*
     * Maximum number of rows to display.
     * Does not take effect if table is controlled.
     */
    maxRows?: number;
    /*
     * Boolean describing whether data is currently loading.
     */
    loading?: boolean;
    /*
     * Component to use when data is loading
     */
    LoadingComponent?: ListProps<T>['LoadingComponent'];
    /*
     * Component to use when data is empty
     */
    EmptyComponent?: ListProps<T>['EmptyComponent'];
    /*
     * Boolean describing if the table is controlled.
     * If controlled, all data passed to table will be visible regardless of props passed for page or maxRows.
     */
    controlled?: boolean;
    /**
     * The space between each row in the table.
     */
    rowSpacingHeight?: string | number;
    /**
     * Function called when table row is clicked
     * @param {rowItem} payload - Contains the item of the row clicked.
     */
    onRowClick?: (item: T) => void;
    /**
     * Whether rows are selectable.
     * Defaults to false.
     */
    selectable?: boolean;
    /**
     * Array of selected items.
     * Requires keyExtractor to be sent.
     */
    selectedItems?: T[];
    /**
     * Function called when selected items change.
     * @param {Array} items - Contains the array of selected items.
     */
    onSelectedItemsChange?: (items: T[]) => void;
    /**
     * Class applied to selected row.
     */
    selectedRowClassName?: string;
}
