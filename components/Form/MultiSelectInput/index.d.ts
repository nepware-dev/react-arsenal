import * as React from 'react';

import type {KeyExtractor, ListRenderItem} from '../../List';
import type {OriginPosition} from '../../Popup';


export type {KeyExtractor, ListRenderItem};
export type {OriginPosition};

export type ValueExtractor<T, V> = (item: T) => V;

export type MultiSelectInputChangeCallback<T> = (payload: {name?: string, value: T[]}) => void;

export type RenderOptionLabelCallback<T> = (props: {
    selected?: boolean;
    item: T;
    onStateChange?: (payload: {item: T}) => void;
}) => React.ReactNode;

export type RenderControlCallback<T, V> = (props: {
    controlClassName?: string;
    placeholder?: string;
    loading?: boolean;
    expanded?: boolean;
    editable?: boolean;
    handleCaretClick?: React.MouseEventHandler<HTMLElement>;
    selectedItems: T[];
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T,V>;
    onItemRemove: (payload: {item: T}) => void;
}) => React.ReactNode;

export interface MultiSelectInputProps<T, V> {
    name?: string;
    className?: string;
    controlClassName?: string;
    optionsWrapperClassName?: string;
    selectOptionClassName?: string;
    searchable?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    value?: T[];
    defaultValue?: T;
    placeholder?: string;
    options: T[];
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T, V>;
    anchorOrigin?: OriginPosition;
    transformOrigin?: OriginPosition;
    onChange?: MultiSelectInputChangeCallback<T>;
    onInputChange?: (target: React.RefObject<HTMLInputElement | null>) => void;
    optionsDirection?: 'up' | 'down';
    errorMessage?: any;
    renderOptionLabel?: RenderOptionLabelCallback<T>;
    renderControl?: RenderControlCallback<T, V>;
    renderControlLabel?: ListRenderItem<T>;
    LoadingComponent?: React.ReactNode;
    FilterEmptyComponent?: React.ReactNode;
    EmptyComponent?: React.ReactNode;
}

declare const MultiSelectInput;

export default MultiSelectInput;
