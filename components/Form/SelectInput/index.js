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
    data: PropTypes.array,
    onChange: noop,
};

const defaultProps = {
    className: '',
    searchable: true,
    clearable: true,
    disabled: false,
    loading: false,
    placeholder: 'Select an option...',
    data: [],
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
            data: props.data,
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

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data) {
            this.setState({
                data: this.props.data,
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
        event.stopPropagation();
        this.setState({
            selectedItem: null
        });
        this.hideOption();
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
        this.setState({ selectedItem: item });
        this.hideOption();
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
        return this.props.data.filter(
            d => d.value.toLowerCase().includes(
                searchValue.toLowerCase()
            )
        );
    }

    render() {
        const {
            className,
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
            data: _data,
        } = this.state;

        const data = this.filterOptions(searchValue);

        const showPlaceholder = !searchValue && !selectedItem;
        const showValue = !searchValue && selectedItem;
        const showClose = !loading && clearable && selectedItem;

        return (
            <div 
                ref={this.wrapperRef}
                className={cs(styles.selectContainer, className)}
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
                            <Icon name="fas fa-spinner fa-spin" />
                        }
                        {showClose &&
                            <Icon
                                name="ion-md-close"
                                onClick={this.handleClearIconClick} 
                            />
                        }
                        <Icon
                            name="ion-md-arrow-dropdown"
                            className={styles.dropdown}
                            onClick={this.handleCaretClick}
                        />
                    </div>
                </div>
                { expanded &&
                        <Options
                            data={data}
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
