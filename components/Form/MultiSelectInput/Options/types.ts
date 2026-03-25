import type { ValueExtractor } from '../types';
import type { KeyExtractor, ListProps } from '../../../List';

export interface OptionProps {
    className?: string;
    label: React.ReactNode;
    selected?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    disabled?: boolean;
}

export interface OptionsProps<T, V> extends Omit<ListProps<T>, 'renderItem'> {
    selectedItems?: T[];
    valueExtractor: ValueExtractor<T, V>;
    isDisabledExtractor?: (item: T) => boolean;
    onItemAdd: ({ item }: { item: T }) => void;
    onItemRemove: ({ item }: { item: T }) => void;
    onItemStateChange: ({ item }: { item: T }) => void;
    renderItemLabel?: (props: {
        selected: boolean;
        item: T;
        onStateChange: ({ item }: { item: T }) => void;
    }) => React.ReactNode;
}

export interface OptionItemProps<T, V> {
    item: T;
    classNameItem?: string;
    selectedItems: T[];
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T, V>;
    isDisabledExtractor?: (item: T) => boolean;
    onItemAdd: ({ item }: { item: T }) => void;
    onItemRemove: ({ item }: { item: T }) => void;
    onItemStateChange: ({ item }: { item: T }) => void;
    ItemLabel?: (props: {
        selected: boolean;
        item: T;
        disabled: boolean;
        onStateChange: ({ item }: { item: T }) => void;
    }) => React.ReactNode;
}
