import React, {useState, useMemo, useCallback, useEffect} from 'react';
import PropTypes from 'prop-types';

import {IoSearchOutline} from 'react-icons/io5';
import {FiChevronDown} from 'react-icons/fi';

import Input from '../Input';
import Popup from '../../Popup';
import Modal from '../../Modal';
import Options from './Options';
import SelectControl from './SelectControl';
import Icon from '../../Icon';
import cs from '../../../cs';
import {isArray} from '../../../utils';

import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    controlClassName: PropTypes.string,
    optionsWrapperClassName: PropTypes.string,
    selectOptionClassName: PropTypes.string,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool, //TODO
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    value: PropTypes.string,
    defaultValue: PropTypes.any,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    keyExtractor: PropTypes.func,
    isDisabledExtractor: PropTypes.func,
    valueExtractor: PropTypes.func,
    searchExtractor: PropTypes.func,
    /**
     * Anchor position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for anchor position reference check https://mui.com/components/popover/
     * @param {('top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center')
     */
    anchorOrigin: PropTypes.string,
    /**
     * Tranform position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for transform position reference check https://mui.com/components/popover/
     * @param {('top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center')
     */
    transformOrigin: PropTypes.string,
    onChange: PropTypes.func,
    /*
     * Called when the search input is changed
     * Passing this value will disable the internal filtering
     */
    onInputChange: PropTypes.func,
    optionsDirection: PropTypes.string,
    errorMessage: PropTypes.any,
    renderOptionLabel: PropTypes.func,
    renderControl: PropTypes.func,
    renderControlLabel: PropTypes.func,
    /*
     * Component to use when data is loading
     */
    LoadingComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType
    ]),
    /*
     * Component to use when filtered data is empty
     */
    FilterEmptyComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType
    ]),
    /*
     * Component to use when data is empty
     */
    EmptyComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType
    ]),
    /*
     * Footer of the select options
     * IMPORTANT: Elements that lock focus (such as links, buttons, inputs) should not be used here without proper focus handling when searchable prop enabled. Doing so causes focus to shift from search input to the focusable element, causing erroneous behavior when searching.
     */
    FooterComponent: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.elementType
    ]),
    /*
     * Callback function that is called when the end of options list is reached while scrolling
     * Useful for implementing infinite loading
     */
    onOptionsEndReach: PropTypes.func,
    /**
     * Threshold in pixels for calling onOptionsEndReach before the end of the list is reached
     */
    onEndReachedThreshold: PropTypes.number,
};

const MultiSelect = ({
    name,
    className: _className,
    controlClassName,
    optionsWrapperClassName,
    selectOptionClassName,
    loading = false,
    disabled = false,
    clearable = true,
    searchable = true,
    placeholder = 'Select...',
    keyExtractor = (item) => item.id,
    valueExtractor = (item) => item.name,
    searchExtractor,
    isDisabledExtractor,
    options = [],
    onChange = noop,
    anchorOrigin = 'bottom left',
    transformOrigin = 'top left',
    onInputChange,
    value,
    defaultValue,
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
}) => {

    const [expanded, setExpanded] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedItems, setSelectedItems] = useState(defaultValue || []);

    const [meta, setMeta] = useState({
        warning: null,
        touched: false
    });

    useEffect(() => {
        if(value && value.length === 0) {
            setSelectedItems([]);
        } else if(value?.length) {
            setSelectedItems(value);
        }
    }, [value]);

    useEffect(() => {
        if((!value || value.length === 0) && defaultValue && defaultValue.length > 0) {
            setSelectedItems(defaultValue);
            onChange({name, value: defaultValue});
        }
    }, [onChange, name, defaultValue, value]);

    useEffect(() => {
        setMeta(prevMeta => ({...prevMeta, warning: showRequired ? 'Required' : null}));
    }, [showRequired]);

    const wrapperRef = React.createRef();

    const className = useMemo(() => cs(
        styles.selectContainer,
        {
            disabled,
            [styles.disabled]: disabled,
            [styles.expanded]: expanded,
        },
        _className
    ), [disabled, expanded, _className]);

    const handleCaretClick = useCallback((event) => {
        event.stopPropagation();
        if (expanded && searchValue !== '') {
            handleSearchValueChange({value: ''});
        }
        setExpanded(!expanded);
    }, [expanded, searchValue]);

    const handleSearchValueChange = useCallback(({value}) => {
        onInputChange && onInputChange(value);
        setSearchValue(value);
    }, [onInputChange]);

    const filteredOptions = useMemo(() => {
        if(!onInputChange) {
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

    const handleAddItem = ({item}) => {
        const newSelectedItems = [...selectedItems, item];
        setMeta(prevMeta => ({...prevMeta, touched: true, warning: null}));
        setSelectedItems(newSelectedItems);
        onChange({name, value: newSelectedItems});
    };

    const handleRemoveItem = ({item}) => {
        const newSelectedItems = selectedItems.filter(i => keyExtractor(item) != keyExtractor(i));
        setSelectedItems(newSelectedItems);
        setMeta(prevMeta => ({...prevMeta, touched: true, warning: newSelectedItems.length ? null : showRequired && 'Required'}));
        onChange({name, value: newSelectedItems});
    };

    const handleStateChangeItem = ({item}) => {
        const index = selectedItems.findIndex(i => keyExtractor(item) === keyExtractor(i));
        selectedItems.splice(index, 1, item);
        const newSelectedItems = [...selectedItems];
        setSelectedItems(newSelectedItems);
        onChange({name, value: newSelectedItems});
    };

    const ControlComponent = useMemo(() => {
        return renderControl || SelectControl;
    }, [renderControl]);

    return (
        <>
            <div ref={wrapperRef} className={className} tabIndex="0">
                <ControlComponent
                    controlClassName={cs(controlClassName,{[styles.controlWarning]: meta.warning})}
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
                    onClose={handleCaretClick}
                >
                    {
                        searchable &&
                            <div className={styles.searchContainer}>
                                <Input
                                    placeholder="Search"
                                    className={styles.search}
                                    value={searchValue}
                                    onChange={handleSearchValueChange}
                                />
                                <IoSearchOutline className={styles.icon}/>
                            </div>
                    }
                    <Options
                        data={filteredOptions}
                        keyExtractor={keyExtractor}
                        valueExtractor={valueExtractor}
                        isDisabledExtractor={isDisabledExtractor}
                        anchor={wrapperRef}
                        loading={loading}
                        className={cs(styles.selectOptions, 'select_options', {
                            [styles.selectOptionsUp]: optionsDirection==='up'
                        }, optionsWrapperClassName)}
                        classNameItem={cs(styles.selectOption, selectOptionClassName)}
                        selectedItems={selectedItems}
                        onItemAdd={handleAddItem}
                        onItemRemove={handleRemoveItem}
                        onItemStateChange={handleStateChangeItem}
                        renderItemLabel={renderOptionLabel}
                        LoadingComponent={LoadingComponent}
                        EmptyComponent={searchValue?FilterEmptyComponent:EmptyComponent}
                        FooterComponent={FooterComponent}
                        onEndReached={onOptionsEndReach}
                        onEndReachedThreshold={onEndReachedThreshold}
                    />
                </Popup>
            </div>
            {Boolean(meta.warning) && <span className={styles.warningText}>{meta.warning}</span>}
        </>
    );
}

MultiSelect.propTypes = propTypes;

export default MultiSelect;
