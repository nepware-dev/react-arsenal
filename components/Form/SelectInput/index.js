import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {FiChevronDown} from 'react-icons/fi';
import {FaSpinner} from 'react-icons/fa';
import {IoMdClose} from 'react-icons/io';

import Input from '../Input';
import Popup from '../../Popup';
import Options from './Options';
import cs from '../../../cs';
import {isArray} from '../../../utils';

import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    optionsWrapperClassName: PropTypes.string,
    selectOptionClassName: PropTypes.string,
    optionItemClassName: PropTypes.string,
    controlClassName: PropTypes.string,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    keyExtractor: PropTypes.func,
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
    anchorOrigin: 'bottom left',
    transformOrigin: 'top left'
};

export default class Select extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            searchValue: '',
            selectedItem: props.value ?? props.defaultValue,
            options: props.options,
            meta: {
                warning: null,
                touched: false,
            },
        };
        this.wrapperRef = React.createRef();
        this.inputRef = React.createRef();
    }

    componentDidUpdate(prevProps, prevState) {
        const {valueExtractor, showRequired} = this.props;

        if(showRequired !== prevProps.showRequired) {
            this.setState({meta: {...this.state.meta, warning: showRequired ? 'Required' : null}});
        }

        if(
            (this.props.options !== prevProps.options ||
                this.state.searchValue !== prevState.searchValue) &&
            !this.props.onInputChange
        ) {
            const options = this.filterOptions(this.state.searchValue);
            this.setState({
                options,
            });
        }

        if(
            (this.props.defaultValue && !prevProps.defaultValue) || 
            (this.props.defaultValue && prevProps.defaultValue && 
                valueExtractor(this.props.defaultValue) !== valueExtractor(prevProps.defaultValue)
            )) {
            this.setState({
                selectedItem: this.props.defaultValue,
            });
            this.handleChangeCallback({name: this.props.name, option: this.props.defaultValue});
        }
    }

    handleChangeCallback = (payload) => {
        if(this.props.required && !payload.option) {
            this.setState({meta: {...this.state.meta, touched: true, warning: 'Required'}});
            return this.props.onChange?.(payload);
        }
        this.setState({meta: {...this.state.meta, touched: true, warning: null}});
        this.props.onChange?.(payload);
    };

    handleInputChange = ({value}) => {
        this.props.onInputChange && this.props.onInputChange(value);
        this.setState({
            searchValue: value,
        });
    };

    handleClearIconClick = (event) => {
        const {onChange} = this.props;

        event.stopPropagation();
        this.setState({
            selectedItem: null,
        });
        this.hideOption();
        this.handleChangeCallback({name: this.props.name, option: null});
    };

    handleCaretClick = (event) => {
        event.stopPropagation();
        const {expanded} = this.state;
        if(expanded) {
            this.hideOption();
        }
        else {
            this.showOption();
        }
    };

    handleOptionClick = ({item}) => {
        const {onChange} = this.props;

        this.setState({selectedItem: item});
        this.hideOption();

        this.handleChangeCallback({name: this.props.name, option: item});
    };

    showOption = () => {
        this.setState({expanded: true});
        this.inputRef.current && this.inputRef.current.focus();
    };

    hideOption = () => {
        this.setState({
            expanded: false,
            searchValue: '',
        });
    };

    filterOptions = (searchValue) => {
        return this.props.options.filter((d) =>
            this.props
                .valueExtractor(d)
                .toLowerCase()
                .includes(searchValue.toLowerCase())
    );
    };

    getErrorMessage = () => {
        if(isArray(this.props.errorMessage)) {
            return this.props.errorMessage[0];
        }
        return this.props.errorMessage;
    }

    render() {
        const {
            className: _className,
            optionsWrapperClassName,
            selectOptionClassName,
            optionItemClassName,
            controlClassName,
            loading,
            disabled,
            anchorOrigin,
            transformOrigin,
            clearable,
            searchable,
            placeholder,
            keyExtractor,
            valueExtractor,
            optionsDirection,
            LoadingComponent,
            FilterEmptyComponent,
            EmptyComponent,
            FooterComponent,
        } = this.props;

        const {expanded, searchValue, selectedItem, options} = this.state;

        const showPlaceholder = !searchValue && !selectedItem;
        const showValue = !searchValue && selectedItem;
        const showClose = !loading && clearable && selectedItem;

        const className = cs(
            styles.selectContainer,
            {
                disabled,
                [styles.disabled]: disabled,
            },
            _className
    );

        const errMsg = this.getErrorMessage();

        return (
            <>
                <div ref={this.wrapperRef} className={className} tabIndex="0">
                    <div
                        className={cs(
                            styles.selectControl,
                            'select-control',
                            controlClassName,
                            [styles.selected, expanded],
                            [styles.warning, this.state.meta.warning],
                            [styles.error, !!errMsg],
                        )}
                        onClick={this.handleCaretClick}
                    >
                        <div className={cs(styles.selectValue, 'select-value')}>
                            {searchable && (
                                <Input
                                    inputRef={this.inputRef}
                                    value={searchValue}
                                    className={styles.input}
                                    onChange={this.handleInputChange}
                                />
                            )}
                            {showPlaceholder && (
                                <div className={styles.placeholder}>{placeholder}</div>
                            )}
                            {showValue && (
                                <div className={styles.value}>{valueExtractor(selectedItem)}</div>
                            )}
                        </div>
                        <div className={cs(styles.selectIndicator, 'select-indicator')}>
                            {loading && (
                                <FaSpinner className={styles.loading} />
                            )}
                            {showClose && (
                                <IoMdClose
                                    className={styles.clear}
                                    onClick={this.handleClearIconClick}
                                />
                            )}
                            <FiChevronDown
                                size={16}
                                onClick={this.handleCaretClick}
                            />
                        </div>
                    </div>
                    <Popup
                        isVisible={expanded}
                        className={styles.popup}
                        anchor={this.wrapperRef}
                        anchorOrigin={optionsDirection==='up' ? 'top right' : anchorOrigin}
                        transformOrigin={optionsDirection==='up' ? 'bottom right' : transformOrigin}
                        onClose={this.handleCaretClick}
                    >
                        <div className={cs(styles.selectOptionsWrapper, optionsWrapperClassName)}>
                            <Options
                                data={options}
                                keyExtractor={keyExtractor}
                                valueExtractor={valueExtractor}
                                loading={loading}
                                className={cs(styles.selectOptions, 'select_options', selectOptionClassName)}
                                classNameItem={cs(styles.selectOption, optionItemClassName)}
                                selectedItem={selectedItem}
                                onItemClick={this.handleOptionClick}
                                LoadingComponent={LoadingComponent}
                                EmptyComponent={searchValue ? FilterEmptyComponent : EmptyComponent} 
                                FooterComponent={FooterComponent}
                            />
                        </div>
                    </Popup>
                </div>
                {!!errMsg && <span className={styles.errorText}>{errMsg}</span>}
                {this.state.meta.warning && <span className={styles.warningText}>{this.state.meta.warning}</span>}
            </>
        );
    }
}
