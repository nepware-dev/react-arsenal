import { useCallback, useEffect, useRef, useState } from 'react';
import FocusLock from 'react-focus-lock';

import styles from './styles.module.scss';
import type { PopupProps } from './types';
import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import cs from '../../cs';
import useRect from '../../hooks/useRect';

const noop = () => {};

function Popup<T extends HTMLElement>(props: PopupProps<T>) {
    const {
        anchor,
        children,
        anchorOrigin = 'bottom right',
        transformOrigin = 'bottom right',
        className: _className,
        closeOnOutsideClick = true,
        disableFocusLock = false,
        onClose = noop,
        portalContainer,
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

    const transformWrapperRect = useCallback(
        (rect: DOMRect) => {
            const [anchorVertical, anchorHorizontal] = anchorOrigin.trim().split(' ');
            const [transformVertical, transformHorizontal] = transformOrigin.trim().split(' ');

            const container = portalContainer ?? document.body;
            const isDocumentBody = container === document.body;
            const containerRect = container.getBoundingClientRect();

            const scrollTop = isDocumentBody ? window.pageYOffset : container.scrollTop - containerRect.top;
            const scrollLeft = isDocumentBody ? window.pageXOffset : container.scrollLeft - containerRect.left;

            const topAnchor = {
                top: rect.top + scrollTop,
                center: (rect.top + rect.bottom) / 2 + scrollTop,
                bottom: rect.bottom + scrollTop,
            };

            const leftAnchor = {
                left: rect.left + scrollLeft,
                center: (rect.left + rect.right) / 2 + scrollLeft,
                right: rect.right + scrollLeft,
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
                top: topAnchor[anchorVertical as keyof typeof topAnchor],
                left: leftAnchor[anchorHorizontal as keyof typeof leftAnchor],
                transform: `translate(${horiTranform[transformHorizontal as keyof typeof horiTranform]}, ${vertTransform[transformVertical as keyof typeof vertTransform]})`,
            };
        },
        [anchorOrigin, transformOrigin, portalContainer],
    );

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    useEffect(() => {
        if (anchorRect?.top) {
            setWrapperRect(transformWrapperRect(anchorRect));
        }
    }, [anchorRect, transformWrapperRect]);

    return (
        <Portal container={portalContainer}>
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
