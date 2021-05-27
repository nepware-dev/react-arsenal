import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';
import Options from './Options';
import Icon from '../../Icon';
import cs from '../../../cs';
import {isArray} from '../../../utils';

import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    controlClassName: PropTypes.string,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    value: PropTypes.string,
    defaultValue: PropTypes.any,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    keyExtractor: PropTypes.func,
    valueExtractor: PropTypes.func,
    onChange: PropTypes.func,
    optionsDirection: PropTypes.string,
    errorMessage: PropTypes.any,
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

export default class Select extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            searchValue: '',
            selectedItem: props.defaultValue,
            options: props.options,
        };
        this.wrapperRef = React.createRef();
        this.inputRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    componentDidUpdate(prevProps, prevState) {
        if(
            this.props.options !== prevProps.options ||
            this.state.searchValue !== prevState.searchValue
        ) {
            const options = this.filterOptions(this.state.searchValue);
            this.setState({
                options,
            });
        }
    }

    handleInputChange = ({value}) => {
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
        onChange && onChange({name: this.props.name, option: null});
    };

    handleClickOutside = (event) => {
        const {current: wrapper} = this.wrapperRef;

        if(!wrapper.contains(event.target)) {
            this.hideOption();
        }
    };

    handleCaretClick = (event) => {
        event.stopPropagation();
        const {expanded} = this.state;
        if(expanded) this.hideOption();
        else this.showOption();
    };

    handleOptionClick = ({item}) => {
        const {onChange} = this.props;

        this.setState({selectedItem: item});
        this.hideOption();

        onChange && onChange({name: this.props.name, option: item});
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
            controlClassName,
            loading,
            disabled,
            clearable,
            searchable,
            placeholder,
            keyExtractor,
            valueExtractor,
            optionsDirection,
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
                <div ref={this.wrapperRef} className={className}>
                    <div
                        className={cs(styles.selectControl, 'select-control', controlClassName)}
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
                                <Icon name="fas fa-spinner fa-spin" className={styles.loading} />
                            )}
                            {showClose && (
                                <Icon
                                    name="ion-md-close"
                                    className={styles.clear}
                                    onClick={this.handleClearIconClick}
                                />
                            )}
                            <Icon
                                name="ion-md-arrow-dropdown"
                                onClick={this.handleCaretClick}
                            />
                        </div>
                    </div>
                    {expanded && (
                        <Options
                            data={options}
                            keyExtractor={keyExtractor}
                            valueExtractor={valueExtractor}
                            loading={loading}
                            className={cs(styles.selectOptions, 'select_options', {
                                [styles.selectOptionsUp]: optionsDirection==='up'
                            })}
                            classNameItem={styles.selectOption}
                            selectedItem={selectedItem}
                            onItemClick={this.handleOptionClick}
                        />
                    )}
                </div>
                {!!errMsg && <span className={styles.errorText}>{errMsg}</span>}
            </>

        );
    }
}
