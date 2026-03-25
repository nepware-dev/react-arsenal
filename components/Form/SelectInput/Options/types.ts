import type { KeyExtractor, ValueExtractor } from '../types';
import type { ListProps } from '../../../List';

export interface OptionProps<T> {
    className?: string;
    selected?: boolean;
    focused?: boolean;
    label: T;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onFocus?: (event: React.MouseEvent<HTMLDivElement>) => void;
    disabled?: boolean;
}

export interface OptionsProps<T, V> extends Omit<ListProps<T>, 'onItemClick' | 'renderItem'> {
    data: T[];
    className?: string;
    classNameItem?: string;
    selectedItem?: T;
    focusedItem?: T;
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T, V>;
    isDisabledExtractor?: (item: T) => boolean;
    onItemClick?: ({ item }: { item: T }) => void;
    onItemFocus?: ({ item }: { item: T }) => void;
}
