import React, {useCallback, useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import FocusLock from 'react-focus-lock';

import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import styles from './styles.module.scss';
import cs from '../../cs';

const noop = () => {};

const propTypes = {
    /**
     * Component or element that acts as anchor/bas point for the popup
     */
    anchor: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,

    /**
     * Anchor position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for anchor position reference check https://mui.com/components/popover/
     * @param {('top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center')
     */
    anchorOrigin: PropTypes.string.isRequired,

    /**
     * Tranform position the popup in vertical and horizontal position in respect to the anchor
     * The first position defines the vertical position of the anchor and the second position defines the horizontal position
     * for transform position reference check https://mui.com/components/popover/
     * @param {('top left'|'top right'|'bottom right'|'bottom left'|'right center'|'left center'|'top center'|'bottom center'|'center center')
     */
    transformOrigin: PropTypes.string.isRequired,

    /**
     * Content of the poup
     */
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.element),
        PropTypes.element,
    ]).isRequired,

    /**
     * Classname applied to container element
     */
    className: PropTypes.string,

    /**
     * Auto close popup when user clicks outside the popup
     */
    closeOnOutsideClick: PropTypes.bool,

    /**
     * Function to run when close is called
     */
    onClose: PropTypes.func,
};

const defaultProps = {
    className: '',
    closeOnOutsideClick: true,
    onClose: noop,
    anchorOrigin: 'bottom center',
    transformOrigin: 'bottom center',
};

const Popup = ({
    anchor,
    children,
    anchorOrigin,
    transformOrigin,
    className: _className,
    closeOnOutsideClick,
    onClose,
}) => {
    const wrapperRef = useRef(null);
    const [wrapperRect, setWrapperRect] = useState();

    const handleClickOutside = useCallback((event) => {
        const { current: wrapper } = wrapperRef;

        if (closeOnOutsideClick && !wrapper.contains(event.target)) {
            event.stopPropagation();
            onClose(event);
        }
    }, [closeOnOutsideClick, onClose]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const transformWrapperRect = useCallback((rect) => {
        const [anchorVertical, anchorHorizontal] = anchorOrigin.trim().split(' ');
        const [transformVertical, transformHorizontal] = transformOrigin.trim().split(' ');
        
        const topAnchor = {
            'top': rect.top,
            'center': (rect.top + rect.bottom)/2,
            'bottom': rect.bottom,
        };

        const leftAnchor = {
            'left': rect.left,
            'center': (rect.left + rect.right)/2,
            'right': rect.right,
        };

        const vertTransform = {
            'top': '100%',
            'center': '0%',
            'bottom': '-100%',
        };

        const horiTranform = {
            'left': '100%',
            'center': '0%',
            'right': '-100%',
        };

        return {
            top: topAnchor[anchorVertical] + window.pageYOffset,
            left: leftAnchor[anchorHorizontal] + window.pageXOffset,
            transform: `translate(${horiTranform[transformHorizontal]}, ${vertTransform[transformVertical]})`,
        };
    }, [anchorOrigin, transformOrigin]);

    useEffect(() => {
        let rect = anchor.current.getBoundingClientRect();
        setWrapperRect(transformWrapperRect(rect));
    }, [anchor, transformWrapperRect]);

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
};

Popup.propTypes = propTypes;
Popup.defaultProps = defaultProps;

export default withVisibleCheck(Popup);
