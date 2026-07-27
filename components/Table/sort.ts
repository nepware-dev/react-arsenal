import type { Column, SortDirection, SortState } from './types';

const sortCycle: (SortDirection | null)[] = ['asc', 'desc', null];

export function getNextSortDirection(
    currentDirection: SortDirection | null,
): SortDirection | null {
    const currentIndex = sortCycle.indexOf(currentDirection);
    return sortCycle[(currentIndex + 1) % sortCycle.length];
}

export function getSortValue<T>(item: T, column: Column<T>): unknown {
    if (column.sortAccessor) {
        return column.sortAccessor(item);
    }
    return (item as Record<string, unknown>)?.[column.accessor];
}

export function compareSortValues(firstValue: unknown, secondValue: unknown): number {
    if (firstValue === secondValue) {
        return 0;
    }
    if (firstValue === null || firstValue === undefined) {
        return 1;
    }
    if (secondValue === null || secondValue === undefined) {
        return -1;
    }
    if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return firstValue - secondValue;
    }
    if (typeof firstValue === 'boolean' && typeof secondValue === 'boolean') {
        return Number(firstValue) - Number(secondValue);
    }
    if (firstValue instanceof Date && secondValue instanceof Date) {
        return firstValue.getTime() - secondValue.getTime();
    }
    return String(firstValue).localeCompare(String(secondValue), undefined, {
        numeric: true,
        sensitivity: 'base',
    });
}

export function getSortedColumn<T>(
    sort: SortState | null,
    columns: Column<T>[],
): Column<T> | undefined {
    if (!sort) {
        return undefined;
    }
    const sortedColumn = columns.find((column) => column.accessor === sort.accessor);
    return sortedColumn?.sortable ? sortedColumn : undefined;
}

export function getSortedData<T>(
    data: T[],
    sort: SortState | null,
    columns: Column<T>[],
): T[] {
    const sortedColumn = getSortedColumn(sort, columns);
    if (!sort || !sortedColumn) {
        return data;
    }

    const directionFactor = sort.direction === 'desc' ? -1 : 1;
    const { sortComparator } = sortedColumn;

    return [...data].sort((firstItem, secondItem) => {
        if (sortComparator) {
            return directionFactor * sortComparator(firstItem, secondItem);
        }
        return (
            directionFactor *
            compareSortValues(
                getSortValue(firstItem, sortedColumn),
                getSortValue(secondItem, sortedColumn),
            )
        );
    });
}

export function getSortedHierarchicalData<T>(
    data: T[],
    sort: SortState | null,
    columns: Column<T>[],
    childrenKey: string,
): T[] {
    if (!getSortedColumn(sort, columns)) {
        return data;
    }

    return getSortedData(data, sort, columns).map((item) => {
        const children = (item as Record<string, unknown>)?.[childrenKey];
        if (!Array.isArray(children) || children.length === 0) {
            return item;
        }
        return {
            ...item,
            [childrenKey]: getSortedHierarchicalData(children as T[], sort, columns, childrenKey),
        };
    });
}
