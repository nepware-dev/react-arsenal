import React from 'react';
import PropTypes from 'prop-types';
import FocusLock from 'react-focus-lock';

import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
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
    disableFocusLock: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    overlayClassName: '',
    closeOnEscape: false,
    closeOnOutsideClick: false,
    disableFocusLock: false,
    onClose: noop,
};

class Modal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.wrapperRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyPressed);
        document.addEventListener('mousedown', this.handleClickOutside);
        this.updateBody(true);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyPressed);
        document.removeEventListener('mousedown', this.handleClickOutside);
        this.updateBody(false);
    }

    updateBody(modalShown) {
        if(modalShown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
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
            disableFocusLock,
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
                <FocusLock disabled={disableFocusLock}>
                    <div className={overlayClassName}>
                        <div
                            ref={this.wrapperRef}
                            className={className}
                        >
                                { children }
                        </div>
                    </div>
                </FocusLock>
            </Portal>
        );
    }
}

export default withVisibleCheck(Modal);
