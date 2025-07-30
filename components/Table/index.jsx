import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import List from '../List';
import cs from '../../cs';
import styles from './styles.module.scss';

const defaultKeyExtractor = (_item, index) => index;

const propTypes = {
    /*
     * Class Applied to table element.
     */
    className: PropTypes.string,
    /*
     * Style applied to table.
     */
    style: PropTypes.object,
    /*
     * Class Applied to thead element.
     */
    headerClassName: PropTypes.string,
    /*
     * Class applied to tr element of thead.
     */
    headerRowClassName: PropTypes.string,
    /*
     * Class applied to th element of table.
     */
    headerItemClassName: PropTypes.string,
    /*
     * Class applied to tbody element.
     */
    bodyClassName: PropTypes.string,
    /*
     * Class applied to every tr element of tbody.
     */
    bodyRowClassName: PropTypes.string,
    /*
     * Class applied to td element of table.
     */
    dataClassName: PropTypes.string,
    /*
     * Array of data to render in the table.
     */
    data: PropTypes.array.isRequired,
    /*
     * Array of columns for the table.
     * Requires Header and accessor keys for each column
     */
    columns: PropTypes.array.isRequired,
    /*
     * Extract key from data items.
     * @param item - Contains each data item present in the data array.
     */
    keyExtractor: PropTypes.func,
    /*
     * Renderer for header.
     * @param {{columns: array}} payload - Contains the columns array of table for rendering header.
     */
    renderHeader: PropTypes.func,
    /*
     * Renderer for each data item in header.
     * Appears as a direct child of td element.
     */
    renderHeaderItem: PropTypes.any,
    /*
     * Renderer for each data item in body.
     * Appears as a direct child of td element.
     */
    renderDataItem: PropTypes.any,
    /*
     * Renderer for row component.
     * @param {{columns: array, ...listProps}} payload - Contains the columns array of table and list props for rendering rows.
     */
    rowRenderer: PropTypes.func,
    /*
     * Current page of data to display.
     * Does not take affect if table is controlled.
     */
    page: PropTypes.number,
    /*
     * Maximum number of rows to display.
     * Does not rake effect if table is controlled.
     */
    maxRows: PropTypes.number,
    /*
     * Boolean describing whether data is currently loading.
     */
    loading: PropTypes.bool,
    /*
     * Component to use when data is loading
     */
    LoadingComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType,
    ]),
    /*
     * Component to use when data is empty
     */
    EmptyComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType,
    ]),
    /*
     * Boolean describing if the table is controlled.
     * If controlled, all data passed to table will be visible regardless of props passed for page or maxRows.
     */
    controlled: PropTypes.bool,
    /**
     * The space between each row in the table.
     */
    rowSpacing: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /**
     * Function called when table row is clicked
     * @param {rowItem} payload - Contains the item of the row clicked.
     */
    onRowClick: PropTypes.func
};

const Row = ({
    item,
    index,
    onClick,
    columns,
    className,
    dataClassName,
    renderDataItem,
    rowSpacingHeight
}) => {
    const handleClickRow = useCallback(() => {
        onClick && onClick(item);
    }, [onClick, item]);

    return (
        <>
            <tr
                className={cs(styles.row, className)}
                onClick={handleClickRow}
            >
                {columns.map((col, idx) => {
                    return (
                        <td
                            style={{
                                '--row-level': '0rem',
                                '--row-offset': '0rem'
                            }}
                            key={idx}
                            className={cs(styles.data, dataClassName)}
                        >
                            {renderDataItem ? renderDataItem({ item, index, column: col }) : item[col.accessor]}
                        </td>
                    );
                })}
            </tr>
            {!!rowSpacingHeight && <tr className={styles.rowSpacing} style={{ height: rowSpacingHeight }} />}
        </>
    );
};


const Table = (props) => {
    const {
        className,
        style,
        headerClassName,
        headerRowClassName,
        bodyClassName,
        bodyRowClassName,
        dataClassName,
        headerItemClassName,
        rowSpacing,
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
    } = props;

    const visibleData = useMemo(() => {
        if (controlled) {
            return data;
        }
        const initIndex = (page - 1) * maxRows;
        return data.slice(initIndex, initIndex + maxRows);
    }, [data, maxRows, page, controlled]);

    const Header = useMemo(() => {
        if (renderHeader) {
            return renderHeader({ columns });
        }
        return (
            <thead className={cs(styles.head, headerClassName)}>
                <tr className={cs(styles.headerRow, headerRowClassName)}>
                    {columns.map((col, idx) => {
                        return (
                            <th key={idx} className={cs(styles.data, headerItemClassName)}>
                                {renderHeaderItem ? renderHeaderItem({ column: col }) : col.Header}
                            </th>
                        );
                    })}
                </tr>
            </thead>
        );
    }, [columns, renderHeader, renderHeaderItem, headerClassName, headerRowClassName, headerItemClassName]);

    const renderRow = useCallback(listProps => {
        if (rowRenderer) {
            return rowRenderer({ ...listProps, columns });
        }
        return (
            <Row
                {...listProps}
                onClick={onRowClick}
                columns={columns}
                renderDataItem={renderDataItem}
                className={bodyRowClassName}
                dataClassName={dataClassName}
                rowSpacing={rowSpacing}
            />
        );
    }, [columns, renderDataItem, bodyRowClassName, onRowClick, rowRenderer, dataClassName, rowSpacing]);

    const Body = useMemo(() => {
        return (
            <List
                loading={loading}
                LoadingComponent={LoadingComponent}
                EmptyComponent={EmptyComponent}
                className={cs(styles.body, bodyClassName)}
                data={visibleData}
                renderItem={renderRow}
                keyExtractor={keyExtractor ?? defaultKeyExtractor}
                component="tbody"
            />
        );
    }, [visibleData, loading, renderRow, LoadingComponent, bodyClassName, EmptyComponent]);

    return (
        <table style={style} className={cs(styles.table, className)}>
            {Header}
            {Body}
        </table>
    );
}

Table.propTypes = propTypes;

export default React.memo(Table);
