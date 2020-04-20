import React from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import styles from './styles.module.scss';

const propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    label: PropTypes.string.isRequired,
};

const defaultProps = {};

export default class Dropdown extends React.Component {  
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

    showDropdown = () => {
        this.setState({ isOpen: true });
        document.addEventListener("click", this.hideDropdown);
    };

    hideDropdown = () => {
        this.setState({ isOpen: false });
        document.removeEventListener("click", this.hideDropdown);
    };

    render () {
        const { children, label } = this.props;    
        return (
            <div className={cs(
                styles.dropdown,
                {
                    [styles.open]: this.state.isOpen
                })}>
                <div
                    className={styles.dropdownToggle}
                    type="button"
                    onClick={this.showDropdown}>
                    <span className={styles.dropdownLabel}>{label}</span>
                    <span className={styles.caret}></span>
                </div>
                <div className={styles.dropdownMenu}>
                    {children}
                </div>
            </div>
        )
    }
}
