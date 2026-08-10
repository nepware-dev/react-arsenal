import React, { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { IoSearchOutline } from 'react-icons/io5';

import SelectControl from './SelectControl';
import styles from './styles.module.scss';
import type { MultiSelectInputProps } from './types';
import Options from './Options';
import Input from '../Input';
import Popup from '../../Popup';
import cs from '../../../cs';

const noop = () => {};

interface MetaState {
    warning: string | null;
    touched: boolean;
}
const MultiSelect = <T, V extends ReactNode>({
    name,
    className: _className,
    controlClassName,
    optionsWrapperClassName,
    selectOptionClassName,
    loading = false,
    disabled = false,
    searchable = true,
    placeholder = 'Select...',
    keyExtractor,
    valueExtractor,
    searchExtractor,
    isDisabledExtractor,
    options = [],
    onChange = noop,
    anchorOrigin = 'bottom left',
    transformOrigin = 'top left',
    onInputChange,
    value,
    defaultValue = [],
    optionsDirection = 'down',
    renderOptionLabel,
    renderControl,
    renderControlLabel,
    LoadingComponent,
    FilterEmptyComponent,
    FooterComponent,
    EmptyComponent,
    showRequired,
    onOptionsEndReach,
    onEndReachedThreshold,
    container,
}: MultiSelectInputProps<T, V>) => {
    const [expanded, setExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedItems, setSelectedItems] = useState<T[]>(defaultValue);

    const [meta, setMeta] = useState<MetaState>({
        warning: null,
        touched: false,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);

    const className = useMemo(
        () =>
            cs(
                styles.selectContainer,
                {
                    disabled,
                    [styles.disabled]: disabled,
                    [styles.expanded]: expanded,
                },
                _className,
            ),
        [disabled, expanded, _className],
    );

    const filteredOptions = useMemo(() => {
        if (!onInputChange) {
            return options.filter((d) => {
                // If searchExtractor is provided, use it for filtering
                if (searchExtractor) {
                    const searchText = searchExtractor(d);
                    if (typeof searchText === 'string') {
                        return searchText.toLowerCase().includes(searchValue.toLowerCase());
                    }
                    return false;
                }
                // Otherwise try valueExtractor (only works if it returns a string)
                const extracted = valueExtractor(d);
                if (typeof extracted === 'string') {
                    return extracted.toLowerCase().includes(searchValue.toLowerCase());
                }
                return false;
            });
        }
        return options;
    }, [searchValue, options, valueExtractor, searchExtractor, onInputChange]);

    const ControlComponent = useMemo(() => {
        return renderControl || SelectControl;
    }, [renderControl]);

    const handleSearchValueChange = useCallback(
        ({ value }: { value: string }) => {
            onInputChange && onInputChange(value);
            setSearchValue(value);
        },
        [onInputChange],
    );

    const handleToggleExpand = useCallback(() => {
        if (expanded && searchValue !== '') {
            handleSearchValueChange({ value: '' });
        }
        setExpanded((prev) => !prev);
    }, [expanded, searchValue, handleSearchValueChange]);

    const handleCaretClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement | SVGElement>) => {
            event.stopPropagation();
            handleToggleExpand();
        },
        [handleToggleExpand],
    );

    const handleAddItem = useCallback(
        ({ item }: { item: T }) => {
            const newSelectedItems = [...selectedItems, item];
            setMeta((prevMeta) => ({ ...prevMeta, touched: true, warning: null }));
            setSelectedItems(newSelectedItems);
            onChange({ name, value: newSelectedItems });
        },
        [selectedItems, name, onChange],
    );

    const handleRemoveItem = useCallback(
        ({ item }: { item: T }) => {
            // Item index is not available here, so we use -1 as a placeholder.
            // It is important that keyExtractor does not rely on index for correct functionality.
            const newSelectedItems = selectedItems.filter(
                (i, idx) => keyExtractor(item, -1) != keyExtractor(i, idx),
            );
            setSelectedItems(newSelectedItems);
            setMeta((prevMeta) => ({
                ...prevMeta,
                touched: true,
                warning: !newSelectedItems.length && showRequired ? 'Required' : null,
            }));
            onChange({ name, value: newSelectedItems });
        },
        [selectedItems, name, showRequired, onChange],
    );

    const handleStateChangeItem = useCallback(
        ({ item }: { item: T }) => {
            // Item index is not available here, so we use -1 as a placeholder.
            // It is important that keyExtractor does not rely on index for correct functionality.
            const index = selectedItems.findIndex(
                (i, idx) => keyExtractor(item, -1) === keyExtractor(i, idx),
            );

            if (index === -1) {
                return;
            }

            selectedItems.splice(index, 1, item);
            const newSelectedItems = [...selectedItems];
            setSelectedItems(newSelectedItems);
            onChange({ name, value: newSelectedItems });
        },
        [selectedItems, name, onChange],
    );

    useEffect(() => {
        if (value && value.length === 0) {
            setSelectedItems([]);
        } else if (value?.length) {
            setSelectedItems(value);
        }
    }, [value]);

    useEffect(() => {
        if ((!value || value.length === 0) && defaultValue && defaultValue.length > 0) {
            setSelectedItems(defaultValue);
            onChange({ name, value: defaultValue });
        }
    }, [defaultValue, name, value, onChange]);

    useEffect(() => {
        setMeta((prevMeta) => ({ ...prevMeta, warning: showRequired ? 'Required' : null }));
    }, [showRequired]);

    return (
        <>
            <div ref={wrapperRef} className={className} tabIndex={0}>
                <ControlComponent
                    controlClassName={cs(controlClassName, {
                        [styles.controlWarning]: !!meta.warning,
                    })}
                    placeholder={placeholder}
                    loading={loading}
                    expanded={expanded}
                    maxItems={5}
                    editable={!disabled}
                    handleCaretClick={handleCaretClick}
                    selectedItems={selectedItems}
                    keyExtractor={keyExtractor}
                    valueExtractor={valueExtractor}
                    onItemRemove={handleRemoveItem}
                    renderControlLabel={renderControlLabel}
                />
                <Popup
                    isVisible={expanded}
                    className={styles.popup}
                    anchor={wrapperRef}
                    anchorOrigin={anchorOrigin}
                    transformOrigin={transformOrigin}
                    onClose={handleToggleExpand}
                    container={container}
                >
                    {searchable && (
                        <div className={styles.searchContainer}>
                            <Input
                                placeholder="Search"
                                className={styles.search}
                                value={searchValue}
                                onChange={handleSearchValueChange}
                            />
                            <IoSearchOutline className={styles.icon} />
                        </div>
                    )}
                    <Options
                        data={filteredOptions}
                        keyExtractor={keyExtractor}
                        valueExtractor={valueExtractor}
                        isDisabledExtractor={isDisabledExtractor}
                        loading={loading}
                        className={cs(
                            styles.selectOptions,
                            'select_options',
                            {
                                [styles.selectOptionsUp]: optionsDirection === 'up',
                            },
                            optionsWrapperClassName,
                        )}
                        classNameItem={cs(styles.selectOption, selectOptionClassName)}
                        selectedItems={selectedItems}
                        onItemAdd={handleAddItem}
                        onItemRemove={handleRemoveItem}
                        onItemStateChange={handleStateChangeItem}
                        renderItemLabel={renderOptionLabel}
                        LoadingComponent={LoadingComponent}
                        EmptyComponent={searchValue ? FilterEmptyComponent : EmptyComponent}
                        FooterComponent={FooterComponent}
                        onEndReached={onOptionsEndReach}
                        onEndReachedThreshold={onEndReachedThreshold}
                    />
                </Popup>
            </div>
            {Boolean(meta.warning) && <span className={styles.warningText}>{meta.warning}</span>}
        </>
    );
};

export default MultiSelect;

export * from './types';
