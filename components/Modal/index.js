import React from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'react-focus-trap';

import Portal from '../Portal';
import styles from './styles.module.scss';
import cs from '../../cs';

const ESCAPE_KEY = 27;

const noop = () => {};

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
    closeOnEscape: PropTypes.bool,
    closeOnOutsideClick: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    closeOnEscape: false,
    closeOnOutsideClick: false,
    onClose: noop,
};

export default class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPressed);
        document.addEventListener('mousedown', this.handleClickOutside);
        this.updateBodyTansparency(true);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPressed);
        document.removeEventListener('mousedown', this.handleClickOutside);
        this.updateBodyTansparency(false);
    }

    updateBodyTansparency(modalShown) {
        if(modalShown) {
            document.getElementById('root').style.filter = 'brightness(50%)';
        } else {
            document.getElementById('root').style.filter = 'brightness(100%)';
        }
    }


    handleClickOutside = (event) => {
        const {
            closeOnOutsideClick,
            onClose,
        } = this.props;

        const { current: wrapper } = this.wrapperRef;

        if (closeOnOutsideClick && !wrapper.contains(event.target)) {
            onClose({ outsideClick: true });
        }
    }

    handleKeyPressed = (event) => {
        const {
            closeOnEscape,
            onClose,
        } = this.props;

        if (closeOnEscape && event.keyCode === ESCAPE_KEY) {
            onClose({ escape: true });
        }
    }

    render() {
        const {
            children,
            className: classNameFromProps,
        } = this.props;

        const className = cs(
            classNameFromProps,
            styles.modal,
            'modal',
        );

        return (
            <Portal>
                <FocusTrap>
                    <div
                        ref={this.wrapperRef}
                        className={className}
                    >
                            { children }
                    </div>
                </FocusTrap>
            </Portal>
        );
    }
}
