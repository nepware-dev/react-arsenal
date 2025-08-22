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

};

const defaultProps = {
    searchable: true,
    clearable: true,
    disabled: false,
    loading: false,
    placeholder: 'Select...',
    keyExtractor: (item) => item.id,
    valueExtractor: (item) => item.name,
    options: [],
    onChange: noop,
    optionsDirection: 'down',
};

const MultiSelect = ({
    name,
    className: _className,
    controlClassName,
    optionsWrapperClassName,
    selectOptionClassName,
    loading,
    disabled,
    clearable,
    searchable,
    placeholder,
    keyExtractor,
    valueExtractor,
    isDisabledExtractor,
    options,
    onChange,
    anchorOrigin,
    transformOrigin,
    onInputChange,
    value,
    defaultValue,
    optionsDirection,
    renderOptionLabel,
    renderControl,
    renderControlLabel,
    LoadingComponent,
    FilterEmptyComponent,
    FooterComponent,
    EmptyComponent,
    showRequired,
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
        setExpanded(!expanded);
    });

    const handleSearchValueChange = useCallback(({value}) => {
        onInputChange && onInputChange(value);
        setSearchValue(value);
    });

    const filteredOptions = useMemo(() => {
        if(!onInputChange) {
            return options.filter((d) =>
                valueExtractor(d)
                .toLowerCase()
                .includes(searchValue.toLowerCase())
            );
        }
        return options;
    }, [searchValue, options, valueExtractor]);

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
                    handleCaretClick={handleCaretClick}
                    selectedItems={selectedItems}
                    keyExtractor={keyExtractor}
                    valueExtractor={valueExtractor}
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
                    <ControlComponent
                        controlClassName={controlClassName}
                        placeholder={placeholder}
                        loading={loading}
                        expanded={expanded}
                        editable
                        handleCaretClick={handleCaretClick}
                        selectedItems={selectedItems}
                        keyExtractor={keyExtractor}
                        valueExtractor={valueExtractor}
                        onItemRemove={handleRemoveItem}
                        renderControlLabel={renderControlLabel}
                    />
                    <div className={styles.searchContainer}>
                        <Input
                            placeholder="Search"
                            className={styles.search}
                            value={searchValue}
                            onChange={handleSearchValueChange}
                        />
                        <IoSearchOutline className={styles.icon}/>
                    </div>
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
                    />
                </Popup>
            </div>
            {Boolean(meta.warning) && <span className={styles.warningText}>{meta.warning}</span>}
        </>
    );
}

MultiSelect.propTypes = propTypes;
MultiSelect.defaultProps = defaultProps;

export default MultiSelect;
