import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';

import styles from './styles.module.scss';
import type {
    Column,
    Hierarchical,
    HierarchicalTableProps,
    KeyExtractor,
    TableRenderDataItem,
    TableRowRenderer,
} from './types';
import Table from '..';
import cs from '../../../cs';

/**
 * Recursively collects keys of items that should be initially expanded based on initialExpandedLevel.
 */
function collectInitiallyExpandedKeys<T, C extends string = 'children', L extends string = 'level'>(
    items: Hierarchical<T, C, L>[],
    keyExtractor: KeyExtractor<T>,
    childrenKey: C,
    levelKey: L,
    initialExpandedLevel: number,
    expandedKeys: Set<ReturnType<KeyExtractor<T>>> = new Set(),
) {
    if (!items || !Array.isArray(items)) return expandedKeys;

    for (const [index, item] of items.entries()) {
        const itemLevel = item[levelKey] ?? 0;
        const children = item[childrenKey];

        // If this item has children and its level is less than initialExpandedLevel, expand it
        if (children && children.length > 0 && itemLevel < initialExpandedLevel) {
            const key = keyExtractor(item, index);
            expandedKeys.add(key);
            // Recursively process children
            collectInitiallyExpandedKeys(
                children,
                keyExtractor,
                childrenKey,
                levelKey,
                initialExpandedLevel,
                expandedKeys,
            );
        }
    }

    return expandedKeys;
}

function HierarchicalTable<T, C extends string = 'children', L extends string = 'level'>(
    props: HierarchicalTableProps<T, C, L>,
) {
    const {
        data,
        bodyRowParentClassName,
        bodyRowChildClassName,
        bodyRowLastChildClassName,
        expandToggleIconClassName,
        rowRenderer,
        keyExtractor,
        hierarchyOptions = {},
        onRowClick,
        renderDataItem,
        bodyRowClassName,
        dataClassName,
        rowSpacingHeight,
        ...tableProps
    } = props;

    const {
        levelKey = 'level' as L,
        childrenKey = 'children' as C,
        initialExpandedLevel = 1,
    } = hierarchyOptions;

    const tableData: Hierarchical<T, C, L>[] = useMemo(() => {
        const { hierarchyBuilder, parentKeyExtractor } = hierarchyOptions;

        if (hierarchyBuilder) {
            return hierarchyBuilder(data, {
                levelKey,
                childrenKey,
                keyExtractor,
                parentKeyExtractor,
            });
        }

        return data as Hierarchical<T, C, L>[];
    }, [hierarchyOptions, data, levelKey, childrenKey, keyExtractor]);

    const [expandedKeys, setExpandedKeys] = useState(() =>
        collectInitiallyExpandedKeys(
            tableData,
            keyExtractor,
            childrenKey,
            levelKey,
            initialExpandedLevel,
        ),
    );

    const isInitialMount = useRef(true);

    // Sync expanded state when configuration changes (but not when data changes)
    // This preserves user interactions (expand/collapse) across data updates.
    // Note: Stale keys from removed items remain in the Set but are harmless.
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setExpandedKeys(
            collectInitiallyExpandedKeys(
                tableData,
                keyExtractor,
                childrenKey,
                levelKey,
                initialExpandedLevel,
            ),
        );
    }, [keyExtractor, childrenKey, levelKey, initialExpandedLevel]);

    const handleToggleExpand = useCallback((itemKey: string | number) => {
        setExpandedKeys((prevKeys) => {
            const newKeys = new Set(prevKeys);
            if (newKeys.has(itemKey)) {
                newKeys.delete(itemKey);
            } else {
                newKeys.add(itemKey);
            }
            return newKeys;
        });
    }, []);

    const renderHierarchicalRow: TableRowRenderer<Hierarchical<T, C, L>> = useCallback(
        (tableRowProps) => {
            if (rowRenderer) {
                return rowRenderer(tableRowProps);
            }

            return (
                <HierarchicalRow
                    {...tableRowProps}
                    onClick={onRowClick}
                    renderDataItem={renderDataItem}
                    className={bodyRowClassName}
                    dataClassName={dataClassName}
                    rowSpacingHeight={rowSpacingHeight}
                    parentClassName={bodyRowParentClassName}
                    childClassName={bodyRowChildClassName}
                    lastChildClassName={bodyRowLastChildClassName}
                    expandToggleIconClassName={expandToggleIconClassName}
                    levelKey={levelKey}
                    childrenKey={childrenKey}
                    expandedKeys={expandedKeys}
                    onToggleExpand={handleToggleExpand}
                    keyExtractor={keyExtractor}
                />
            );
        },
        [
            bodyRowClassName,
            bodyRowParentClassName,
            bodyRowChildClassName,
            bodyRowLastChildClassName,
            dataClassName,
            expandToggleIconClassName,
            expandedKeys,
            levelKey,
            childrenKey,
            keyExtractor,
            rowSpacingHeight,
            handleToggleExpand,
            onRowClick,
            renderDataItem,
            rowRenderer,
        ],
    );

    return (
        <Table
            {...tableProps}
            data={tableData}
            rowRenderer={renderHierarchicalRow}
            keyExtractor={keyExtractor}
            onRowClick={onRowClick}
            renderDataItem={renderDataItem}
            bodyRowClassName={bodyRowClassName}
            dataClassName={dataClassName}
            rowSpacingHeight={rowSpacingHeight}
        />
    );
}

export default HierarchicalTable;

export * from './types';

function HierarchicalRow<T, C extends string = 'children', L extends string = 'level'>({
    item,
    index,
    onClick,
    columns,
    className,
    dataClassName,
    parentClassName = '',
    childClassName = '',
    lastChildClassName = '',
    expandToggleIconClassName,
    renderDataItem,
    isLastChild,
    rowSpacingHeight,
    levelKey,
    childrenKey,
    path,
    expandedKeys,
    onToggleExpand,
    keyExtractor,
}: {
    item: Hierarchical<T, C, L>;
    index: number;
    onClick?: (item: Hierarchical<T, C, L>) => void;
    columns: Column[];
    className?: string;
    dataClassName?: string;
    parentClassName?: string;
    childClassName?: string;
    lastChildClassName?: string;
    expandToggleIconClassName?: string;
    isLastChild?: boolean;
    renderDataItem?: TableRenderDataItem<Hierarchical<T, C, L>>;
    rowSpacingHeight?: string | number;
    levelKey: L;
    childrenKey: C;
    path?: (string | number)[];
    expandedKeys: Set<string | number>;
    onToggleExpand: (itemKey: string | number) => void;
    keyExtractor: KeyExtractor<Hierarchical<T, C, L>>;
}) {
    const rowPath = useMemo(
        () => (path ? [...path, childrenKey, index] : [index]),
        [path, childrenKey, index],
    );

    const itemKey = useMemo(() => keyExtractor(item, index), [keyExtractor, item, index]);
    const isExpanded = useMemo(() => expandedKeys.has(itemKey), [expandedKeys, itemKey]);

    const handleClickRow = useCallback(() => {
        onClick?.(item);
    }, [onClick, item]);

    const handleToggle = useCallback(
        (e: React.MouseEvent<SVGElement, MouseEvent>) => {
            e.stopPropagation();
            onToggleExpand(itemKey);
        },
        [onToggleExpand, itemKey],
    );

    const ToggleIcon = useMemo(
        () => (isExpanded ? MdKeyboardArrowDown : MdKeyboardArrowRight),
        [isExpanded],
    );

    const children = useMemo(
        () =>
            item[childrenKey as keyof Hierarchical<T, C, L>] as Hierarchical<T, C, L>[] | undefined,
        [item, childrenKey],
    );
    const activeLevel = useMemo(
        () => (item[levelKey as keyof Hierarchical<T, C, L>] ?? 0) as number,
        [item, levelKey],
    );
    const hasChildren = useMemo(() => children && children.length > 0, [children]);

    const tableDataStyle = useMemo(() => {
        return {
            '--row-level': `${activeLevel}rem`,
            '--row-offset': activeLevel === 0 || hasChildren ? '0rem' : '1rem',
        } as React.CSSProperties;
    }, [activeLevel, hasChildren]);

    return (
        <>
            <tr
                className={cs(styles.row, className, {
                    [childClassName]: activeLevel > 0,
                    [parentClassName]: hasChildren && isExpanded,
                    [lastChildClassName]: !isExpanded && (isLastChild || activeLevel === 0),
                })}
                onClick={handleClickRow}
            >
                {columns.map((column, columnIndex) => (
                    <td
                        className={cs(styles.data, styles.dataHierarchical, dataClassName)}
                        key={column.accessor + index + columnIndex}
                        style={tableDataStyle}
                    >
                        {columnIndex === 0 && hasChildren && (
                            <ToggleIcon
                                className={expandToggleIconClassName}
                                onClick={handleToggle}
                            />
                        )}
                        {renderDataItem?.({ item, column, index, path: rowPath })}
                    </td>
                ))}
            </tr>
            {isExpanded &&
                children &&
                children.map((childItem, childItemIndex) => (
                    <HierarchicalRow
                        key={keyExtractor(childItem, childItemIndex)}
                        item={childItem}
                        index={childItemIndex}
                        columns={columns}
                        dataClassName={dataClassName}
                        isLastChild={childItemIndex === children.length - 1}
                        renderDataItem={renderDataItem}
                        onClick={onClick}
                        parentClassName={parentClassName}
                        childClassName={childClassName}
                        className={className}
                        lastChildClassName={
                            isLastChild || activeLevel === 0 ? lastChildClassName : ''
                        }
                        expandToggleIconClassName={expandToggleIconClassName}
                        levelKey={levelKey}
                        childrenKey={childrenKey}
                        path={rowPath}
                        expandedKeys={expandedKeys}
                        onToggleExpand={onToggleExpand}
                        keyExtractor={keyExtractor}
                    />
                ))}
            {!!rowSpacingHeight && activeLevel === 0 && (
                <tr className={styles.rowSpacing} style={{ height: rowSpacingHeight }} />
            )}
        </>
    );
}
