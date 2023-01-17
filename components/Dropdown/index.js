import React from 'react';
import PropTypes from 'prop-types';

import cs from '../../cs';
import styles from './styles.module.scss';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]),

    /**
     * Label to be used for dropdown.
     */
    label: PropTypes.string,

    /**
     * Custom renderer for the dropdown label component.
     */
    renderLabel: PropTypes.func,
    
    /**
     * Classname for the dropdown content.
     */
    className: PropTypes.string,
    
    /**
     * Classname for the label container.
     */
    labelContainerClassName: PropTypes.string,

    /**
     * (left | right) - Decides which way the dropdown content is aligned compared to the label.
     */
    align: PropTypes.string,

    /**
     * Whether or not the dropdown content is displayed on hovering the label.
     */
    showOnHover: PropTypes.bool,
    /**
     * Change the behavior of the dropdown to hide on document click.
     * Setting this to false will capture the event from bubbling, and does not hide the dropdown on clicking within it.
     *    true (default) - Dropdown event handler is executed in the capturing phase.
     *    false - Dropdown event handler is executed in the bubbling phase.
     */
    useCapture: PropTypes.bool,
};

const defaultProps = {
    useCapture: true,
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
        this.labelRef = React.createRef();
    }

    onMouseEnter = () => {
        this.props.showOnHover && this.showDropdown();
    }

    onMouseLeave = () => {
        this.props.showOnHover && this.hideDropdown();
    }

    onClick = () => {
        this.state.isOpen ? this.hideDropdown() : this.showDropdown();
    }

    showDropdown = () => {
        this.setState({ isOpen: true });
        setTimeout(() => {
           document.addEventListener('click', this.hideDropdown, this.props.useCapture);
        }, 50);
    };

    hideDropdown = (evnt) => {
        if(evnt?.target && this.labelRef?.current?.contains(evnt.target)) {
            evnt.stopPropagation();
        }
        this.setState({ isOpen: false });
        document.removeEventListener('click', this.hideDropdown, this.props.useCapture);
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
                    ref={this.labelRef}
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
        );
    }
}
