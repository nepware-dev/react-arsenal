import React, {useMemo, useCallback} from 'react';
import PropType from 'prop-types';

import List from '../List';
import cs from '../../cs';
import styles from './styles.module.scss';

const Table = ({
    className,
    data,
    columns,
}) => {

    const Header = useMemo(() => {
        return (
            <thead className={styles.head}>
                <tr className={styles.headerRow}>
                    {columns.map(col => {
                        return <td key={col.accessor} className={styles.data}>{col.Header}</td>
                    })}
                    </tr>
            </thead>
        );
    }, [columns]);

    const renderRow = useCallback(({item}) => {
        return (
            <tr className={styles.row}>
                {columns.map(col => {
                    return <td key={col.accessor} className={styles.data}>{item[col.accessor]}</td>
                })}
            </tr>
        );
    }, [columns]);


    const Body = useMemo(() => {
        return (
            <List
                className={styles.body}
                data={data}
                renderItem={renderRow}
                keyExtractor={(item, index) => index}
                component="tbody"
            />
        );
    }, [data]);

    return (
        <table className={cs(styles.table, className)}>
            {Header}
            {Body}
        </table>
    );
}

Table.propTypes = {
    className: PropType.string,
    data: PropType.array.isRequired,
    columns: PropType.array.isRequired,
}

export default React.memo(Table);
