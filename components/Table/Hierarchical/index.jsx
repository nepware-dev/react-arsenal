import { useState, useMemo, useCallback } from 'react';
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

    const tableData = useMemo(() => {
        const {
            hierarchyBuilder,
            parentKeyExtractor,
            levelKey,
            childrenKey,
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
    }, [hierarchyOptions, data]);

    const renderHierarchicalRow = useCallback((tableRowProps) => {
        const {
            levelKey = 'level',
            childrenKey = 'children',
            initialExpandedLevel = 1,
        } = hierarchyOptions;

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
                isInitiallyExpanded={initialExpandedLevel > -1}
                levelKey={levelKey}
                childrenKey={childrenKey}
            />
        );
    }, [
        hierarchyOptions,
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
    isInitiallyExpanded,
    isLastChild,
    rowSpacingHeight,
    initialExpandedLevel,
    levelKey,
    childrenKey,
    path
}) {
    const rowPath = useMemo(() => path ? [...path, childrenKey, index] : [index], [path, childrenKey, index]);

    const handleClickRow = useCallback(() => {
        onClick && onClick(item);
    }, [onClick, item]);

    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

    const handleToggle = useCallback(() => {
        setIsExpanded(previousIsExpanded => !previousIsExpanded);
    }, []);

    const ToggleIcon = useMemo(() => {
        if (isExpanded) {
            return MdKeyboardArrowDown;
        }
        return MdKeyboardArrowRight;
    }, [isExpanded]);

    return (
        <>
            <tr
                className={cs(styles.row, className, {
                    [childClassName]: item[levelKey] > 0,
                    [parentClassName]: item[childrenKey]?.length > 0 && isExpanded,
                    [lastChildClassName]: !isExpanded && (isLastChild || item.level === 0),
                })}
                onClick={handleClickRow}
            >
                {columns.map((column, columnIndex) => (
                    <td
                        className={cs(styles.data, styles.dataHierarchical, dataClassName)}
                        key={column.accessor + index}
                        style={{
                            '--row-level': item[levelKey] ? `${item[levelKey]}rem` : '0rem',
                            '--row-offset': item[levelKey] === 0 || item[childrenKey]?.length ? '0rem' : '1rem',
                        }}
                    >
                        {columnIndex === 0 && item[childrenKey] && item[childrenKey].length > 0 && (
                            <ToggleIcon className={expandToggleIconClassName} onClick={handleToggle} />
                        )}
                        {renderDataItem({ item, column, index, path: rowPath })}
                    </td>
                ))}
            </tr>
            {isExpanded && item[childrenKey] &&
                item[childrenKey]?.map((childItem, childItemIndex) => (
                    <HierarchicalRow
                        key={`row-${item[levelKey]}-${childItemIndex}`}
                        item={childItem}
                        index={childItemIndex}
                        columns={columns}
                        dataClassName={dataClassName}
                        isLastChild={childItemIndex === item[childrenKey]?.length - 1}
                        renderDataItem={renderDataItem}
                        isInitiallyExpanded={initialExpandedLevel > item[levelKey]}
                        initialExpandedLevel={initialExpandedLevel}
                        parentClassName={parentClassName}
                        childClassName={childClassName}
                        className={className}
                        lastChildClassName={(isLastChild || item.level === 0) ? lastChildClassName : ''}
                        expandToggleIconClassName={expandToggleIconClassName}
                        levelKey={levelKey}
                        childrenKey={childrenKey}
                        path={rowPath}
                    />
                ))}
            {!!rowSpacingHeight && !item[levelKey] && <tr className={styles.rowSpacing} style={{ height: rowSpacingHeight }} />}
        </>
    );
}
