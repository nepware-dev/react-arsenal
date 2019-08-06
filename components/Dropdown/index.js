import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

const propTypes = {
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
            <div className={`dropdown ${this.state.isOpen ? 'open' : ''}`}>
                <div
                    className="dropdown-toggle"
                    type="button"
                    onClick={this.showDropdown}>
                    <span className='dropdown-label'>{label}</span>
                    <span className="caret"></span>
                </div>
                <div className="dropdown-menu">
                    {children}
                </div>
            </div>
        )
    }
}
