import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { FiChevronDown } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';

import Options from './Options';
import styles from './styles.module.scss';
import type { SelectInputProps } from './types';
import Input from '../Input';
import Localize from '../../I18n/Localize';
import Popup from '../../Popup';
import cs from '../../../cs';
import { isArray } from '../../../utils';

const noop = () => {};

interface SelectState<T> {
    locked: boolean;
    expanded: boolean;
    searchValue: string;
    selectedItem?: T | null;
    focusedItem: T | null;
    options: T[];
    meta: {
        warning: string | null;
        touched: boolean;
    };
}

function Select<T, V extends ReactNode>(props: SelectInputProps<T, V>) {
    const {
        options = [],
        name,
        value,
        defaultValue,
        onChange = noop,
        onInputChange,
        className: _className,
        optionsWrapperClassName,
        selectOptionClassName,
        optionItemClassName,
        controlClassName,
        loading = false,
        disabled = false,
        anchorOrigin = 'bottom left',
        transformOrigin = 'top left',
        clearable = true,
        searchable = true,
        placeholder = 'Select...',
        keyExtractor,
        valueExtractor,
        searchExtractor,
        isDisabledExtractor,
        errorMessage,
        optionsDirection = 'down',
        LoadingComponent,
        FilterEmptyComponent,
        EmptyComponent,
        FooterComponent,
        required,
        showRequired,
        renderDisplayLabel,
        onOptionsEndReach,
        onEndReachedThreshold,
        container,
    } = props;

    const [selectState, setSelectState] = useState<SelectState<T>>({
        locked: false,
        expanded: false,
        searchValue: '',
        selectedItem: value ?? defaultValue,
        focusedItem: value ?? defaultValue ?? options?.[0],
        options: options,
        meta: {
            warning: null,
            touched: false,
        },
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<T[]>(options);

    const showPlaceholder = !selectState.searchValue && !selectState.selectedItem;
    const showValue = !selectState.searchValue && selectState.selectedItem;
    const showClose = !loading && clearable && selectState.selectedItem;

    const className = cs(
        styles.selectContainer,
        {
            disabled,
            [styles.disabled]: disabled,
        },
        _className,
    );


    const filterOptions = useCallback(
        (searchValue: string) => {
            if (searchValue === '') {
                return options;
            }

            return options.filter((opt) => {
                // If searchExtractor is provided, use it for filtering
                if (searchExtractor) {
                    const searchText = searchExtractor(opt);
                    if (typeof searchText === 'string') {
                        return searchText.toLowerCase().includes(searchValue.toLowerCase());
                    }
                    return false;
                }

                // Otherwise try valueExtractor (only works if it returns a string)
                const extractedValue = valueExtractor(opt);
                if (typeof extractedValue === 'string') {
                    return extractedValue.toLowerCase().includes(searchValue.toLowerCase());
                }
                return false;
            });
        },
        [options, searchExtractor, valueExtractor],
    );

    const showOption = useCallback(() => {
        setSelectState((prev) => ({
            ...prev,
            expanded: true,
        }));

        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const getFocusedItem = useCallback((options: T[]): T => {
        const targetItem = value ?? defaultValue;
        if (!targetItem) return options[0];

        const targetKey = keyExtractor(targetItem, -1);

        const hasTargetInOptions = options.some((opt, idx) => keyExtractor(opt, idx) === targetKey);

        return hasTargetInOptions ? targetItem : options[0];
    }, [value, defaultValue, keyExtractor]);

    const handleInputChange = useCallback(
        ({ value: changedValue }: { value: string }) => {
            if (onInputChange) {
                onInputChange(changedValue);
            }

            setSelectState((prev) => {
                const filteredOptions = onInputChange ? prev.options : filterOptions(changedValue);
                const updatedFocusedItem = getFocusedItem(filteredOptions);

                return {
                    ...prev,
                    options: filteredOptions,
                    focusedItem: updatedFocusedItem,
                    searchValue: changedValue,
                };
            });

            if (changedValue) {
                showOption();
            }
        },
        [filterOptions, getFocusedItem, onInputChange, showOption],
    );

    const hideOption = useCallback(() => {
        setSelectState((prev) => ({
            ...prev,
            expanded: false,
        }));

        if (selectState.searchValue !== '') {
            handleInputChange({ value: '' });
        }
    }, [selectState.searchValue, handleInputChange]);

    const handleChangeCallback = useCallback(
        (payload: { name?: string; option: T | null }) => {
            const warning = required && !payload.option ? 'Required' : null;
            setSelectState((prev) => ({
                ...prev,
                meta: { ...prev.meta, touched: true, warning },
            }))
            return onChange?.(payload);
        },
        [required, onChange],
    );

    const handleClearIconClick = useCallback(
        (event: React.MouseEvent<SVGElement>) => {
            event.stopPropagation();
            setSelectState((prev) => ({
                ...prev,
                selectedItem: null,
            }));
            hideOption();
            handleChangeCallback({ name, option: null });
        },
        [name, hideOption, handleChangeCallback],
    );

    const handleCaretClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            event.preventDefault();

            const { expanded, locked } = selectState;

            if (locked) return;

            if (expanded) {
                hideOption();
            } else {
                showOption();
            }
        },
        [selectState.expanded, selectState.locked, hideOption, showOption],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Tab' || event.key === 'Escape') {
                hideOption();
            } else if (event.key === 'Enter') {
                const focusedItem = selectState.focusedItem;
                if (focusedItem) {
                    setSelectState((prev) => ({
                        ...prev,
                        selectedItem: focusedItem,
                    }));
                    handleChangeCallback({ name, option: focusedItem });
                    hideOption();
                }
            }
        },
        [selectState.focusedItem, name, handleChangeCallback, hideOption],
    );

    const handleOptionClick = useCallback(
        ({ item }: { item: T }) => {
            setSelectState((prev) => ({
                ...prev,
                selectedItem: item,
            }));

            hideOption();

            inputRef.current?.blur();
            wrapperRef.current?.blur();

            handleChangeCallback({ name, option: item });
        },
        [name, handleChangeCallback, hideOption],
    );

    const handleSelectFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
        // Skip focus events where relatedTarget is null — this happens when the previously
        // focused element was removed from the DOM (e.g. FocusLock returnFocus after a Popup unmounts).
        if (event.relatedTarget === null) {
            return;
        }
        if (!disabled) {
            event.stopPropagation();
            setSelectState((prev) => ({ ...prev, expanded: true, locked: true }));
            setTimeout(() => setSelectState((prev) => ({ ...prev, locked: false })), 300);
        }
    },[disabled])

    const handleItemFocus = useCallback(({ item }: { item: T }) => {
        setSelectState((prev) => ({ ...prev, focusedItem: item }));
    }, []);

    const getErrorMessage = useCallback(() => {
        if (isArray(errorMessage)) {
            return errorMessage[0];
        }
        return errorMessage;
    }, [errorMessage]);

    const updateSelectValue = useCallback(() => {
        setSelectState((prev) => ({
            ...prev,
            selectedItem: value === undefined ? defaultValue ?? null : value,
        }));
    },[defaultValue, value]);

    const updateRequiredStatus = useCallback(() => {
        setSelectState((prev) => ({
            ...prev,
            meta: {
                ...prev.meta,
                warning: showRequired ? 'Required' : null,
            },
        }));
    }, [showRequired]);

    const updateSelectOptions = useCallback(() => {
        if (optionsRef.current === options) return;

        optionsRef.current = options;

        setSelectState((prev) => {
            const updatedOptions = onInputChange ? options : filterOptions(prev.searchValue);
            const updatedFocusedItem = getFocusedItem(updatedOptions);

            return {
                ...prev,
                options: onInputChange ? options : filterOptions(prev.searchValue),
                focusedItem: updatedFocusedItem,
            };
        });
    },[options, getFocusedItem, filterOptions, onInputChange]);

    useEffect(() => {
        updateSelectValue();
    }, [updateSelectValue]);


    useEffect(() => {
        updateRequiredStatus();
    }, [updateRequiredStatus]);

    useEffect(() => {
        updateSelectOptions();
    }, [updateSelectOptions]);

    const errMsg = getErrorMessage();

    return (
        <>
            <div
                ref={wrapperRef}
                className={className}
                tabIndex={disabled ? undefined : 0}
                onClick={handleCaretClick}
                onKeyDown={handleKeyDown}
                onFocusCapture={handleSelectFocus}
            >
                <div
                    className={cs(
                        styles.selectControl,
                        'select-control',
                        controlClassName,
                        [styles.selected, selectState.expanded],
                        [styles.warning, !!selectState.meta.warning],
                        [styles.error, !!errMsg],
                    )}
                >
                    <div className={cs(styles.selectValue, 'select-value')}>
                        {searchable && (
                            <Input
                                disabled={disabled}
                                inputRef={inputRef}
                                value={selectState.searchValue}
                                className={styles.input}
                                onChange={handleInputChange}
                            />
                        )}
                        {showPlaceholder && <div className={styles.placeholder}>{placeholder}</div>}
                        {showValue && (
                            <div className={styles.value}>
                                {renderDisplayLabel ? renderDisplayLabel(selectState.selectedItem!) : valueExtractor(selectState.selectedItem!)}
                            </div>
                        )}
                    </div>
                    <div className={cs(styles.selectIndicator, 'select-indicator')}>
                        {loading && <FaSpinner className={styles.loading} />}
                        {showClose && (
                            <IoMdClose className={styles.clear} onClick={handleClearIconClick} />
                        )}
                        <FiChevronDown size={16} />
                    </div>
                </div>
                <Popup
                    isVisible={selectState.expanded}
                    className={styles.popup}
                    disableFocusLock
                    anchor={wrapperRef}
                    anchorOrigin={optionsDirection === 'up' ? 'top right' : anchorOrigin}
                    transformOrigin={optionsDirection === 'up' ? 'bottom right' : transformOrigin}
                    onClose={hideOption}
                    container={container}
                >
                    <div className={cs(styles.selectOptionsWrapper, optionsWrapperClassName)}>
                        <Options
                            data={selectState.options}
                            keyExtractor={keyExtractor}
                            valueExtractor={valueExtractor}
                            isDisabledExtractor={isDisabledExtractor}
                            loading={loading}
                            className={cs(
                                styles.selectOptions,
                                'select_options',
                                selectOptionClassName,
                            )}
                            classNameItem={cs(styles.selectOption, optionItemClassName)}
                            selectedItem={selectState.selectedItem || undefined}
                            focusedItem={selectState.focusedItem || options?.[0]}
                            onItemClick={handleOptionClick}
                            onItemFocus={handleItemFocus}
                            LoadingComponent={LoadingComponent}
                            EmptyComponent={
                                selectState.searchValue ? FilterEmptyComponent : EmptyComponent
                            }
                            FooterComponent={FooterComponent}
                            onEndReached={onOptionsEndReach}
                            onEndReachedThreshold={onEndReachedThreshold}
                        />
                    </div>
                </Popup>
            </div>
            {!!errMsg && (
                <span className={styles.errorText}>
                    <Localize>{errMsg}</Localize>
                </span>
            )}
            {selectState.meta.warning && (
                <span className={styles.warningText}>
                    <Localize>{selectState.meta.warning}</Localize>
                </span>
            )}
        </>
    );
}

export default Select;

export * from './types';