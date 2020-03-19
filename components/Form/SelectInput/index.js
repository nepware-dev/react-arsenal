import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';
import Options from './Options';
import Icon from '../../Icon';
import cs from '../../../cs';
import styles from './styles.module.scss';

const noop = () => {};

const propTypes = {
    className: PropTypes.string,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    value: PropTypes.bool,
    placeholder: PropTypes.string,
    options: PropTypes.array,
    onChange: noop,
};

const defaultProps = {
    className: '',
    searchable: true,
    clearable: true,
    disabled: false,
    loading: false,
    placeholder: 'Select...',
    options: [],
};

export default class Select extends PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            searchValue: '',
            selectedItem: null,
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
        if (this.props.options !== prevProps.options ||
        this.state.searchValue !== prevState.searchValue) {
            const options = this.filterOptions(this.state.searchValue);
            this.setState({
                options,
            });
        }
    }

    // TODO: fix event
    handleInputChange = (event) => {
        const searchValue = event.target.value;
        this.setState({ 
            searchValue,
        });
    }

    handleClearIconClick = (event) => {
        const {onChange} = this.props;

        event.stopPropagation();
        this.setState({
            selectedItem: null
        });
        this.hideOption();
        onChange && onChange(null);
    }

    handleClickOutside = (event) => {
        const { current: wrapper } = this.wrapperRef;

        if (!wrapper.contains(event.target)) {
            this.hideOption();
        }
    }

    handleCaretClick = (event) => {
        event.stopPropagation();
        const {
            expanded
        } = this.state;
        if(expanded)
            this.hideOption();
        else 
            this.showOption();
    }

    handleOptionClick = ({item}) => {
        const {onChange} = this.props;

        this.setState({ selectedItem: item });
        this.hideOption();
        
        onChange && onChange(item);
    }

    showOption = () => {
        this.setState({ expanded: true });
        this.inputRef.current && this.inputRef.current.focus();
    }

    hideOption = () => {
        this.setState({ 
            expanded: false,
            searchValue: '',
        });
    }

    filterOptions = (searchValue) => {
        return this.props.options.filter(
            d => d.name.toLowerCase().includes(
                searchValue.toLowerCase()
            )
        );
    }

    render() {
        const {
            className: _className,
            value,
            loading,
            disabled,
            clearable,
            searchable,
            placeholder,
        } = this.props;

        const {
            expanded,
            searchValue,
            selectedItem,
            options,
        } = this.state;

        const showPlaceholder = !searchValue && !selectedItem;
        const showValue = !searchValue && selectedItem;
        const showClose = !loading && clearable && selectedItem;

        const className = cs(
            styles.selectContainer,
            _className,
            {
                disabled,
                [styles.disabled]: disabled,
            }
        );
        return (
            <div 
                ref={this.wrapperRef}
                className={className}
            >
                <div
                    className={cs(styles.selectControl, 'select-control')}
                    onClick={this.showOption}
                >
                    <div className={cs(styles.selectValue, 'select-value')}>
                        {searchable &&
                            <Input
                                inputRef={this.inputRef}
                                value={searchValue}
                                className={styles.input} 
                                onChange={this.handleInputChange}
                            />
                        }
                        { showPlaceholder &&
                            <div className={styles.placeholder}>{placeholder}</div>
                        }
                        { showValue &&
                            <div className={styles.value}>{selectedItem.value}</div>
                        }
                    </div>
                    <div className={cs(styles.selectIndicator, 'select-indicator')}>
                        {loading &&
                            <Icon 
                                name="fas fa-spinner fa-spin" 
                                className={styles.loading}
                            />
                        }
                        {showClose &&
                            <Icon
                                name="ion-md-close"
                                className={styles.clear}
                                onClick={this.handleClearIconClick} 
                            />
                        }
                        <Icon
                            name="ion-md-arrow-dropdown"
                            onClick={this.handleCaretClick}
                        />
                    </div>
                </div>
                { expanded &&
                        <Options
                            data={options}
                            loading={loading}
                            className={cs(styles.selectOptions, 'select_options')}
                            classNameItem={styles.selectOption}
                            selectedItem={selectedItem}
                            onItemClick={this.handleOptionClick}
                        />
                }
            </div>
        );
    }
}
