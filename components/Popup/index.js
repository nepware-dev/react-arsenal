import React, {useCallback, useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import FocusLock from 'react-focus-lock';

import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import styles from './styles.module.scss';
import cs from '../../cs';

const noop = () => {};

const propTypes = {
    anchor: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,
    className: PropTypes.string,
    closeOnOutsideClick: PropTypes.bool,
    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    closeOnOutsideClick: true,
    onClose: noop,
};

const Popup = ({
    anchor,
    children,
    className: _className,
    overlayClassName: _overlayClassName,
    closeOnOutsideClick,
    onClose,
}) => {
    const wrapperRef = useRef(null);
    const [anchorRect, setAnchorRect] = useState();
    const [wrapperRect, setWrapperRect] = useState();

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    const transformWrapperRect = useCallback((rect) => {
        //TODO: transform the position of wrapper to left, right and center in respect to horizontal and vertical position
        return {
            top: rect.bottom,
            left: rect.left,
            transform: 'translateY(-100%)',
        }
    });

    useEffect(() => {
        var rect = anchor.current.getBoundingClientRect();
        setAnchorRect(rect);
        setWrapperRect(transformWrapperRect(rect));
    }, []);

    const handleClickOutside = useCallback((event) => {
        const { current: wrapper } = wrapperRef;

        if (closeOnOutsideClick && !wrapper.contains(event.target)) {
            event.stopPropagation();
            onClose(event);
        }
    }, []);

    const className = cs(
        styles.popup,
        'popup',
        _className,
    );

    return (
        <Portal>
            <FocusLock>
                {wrapperRect &&
                    <div
                        ref={wrapperRef}
                        className={className}
                        style={wrapperRect}
                    >
                            { children }
                    </div>
                }
            </FocusLock>
        </Portal>
    );
}

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;

export default withVisibleCheck(Popup);
