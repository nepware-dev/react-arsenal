import { type KeyExtractor, type TableProps } from '..';
import { type ValueExtractor } from '../../Form/SelectInput';

export type Hierarchical<T, C extends string = 'children', L extends string = 'level'> = T & {
    [K in C]: Hierarchical<T, C, L>[];
} & {
    [K in L]: number;
};

export type TableHierarchyOptions<T, C extends string = 'children', L extends string = 'level'> = {
    /*
     * Function to build hierarchy from the table data if they are not initially flat (i.e. not in hierarchical format).
     * @param item[] - contains all data provided to the table.
     * @param options - contains the following properties:
     *  - levelKey: the key of table data item object that contains its level in the hierarchy. (item[levelKey] gives that item's level)
     *  - childrenKey: the key of table data item object that contains its children. (item[childrenKey] contains all the children of that item)
     *  - keyExtractor: function to extract key of a table data item.
     *  - parentKeyExtractor: function to extract key of a table data item's parent.
     * @returns Hierarchical<T, C, L>[] - returns a hierarchical array of items.
     */
    hierarchyBuilder?: (
        data: T[],
        options: {
            levelKey: L;
            childrenKey: C;
            keyExtractor: KeyExtractor<T>;
            parentKeyExtractor?: ValueExtractor<Hierarchical<T, C, L>, string | number | null>;
        },
    ) => Hierarchical<T, C, L>[];
    /*
     * Extract key of a table data item's parent. Used as a parameter for hierarchyBuilder if data is not initially in hierarchical form.
     * @param item - contains a table data item.
     * Defaults to `item => item.parent`
     */
    parentKeyExtractor?: ValueExtractor<Hierarchical<T, C, L>, string | number | null>;
    /**
     * The key of table data item object that contains its level in the hierarchy. (item[levelKey] gives that item's level)
     * Must be keyof item.
     * Defaults to 'level'.
     */
    levelKey?: L;
    /**
     * The key of table data item object that contains its children. (item[childrenKey] contains all the children of that item)
     * Must be keyof item.
     * Defaults to 'children'.
     */
    childrenKey?: C;
    /**
     * The level of hierarchy upto which items are initially visible in the table.
     * Defaults to 1.
     */
    initialExpandedLevel?: number;
};

export interface HierarchicalTableProps<
    T,
    C extends string = 'children',
    L extends string = 'level',
> extends Omit<TableProps<Hierarchical<T, C, L>>, 'data' | 'keyExtractor'> {
    /**
     * The data to be displayed in the table.
     * Can be either a flat array of items (T[]) or a hierarchical array of items (Hierarchical<T, C, L>[]).
     * If a flat array is provided, a `hierarchyBuilder` function must be provided in `hierarchyOptions` to convert the flat data into a hierarchy.
     * If a hierarchical array is provided, the `hierarchyBuilder` function is optional.
     */
    data: T[] | Hierarchical<T, C, L>[];
    keyExtractor: KeyExtractor<T>;
    bodyRowParentClassName?: string;
    /**
     * Class applied to the tr row element which is a child node in the hierarchy tree (i.e. not the root nodes).
     */
    bodyRowChildClassName?: string;
    /**
     * Class applied to the tr row element which is the last leaf node in its hierarchy tree (i.e. the final item displayed in the table for each hierarchy tree).
     */
    bodyRowLastChildClassName?: string;
    /**
     * Class applied to the icon that toggles visibility of the children of an item in the hierarchy.
     */
    expandToggleIconClassName?: string;
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
    rowSpacingHeight?: string | number;
    hierarchyOptions?: TableHierarchyOptions<T, C, L>;
}
export * from '..';
