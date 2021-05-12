import React from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import styles from './styles.module.scss';

const propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    label: PropTypes.string,
    renderLabel: PropTypes.func,
    className: PropTypes.string,
    labelContainerClassName: PropTypes.string,
    align: PropTypes.string,
    showOnHover: PropTypes.bool,
};

const defaultProps = {
    align: 'left',
};

export default class Dropdown extends React.Component {  
    componentWillUnmount() {
        this.hideDropdown();
    }

    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);    
        this.state = {
            isOpen: false,
            labelItem: null,
            typeDropdown: null
        };
    }

    onMouseEnter = () => {
        this.props.showOnHover && this.showDropdown();
    }

    onMouseLeave = () => {
        this.props.showOnHover && this.hideDropdown();
    }

    onClick = () => {
        this.state.isOpen?this.hideDropdown():this.showDropdown();
    }

    showDropdown = () => {
        this.setState({ isOpen: true });
        setTimeout(() => {
            document.addEventListener("click", this.hideDropdown);
        }, 50);
    };

    hideDropdown = () => {
        this.setState({ isOpen: false });
        document.removeEventListener("click", this.hideDropdown);
    };

    render () {
        const { children, label, renderLabel, labelContainerClassName, className, align } = this.props;
        return (
            <div className={cs(
                styles.dropdown,
                className,
                {
                    [styles.open]: this.state.isOpen,
                })}>
                <div
                    className={cs(styles.dropdownToggle, labelContainerClassName)}
                    type="button"
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                    onClick={this.onClick}>
                    {renderLabel ? renderLabel() : (
                        <>
                            <span className={styles.dropdownLabel}>{label}</span>
                            <span className={styles.caret}></span>
                        </>
                    )}
                </div>
                <div className={cs(
                    styles.dropdownMenu,
                    {
                        [styles.alignLeft]: align==='left',
                        [styles.alignRight]: align==='right',
                    })}>
                {children}
            </div>
            </div>
        )
    }
}
