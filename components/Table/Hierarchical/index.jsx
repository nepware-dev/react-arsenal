import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';

import Table from "..";
import cs from '../../../cs';

import styles from './styles.module.scss';

const propTypes = {
    bodyRowParentClassName: PropTypes.string,
    /**
     * Class applied to the tr row element which is a child node in the hierarchy tree (i.e. not the root nodes).
     */
    bodyRowChildClassName: PropTypes.string,
    /**
     * Class applied to the tr row element which is the last leaf node in its hierarchy tree (i.e. the final item displayed in the table for each hierarchy tree).
     */
    bodyRowLastChildClassName: PropTypes.string,
    /**
     * Class applied to the icon that toggles visibility of the children of an item in the hierarchy.
     */
    expandToggleIconClassName: PropTypes.string,
    /**
     * The space between each tree (i.e. each root node) in the hierarchy.
     * -------
     * v rootNode1     |
     *   v childNode   | -> Tree1
     *     leafNode    |
     * -------
     * *rowSpacingHeight*
     * -------
     * > rootNode2     | -> Tree2
     */
    rowSpacingHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**
     * Options for confuring the hierarchical structure of the table.
     */
    hierarchyOptions: PropTypes.shape({
        /*
         * Function to build hierarchy from the table data if they are not initially flat (i.e. not in hierarchical format).
         * @param item[] - contains all data provided to the table.
         */
        hierarchyBuilder: PropTypes.func,
        /*
         * Extract key of a table data item's parent. Used as a parameter for hierarchyBuilder if data is not initially in hierarchical form.
         * @param item - contains a table data item.
         * Defaults to `item => item.parent`
         */
        parentKeyExtractor: PropTypes.func,
        /**
         * The key of table data item object that contains its level in the hierarchy. (item[levelKey] gives that item's level)
         * Must be keyof item.
         * Defaults to 'level'.
         */
        levelKey: PropTypes.string,
        /**
         * The key of table data item object that contains its children. (item[childrenKey] contains all the children of that item)
         * Must be keyof item.
         * Defaults to 'children'.
         */
        childrenKey: PropTypes.string,
        /**
         * The level of hierarchy upto which items are initially visible in the table.
         * Defaults to 1.
         */
        initialExpandedLevel: PropTypes.number,
    })
};

/**
 * Recursively collects keys of items that should be initially expanded based on initialExpandedLevel.
 */
function collectInitiallyExpandedKeys(items, keyExtractor, childrenKey, levelKey, initialExpandedLevel, expandedKeys = new Set()) {
    if (!items || !Array.isArray(items)) return expandedKeys;

    for (const item of items) {
        const itemLevel = item[levelKey] ?? 0;
        const children = item[childrenKey];

        // If this item has children and its level is less than initialExpandedLevel, expand it
        if (children && children.length > 0 && itemLevel < initialExpandedLevel) {
            const key = keyExtractor(item);
            expandedKeys.add(key);
            // Recursively process children
            collectInitiallyExpandedKeys(children, keyExtractor, childrenKey, levelKey, initialExpandedLevel, expandedKeys);
        }
    }

    return expandedKeys;
}

function HierarchicalTable(props) {
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
        levelKey = 'level',
        childrenKey = 'children',
        initialExpandedLevel = 1,
    } = hierarchyOptions;

    const tableData = useMemo(() => {
        const {
            hierarchyBuilder,
            parentKeyExtractor,
        } = hierarchyOptions;

        if (hierarchyBuilder) {
            return hierarchyBuilder(data, {
                levelKey,
                childrenKey,
                keyExtractor,
                parentKeyExtractor
            })
        }
        return data;
    }, [hierarchyOptions, data, levelKey, childrenKey, keyExtractor]);

    const [expandedKeys, setExpandedKeys] = useState(() =>
        collectInitiallyExpandedKeys(
            tableData,
            keyExtractor,
            childrenKey,
            levelKey,
            initialExpandedLevel
        )
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
                initialExpandedLevel
            )
        );
    }, [keyExtractor, childrenKey, levelKey, initialExpandedLevel]);

    const handleToggleExpand = useCallback((itemKey) => {
        setExpandedKeys(prevKeys => {
            const newKeys = new Set(prevKeys);
            if (newKeys.has(itemKey)) {
                newKeys.delete(itemKey);
            } else {
                newKeys.add(itemKey);
            }
            return newKeys;
        });
    }, []);

    const renderHierarchicalRow = useCallback((tableRowProps) => {
        if (rowRenderer) {
            return rowRenderer(tableRowProps)
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
    }, [
        rowRenderer,
        bodyRowParentClassName,
        bodyRowChildClassName,
        bodyRowLastChildClassName,
        expandToggleIconClassName,
        onRowClick,
        renderDataItem,
        bodyRowClassName,
        dataClassName,
        rowSpacingHeight,
        levelKey,
        childrenKey,
        expandedKeys,
        handleToggleExpand,
        keyExtractor,
    ]);

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

HierarchicalTable.propTypes = { ...Table.propTypes, ...propTypes };
export default HierarchicalTable;


function HierarchicalRow({
    item,
    index,
    onClick,
    columns,
    className,
    dataClassName,
    parentClassName,
    childClassName,
    lastChildClassName,
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
}) {
    const rowPath = useMemo(() => path ? [...path, childrenKey, index] : [index], [path, childrenKey, index]);

    const itemKey = useMemo(() => keyExtractor(item), [keyExtractor, item]);
    const isExpanded = useMemo(() => expandedKeys.has(itemKey), [expandedKeys, itemKey]);

    const handleClickRow = useCallback(() => {
        onClick && onClick(item);
    }, [onClick, item]);

    const handleToggle = useCallback((e) => {
        e.stopPropagation();
        onToggleExpand(itemKey);
    }, [onToggleExpand, itemKey]);

    const ToggleIcon = useMemo(() => isExpanded ? MdKeyboardArrowDown : MdKeyboardArrowRight, [isExpanded]);

    const hasChildren = useMemo(() => item[childrenKey] && item[childrenKey].length > 0, [item, childrenKey]);

    return (
        <>
            <tr
                className={cs(styles.row, className, {
                    [childClassName]: (item[levelKey] ?? 0) > 0,
                    [parentClassName]: hasChildren && isExpanded,
                    [lastChildClassName]: !isExpanded && (isLastChild || (item[levelKey] ?? 0) === 0),
                })}
                onClick={handleClickRow}
            >
                {columns.map((column, columnIndex) => (
                    <td
                        className={cs(styles.data, styles.dataHierarchical, dataClassName)}
                        key={column.accessor + index + columnIndex}
                        style={{
                            '--row-level': `${item[levelKey] ?? 0}rem`,
                            '--row-offset': (item[levelKey] ?? 0) === 0 || hasChildren ? '0rem' : '1rem',
                        }}
                    >
                        {columnIndex === 0 && hasChildren && (
                            <ToggleIcon className={expandToggleIconClassName} onClick={handleToggle} />
                        )}
                        {renderDataItem({ item, column, index, path: rowPath })}
                    </td>
                ))}
            </tr>
            {isExpanded && item[childrenKey] &&
                item[childrenKey].map((childItem, childItemIndex) => (
                    <HierarchicalRow
                        key={keyExtractor(childItem)}
                        item={childItem}
                        index={childItemIndex}
                        columns={columns}
                        dataClassName={dataClassName}
                        isLastChild={childItemIndex === item[childrenKey].length - 1}
                        renderDataItem={renderDataItem}
                        onClick={onClick}
                        parentClassName={parentClassName}
                        childClassName={childClassName}
                        className={className}
                        lastChildClassName={(isLastChild || (item[levelKey] ?? 0) === 0) ? lastChildClassName : ''}
                        expandToggleIconClassName={expandToggleIconClassName}
                        levelKey={levelKey}
                        childrenKey={childrenKey}
                        path={rowPath}
                        expandedKeys={expandedKeys}
                        onToggleExpand={onToggleExpand}
                        keyExtractor={keyExtractor}
                    />
                ))}
            {!!rowSpacingHeight && (item[levelKey] ?? 0) === 0 && <tr className={styles.rowSpacing} style={{ height: rowSpacingHeight }} />}
        </>
    );
}
