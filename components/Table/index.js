import React, {useMemo, useCallback} from 'react';
import PropTypes from 'prop-types';

import List from '../List';
import cs from '../../cs';
import styles from './styles.module.scss';

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
    data,
    columns,
    renderHeaderItem,
    renderDataItem,
    page=1,
    maxRows=10,
}) => {
    const visibleData = useMemo(() => {
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
                className={cs(styles.body, bodyClassName)}
                data={visibleData}
                renderItem={renderRow}
                keyExtractor={(item, index) => index}
                component="tbody"
            />
        );
    }, [visibleData]);

    return (
        <table className={cs(styles.table, className)}>
            {Header}
            {Body}
        </table>
    );
}

Table.propTypes = {
    className: PropTypes.string,
    headerClassName: PropTypes.string,
    headerRowClassName: PropTypes.string,
    bodyClassName: PropTypes.string,
    bodyRowClassName: PropTypes.string,
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    renderHeaderItem: PropTypes.any,
    renderDataItem: PropTypes.any,
    page: PropTypes.number,
    maxRows: PropTypes.number,
}

export default React.memo(Table);
