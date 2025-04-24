import { TableProps } from '..';
import {ValueExtractor} from '../../Form/SelectInput';

export type Hierarchical<T, C extends string = "children", L extends string = "level"> = T & {
  [K in C]: Hierarchical<T, C, L>[];
} & {
  [K in L]: number;
};
export type TableHierarchyOptions<T, C extends string = "children", L extends string = "level"> = {
    hierarchyBuilder?: (data: T[]) => Hierarchical<T, C, L>[] ;
    parentKeyExtractor?: ValueExtractor<Hierarchical<T, C, L>, string | number | null>;
    levelKey?: L;
    childrenKey?: C;
    initialExpandedLevel?: number;
}

export interface HierarchicalTableProps<T> extends TableProps<T> {
    bodyRowParentClassName?: string;
    bodyRowChildClassName?: string;
    bodyRowLastChildClassName?: string;
    expandToggleIconClassName?: string;
    hierarchyOptions?: TableHierarchyOptions<T>;
}

export * from '..';

declare const HierarchicalTable;

export default HierarchicalTable;
