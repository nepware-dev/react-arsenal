import * as React from 'react';

import type {KeyExtractor} from '../../List';
export type {KeyExtractor};

export type ValueExtractor<T, V> = (item: T) => V;

export type SelectInputChangeCallback<T> = (payload: {name?: string, option: T | null}) => void;

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
    onChange?: SelectInputChangeCallback<T>;
    onInputChange?: (target: React.RefObject<HTMLInputElement>) => void;
    optionsDirection?: 'up' | 'down';
    errorMessage?: any;
    LoadingComponent?: React.ReactNode;
    FilterEmptyComponent?: React.ReactNode;
    EmptyComponent?: React.ReactNode;
    FooterComponent?: React.ReactNode;
}

declare const SelectInput;

export default SelectInput;
