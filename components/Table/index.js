import React, {useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';

import List from '../List';
import cs from '../../cs';
import styles from './styles.module.scss';

const propTypes = {
    /* 
     * Class Applied to table element.
     */
    className: PropTypes.string,
    /*
     * Class Applied to thead element.
     */
    headerClassName: PropTypes.string,
    /*
     * Class applied to tr element of thead.
     */
    headerRowClassName: PropTypes.string,
    /*
     * Class applied to tbody element.
     */
    bodyClassName: PropTypes.string,
    /*
     * Class applied to every tr element of tbody.
     */
    bodyRowClassName: PropTypes.string,
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
    loading: PropTypes.boolean,
    /*
     * Component to use when data is loading
     */
    LoadingComponent: PropTypes.oneOfType([
        PropTypes.element, 
        PropTypes.elementType
    ]),
    /*
     * Boolean describing if the table is controlled.
     * If controlled, all data passed to table will be visible regardless of props passed for page or maxRows.
     */
    controlled: PropTypes.boolean,
};

const Row = ({item, onClick, columns, className, renderDataItem}) => {
    const handleClickRow = useCallback(() => {
        onClick && onClick(item);
    }, [onClick, item]);

    return (
        <tr 
            className={cs(styles.row, className)} 
            onClick={handleClickRow}
        >
            {columns.map(col => {
                return (
                    <td key={col.accessor} className={styles.data}>
                        {renderDataItem ? renderDataItem({item, column: col}) : item[col.accessor]}
                    </td>
                );
            })}
        </tr>
    );
};

const Table = ({
    className,
    headerClassName,
    headerRowClassName,
    bodyClassName,
    bodyRowClassName,
    onRowClick,
    loading,
    LoadingComponent,
    data,
    columns,
    renderHeaderItem,
    renderDataItem,
    page=1,
    maxRows=10,
    controlled,
}) => {
    const visibleData = useMemo(() => {
        if(controlled) {
            return data;
        }
        const initIndex = (page - 1) * maxRows;
        return data.slice(initIndex, initIndex + maxRows);
    }, [data, maxRows, page]);

    const Header = useMemo(() => {
        return (
            <thead className={cs(styles.head, headerClassName)}>
                <tr className={cs(styles.headerRow, headerRowClassName)}>
                    {columns.map(col => {
                        return (
                            <th key={col.accessor} className={styles.data}>
                                {renderHeaderItem ? renderHeaderItem({column: col}) : col.Header}
                            </th>
                        );
                    })}
                </tr>
            </thead>
        );
    }, [columns, renderHeaderItem]);

    const renderRow = useCallback(listProps => {
        return (
            <Row 
                {...listProps} 
                onClick={onRowClick} 
                columns={columns} 
                renderDataItem={renderDataItem}
                className={bodyRowClassName}
            />
        );
    }, [columns, renderDataItem, bodyRowClassName, onRowClick]);


    const Body = useMemo(() => {
        return (
            <List
                loading={loading}
                LoadingComponent={LoadingComponent}
                className={cs(styles.body, bodyClassName)}
                data={visibleData}
                renderItem={renderRow}
                keyExtractor={(item, index) => index}
                component="tbody"
            />
        );
    }, [visibleData, loading, renderRow, LoadingComponent]);

    return (
        <table className={cs(styles.table, className)}>
            {Header}
            {Body}
        </table>
    );
}

Table.propTypes = propTypes;

export default React.memo(Table);
