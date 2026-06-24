import { useCallback, useState, useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

import styles from './styles.module.scss';
import type { PopupProps } from './types';
import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import cs from '../../cs';
import useRect from '../../hooks/useRect';

const noop = () => {};

function Popup<T extends HTMLElement | null>(props: PopupProps<T>) {
    const {
        anchor,
        children,
        anchorOrigin = 'bottom right',
        transformOrigin = 'bottom right',
        className: _className,
        closeOnEscape = false,
        closeOnOutsideClick = true,
        disableFocusLock = false,
        onClose = noop,
    } = props;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const [wrapperRect, setWrapperRect] = useState<React.CSSProperties>();
    const anchorRect = useRect(anchor.current);

    const className = cs(styles.popup, 'popup', _className);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            const { current: wrapper } = wrapperRef;

            if (
                closeOnOutsideClick &&
                wrapper &&
                !wrapper.contains(event.target as Node) &&
                !anchor?.current?.contains(event.target as Node)
            ) {
                event.stopPropagation();
                onClose(event);
            }
        },
        [closeOnOutsideClick, onClose, anchor],
    );

    const handleKeyPressed = useCallback(
        (event: KeyboardEvent) => {
            if (closeOnEscape && event.key === 'Escape') {
                onClose?.(event);
            }
        },
        [closeOnEscape, onClose],
    );

    const transformWrapperRect = useCallback(
        (rect: DOMRect) => {
            const [anchorVertical, anchorHorizontal] = anchorOrigin.trim().split(' ');
            const [transformVertical, transformHorizontal] = transformOrigin.trim().split(' ');

            const topAnchor = {
                top: rect.top,
                center: (rect.top + rect.bottom) / 2,
                bottom: rect.bottom,
            };

            const leftAnchor = {
                left: rect.left,
                center: (rect.left + rect.right) / 2,
                right: rect.right,
            };

            const vertTransform = {
                top: '0',
                center: '-50%',
                bottom: '-100%',
            };

            const horiTranform = {
                left: '0',
                center: '-50%',
                right: '-100%',
            };

            return {
                top: topAnchor[anchorVertical as keyof typeof topAnchor] + window.pageYOffset,
                left: leftAnchor[anchorHorizontal as keyof typeof leftAnchor] + window.pageXOffset,
                transform: `translate(${horiTranform[transformHorizontal as keyof typeof horiTranform]}, ${vertTransform[transformVertical as keyof typeof vertTransform]})`,
            };
        },
        [anchorOrigin, transformOrigin],
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPressed);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyPressed);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        if (anchorRect?.top) {
            setWrapperRect(transformWrapperRect(anchorRect));
        }
    }, [anchorRect, transformWrapperRect]);

    return (
        <Portal>
            <FocusLock disabled={disableFocusLock} returnFocus>
                {wrapperRect && (
                    <div ref={wrapperRef} className={className} style={wrapperRect}>
                        {children}
                    </div>
                )}
            </FocusLock>
        </Portal>
    );
}

export default withVisibleCheck(Popup);

export type { OriginPosition, PopupProps } from './types';
