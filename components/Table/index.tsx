import React, { useMemo, useCallback, useRef, useEffect, type JSX } from 'react';

import styles from './styles.module.scss';
import type { TableProps, TableRenderDataItem } from './types';
import CheckboxInput from '../Form/CheckboxInput';
import List, { type ListRenderItem } from '../List';
import cs from '../../cs';

const tableDataStyle = {
    '--row-level': '0rem',
    '--row-offset': '0rem',
} as React.CSSProperties;

function Row<T>({
    item,
    index,
    onClick,
    columns,
    className,
    dataClassName,
    renderDataItem,
    rowSpacingHeight,
}: {
    item: T;
    index: number;
    onClick?: (item: T) => void;
    columns: TableProps<T>['columns'];
    className?: string;
    dataClassName?: string;
    renderDataItem?: TableProps<T>['renderDataItem'];
    rowSpacingHeight?: TableProps<T>['rowSpacingHeight'];
    isSelected: boolean;
}) {
    const handleClickRow = useCallback(() => {
        onClick?.(item);
    }, [onClick, item]);

    return (
        <>
            <tr className={cs(styles.row, className)} onClick={handleClickRow}>
                {columns.map((col, idx) => {
                    return (
                        <td
                            style={tableDataStyle}
                            key={idx}
                            className={cs(styles.data, dataClassName)}
                        >
                            {renderDataItem
                                ? renderDataItem({ item, index, column: col })
                                : (item[col.accessor as keyof T] as React.ReactNode)}
                        </td>
                    );
                })}
            </tr>
            {!!rowSpacingHeight && (
                <tr className={styles.rowSpacing} style={{ height: rowSpacingHeight }} />
            )}
        </>
    );
}

function Table<T>(props: TableProps<T>) {
    const {
        className,
        style,
        headerClassName,
        headerRowClassName,
        bodyClassName,
        bodyRowClassName,
        dataClassName,
        headerItemClassName,
        rowSpacingHeight,
        onRowClick,
        loading,
        LoadingComponent,
        EmptyComponent,
        data = [],
        columns,
        renderHeader,
        renderHeaderItem,
        renderDataItem,
        page = 1,
        maxRows = 10,
        controlled,
        rowRenderer,
        keyExtractor,
        selectable = false,
        selectedItems = [],
        onSelectedItemsChange,
        selectedRowClassName = '',
    } = props;

    const tableColumns = useMemo(() => {
        if (!selectable) {
            return columns;
        }
        return [{ Header: '', accessor: 'select' }, ...columns];
    }, [columns, selectable]);

    const visibleData = useMemo(() => {
        if (controlled) {
            return data;
        }
        const initIndex = (page - 1) * maxRows;
        return data.slice(initIndex, initIndex + maxRows);
    }, [controlled, data, maxRows, page]);

    useEffect(() => {
        if (page && maxRows && selectable) {
            onSelectedItemsChange?.([]);
        }
    }, [page, selectable, maxRows, onSelectedItemsChange]);

    const handleSelectedRowsChange = useCallback(
        (item: T, index: number) => {
            const isSelected = selectedItems.some(
                (i, idx) => keyExtractor(i, idx) === keyExtractor(item, index),
            );
            if (isSelected) {
                const newSelectedItems = selectedItems.filter(
                    (i, idx) => keyExtractor(i, idx) !== keyExtractor(item, index),
                );
                return onSelectedItemsChange?.(newSelectedItems);
            }
            onSelectedItemsChange?.([...selectedItems, item]);
        },
        [keyExtractor, selectedItems, onSelectedItemsChange],
    );

    const handleAllRowsSelectedChange = useCallback(() => {
        if (selectedItems.length === visibleData.length) {
            return onSelectedItemsChange?.([]);
        }
        onSelectedItemsChange?.(visibleData);
    }, [selectedItems, visibleData, onSelectedItemsChange]);

    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const Header = useMemo(() => {
        if (renderHeader) {
            return renderHeader({ columns: tableColumns });
        }
        return (
            <thead className={cs(styles.head, headerClassName)}>
                <tr className={cs(styles.headerRow, headerRowClassName)}>
                    {tableColumns.map((col, idx) => {
                        if (selectable && col.accessor === 'select') {
                            return (
                                <th key={idx} className={cs(styles.data, headerItemClassName)}>
                                    <CheckboxInput
                                        inputRef={headerCheckboxRef}
                                        onChange={handleAllRowsSelectedChange}
                                        checked={
                                            selectedItems.length > 0 &&
                                            selectedItems.length === visibleData.length
                                        }
                                        indeterminate={
                                            selectedItems.length > 0 &&
                                            selectedItems.length < visibleData.length
                                        }
                                    />
                                </th>
                            );
                        }
                        return (
                            <th key={idx} className={cs(styles.data, headerItemClassName)}>
                                {renderHeaderItem ? renderHeaderItem({ column: col }) : col.Header}
                            </th>
                        );
                    })}
                </tr>
            </thead>
        );
    }, [
        tableColumns,
        headerClassName,
        headerRowClassName,
        headerItemClassName,
        selectable,
        selectedItems,
        visibleData,
        handleAllRowsSelectedChange,
        renderHeader,
        renderHeaderItem,
    ]);

    const renderTableDataItem: TableRenderDataItem<T> = useCallback(
        (listProps) => (
            <TableDataItem
                listProps={listProps}
                selectable={selectable}
                selectedItems={selectedItems}
                keyExtractor={keyExtractor}
                renderDataItem={renderDataItem}
                onSelectedRowsChange={handleSelectedRowsChange}
            />
        ),
        [selectable, selectedItems, keyExtractor, renderDataItem, handleSelectedRowsChange],
    );

    const renderRow: ListRenderItem<T> = useCallback(
        (listProps) => {
            const isSelected = selectedItems.some(
                (i) =>
                    keyExtractor(i, listProps.index) ===
                    keyExtractor(listProps.item, listProps.index),
            );
            if (rowRenderer) {
                return rowRenderer({ ...listProps, columns: tableColumns, isSelected });
            }
            return (
                <Row
                    {...listProps}
                    onClick={onRowClick}
                    columns={tableColumns}
                    renderDataItem={renderTableDataItem}
                    className={cs(bodyRowClassName, {
                        [styles.rowSelected]: isSelected,
                        [selectedRowClassName]: isSelected,
                    })}
                    dataClassName={dataClassName}
                    rowSpacingHeight={rowSpacingHeight}
                    isSelected={isSelected}
                />
            );
        },
        [
            tableColumns,
            bodyRowClassName,
            dataClassName,
            rowSpacingHeight,
            selectedRowClassName,
            selectedItems,
            keyExtractor,
            onRowClick,
            renderTableDataItem,
            rowRenderer,
        ],
    );

    const Body = useMemo(() => {
        return (
            <List
                loading={loading}
                LoadingComponent={LoadingComponent}
                EmptyComponent={EmptyComponent}
                className={cs(styles.body, bodyClassName)}
                data={visibleData}
                renderItem={renderRow}
                keyExtractor={keyExtractor}
                component="tbody"
            />
        );
    }, [
        bodyClassName,
        visibleData,
        loading,
        keyExtractor,
        renderRow,
        EmptyComponent,
        LoadingComponent,
    ]);

    return (
        <table style={style} className={cs(styles.table, className)}>
            {Header}
            {Body}
        </table>
    );
}

export default React.memo(Table) as <T>(props: TableProps<T>) => JSX.Element;

export * from './types';


function TableDataItem<T>({
    listProps,
    selectable,
    selectedItems,
    keyExtractor,
    renderDataItem,
    onSelectedRowsChange,
}: {
    listProps: Parameters<TableRenderDataItem<T>>[0];
    selectable?: boolean;
    selectedItems: T[];
    keyExtractor: TableProps<T>['keyExtractor'];
    renderDataItem?: TableRenderDataItem<T>;
    onSelectedRowsChange: (item: T, index: number) => void;
}) {
    const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleCheckboxChange = useCallback(() => {
        onSelectedRowsChange(listProps.item, listProps.index);
    }, [onSelectedRowsChange, listProps.item, listProps.index]);

    if (selectable && listProps.column.accessor === 'select') {
        const itemKey = keyExtractor(listProps.item, listProps.index);
        const isChecked = selectedItems.some(
            (i) => keyExtractor(i, listProps.index) === itemKey,
        );
        return (
            <CheckboxInput
                id={String(itemKey)}
                checked={isChecked}
                onClick={handleCheckboxClick}
                onChange={handleCheckboxChange}
            />
        );
    }
    return (
        <>
            {renderDataItem
                ? renderDataItem(listProps)
                : (listProps.item[listProps.column.accessor as keyof T] as React.ReactNode)}
        </>
    );
}
