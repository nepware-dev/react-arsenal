import type { ReactNode } from 'react';

import type { KeyExtractor, ListProps } from '../../../components/List';
import type { OriginPosition, PopupProps } from '../../../components/Popup';

export type { KeyExtractor };

export type ValueExtractor<T, V> = (item: T) => V;
export type SearchExtractor<T> = (item: T) => string;
export type IsDisabledExtractor<T> = (item: T) => boolean;

export type SelectInputChangeCallback<T> = (payload: { name?: string; option: T | null }) => void;

export interface SelectInputProps<T, V extends ReactNode> {
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
    value?: T | null;
    defaultValue?: T | null;
    placeholder?: string;
    options: T[];
    required?: boolean;
    showRequired?: boolean;
    keyExtractor: KeyExtractor<T>;
    valueExtractor: ValueExtractor<T, V>;
    /*
     * Extracts the string used to filter options when searching
     * Ignored when onInputChange is passed, since internal filtering is disabled
     * When not provided, valueExtractor is used instead (only when it returns a string)
     */
    searchExtractor?: SearchExtractor<T>;
    isDisabledExtractor?: IsDisabledExtractor<T>;
    onChange?: SelectInputChangeCallback<T>;
    /*
     * Called when the search input is changed
     * Passing this value will disable the internal filtering
     */
    onInputChange?: (value: string) => void;
    /**
     * Anchor position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for anchor position reference check https://mui.com/components/popover/
     */
    anchorOrigin?: OriginPosition;
    /**
     * Transform position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for transform position reference check https://mui.com/components/popover/
     */
    transformOrigin?: OriginPosition;
    optionsDirection?: 'up' | 'down';
    errorMessage?: any;
    /*
     * Component to use when data is loading
     */
    LoadingComponent?: ListProps<T>['LoadingComponent'];
    /*
     * Component to use when filtered data is empty
     */
    FilterEmptyComponent?: ListProps<T>['EmptyComponent'];
    /*
     * Component to use when data is empty
     */
    EmptyComponent?: ListProps<T>['EmptyComponent'];
    /*
     * Footer of the select options
     * IMPORTANT: Elements that lock focus (such as links, buttons, inputs) should not be used here without proper focus handling when searchable prop enabled. Doing so causes focus to shift from search input to the focusable element, causing erroneous behavior when searching.
     */
    FooterComponent?: ListProps<T>['FooterComponent'];
    /*
     * Callback function that is called when the end of options list is reached while scrolling
     * Useful for implementing infinite loading
     */
    onOptionsEndReach?: () => void;
    onEndReachedThreshold?: number;
    renderDisplayLabel?: (option: T) => React.ReactNode;
    container?: PopupProps<HTMLElement>['container'];
    /**
     * When true, opening the options popup scrolls the currently selected option into view
     * (centered where the list edges allow) instead of starting at the top of the list.
     * Opt-in only - existing consumers keep today's top-of-list open behavior.
     * Has no effect when there is no selected value.
     */
    scrollToSelectedOnOpen?: boolean;
}
