import * as React from 'react';

import type {KeyExtractor} from '../../List';
export type {KeyExtractor};

export type ValueExtractor<T, V> = (item: T) => V;
export type IsDisabledExtractor<T> = (item: T) => boolean;

export type SelectInputChangeCallback<T> = (payload: {name?: string, option: T | null}) => void;

export type RenderOptionLabelProps<T> = {
    item: T;
    selected: boolean;
};

export type RenderOptionLabel<T> = React.FC<RenderOptionLabelProps<T>>;

export interface SelectInputProps<T, V> {
    name?: string;
    className?: string;
    optionsWrapperClassName?: string;
    selectOptionClassName?: string;
    optionItemClassName?: string;
    controlClassName?: string;
    searchable?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    value?: T;
    defaultValue?: T;
    placeholder?: string;
    options: T[];
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T, V>;
    isDisabledExtractor?: IsDisabledExtractor<T>;
    onChange?: SelectInputChangeCallback<T>;
    onInputChange?: (target: React.RefObject<HTMLInputElement | null>) => void;
    anchorOrigin?: OriginPosition;
    transformOrigin?: OriginPosition;
    optionsDirection?: 'up' | 'down';
    errorMessage?: any;
    LoadingComponent?: React.ReactNode;
    FilterEmptyComponent?: React.ReactNode;
    EmptyComponent?: React.ReactNode;
    FooterComponent?: React.ReactNode;
    renderOptionLabel?: RenderOptionLabel<T>;
}

declare const SelectInput;

export default SelectInput;
