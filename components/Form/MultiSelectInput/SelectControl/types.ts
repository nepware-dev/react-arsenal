import type { KeyExtractor, ListRenderItem, ValueExtractor } from '../types';

export interface LabelProps<T, V> {
    item: T;
    valueExtractor: ValueExtractor<T, V>;
    editable?: boolean;
    onRemove: (args: { item: T }) => void;
}

export interface SelectControlProps<T, V> {
    maxItems?: number;
    controlClassName?: string;
    placeholder?: string;
    loading?: boolean;
    expanded?: boolean;
    editable?: boolean;
    handleCaretClick?: (event: React.MouseEvent<HTMLDivElement | SVGElement>) => void;
    selectedItems: T[];
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T, V>;
    onItemRemove: (payload: { item: T }) => void;
    renderControlLabel?: ListRenderItem<T>;
}
