import * as React from 'react';

export type {KeyExtractor} from '../List';
export type ValueExtractor<T, V> = (item: T) => V;

export type SelectInputChangeCallback<T> = (payload: {name?: string, option: T}) => void;

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
    onInputChange?: React.RefObject<HTMLInputElement>;
    optionsDirection?: 'up' | 'down';
    errorMessage?: any;
    LoadingComponent?: React.ReactNode;
    FilterEmptyComponent?: React.ReactNode;
    EmptyComponent?: React.ReactNode;
    FooterComponent?: React.ReactNode;
}

declare const SelectInput;

export default SelectInput;
