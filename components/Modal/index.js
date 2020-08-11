import React from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';

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
    overlayClassName: PropTypes.string,
    closeOnEscape: PropTypes.bool,
    closeOnOutsideClick: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    overlayClassName: '',
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
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPressed);
        document.removeEventListener('mousedown', this.handleClickOutside);
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
            overlayClassName: overlayClassNameFromProps,
        } = this.props;

        const className = cs(
            styles.modal,
            classNameFromProps,
            'modal',
        );

        const overlayClassName = cs(
            styles.overlay,
            overlayClassNameFromProps,
            'overlay',
        );

        return (
            <Portal>
                <FocusTrap>
                    <div className={overlayClassName}>
                        <div
                            ref={this.wrapperRef}
                            className={className}
                        >
                                { children }
                        </div>
                    </div>
                </FocusTrap>
            </Portal>
        );
    }
}
