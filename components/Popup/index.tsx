import { useCallback, useContext, useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

import styles from './styles.module.scss';
import PopupNestingContext, { type PopupContainsNode, type PopupNestingContextValue } from './PopupNestingContext';
import type { PopupProps } from './types';
import {
    getClosestOverflowAncestor,
    getPopupStyle,
    getPopupOriginPosition,
    getOverflowState,
    handleBoundaryStyling,
} from './utils';
import Portal from '../Portal';
import withVisibleCheck from '../WithVisibleCheck';
import cs from '../../cs';
import { FocusShardContext, useFocusShard, useFocusShardHost } from '../../hooks/useFocusShards';
import useRect from '../../hooks/useRect';
import { isNullOrUndefined, isResizeObserverAvailable } from '../../utils';

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
        container,
        disableFocusLock = false,
        useOverflowAncestor = false,
        onClose = noop,
    } = props;

    const viewportElement = useMemo(() => {
        if (container) return container;

        if (useOverflowAncestor) {
            return getClosestOverflowAncestor(anchor.current?.parentElement);
        }

        return null;
    }, [anchor, container, useOverflowAncestor]);

    const portalContainer = useMemo(() => {
        return viewportElement || document.body;
    }, [viewportElement]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const [wrapperStyle, setWrapperStyle] = useState<React.CSSProperties>();
    const [wrapperNode, setWrapperNode] = useState<HTMLDivElement | null>(null);

    const { shards: focusShards, registry: focusShardRegistry } = useFocusShardHost();
    useFocusShard(wrapperNode);

    const anchorRect = useRect(anchor.current);
    const viewportRect = useRect(viewportElement);
    const popupSizeRef = useRef({ height: 0, width: 0 });

    const parentNesting = useContext(PopupNestingContext);
    const nestedPopupsRef = useRef<Set<PopupContainsNode>>(new Set());

    const className = cs(styles.popup, 'popup', _className);

    const containsNode = useCallback(
        (node: Node) => {
            if (wrapperRef.current?.contains(node) || anchor?.current?.contains(node)) {
                return true;
            }
            for (const nestedContainsNode of nestedPopupsRef.current) {
                if (nestedContainsNode(node)) {
                    return true;
                }
            }
            return false;
        },
        [anchor],
    );

    const containsNodeRef = useRef(containsNode);
    containsNodeRef.current = containsNode;

    const reportContainsNode = useCallback((node: Node) => containsNodeRef.current(node), []);

    const nestingContextValue = useMemo<PopupNestingContextValue>(
        () => ({
            registerNestedPopup: (nestedContainsNode) => {
                nestedPopupsRef.current.add(nestedContainsNode);
                return () => {
                    nestedPopupsRef.current.delete(nestedContainsNode);
                };
            },
        }),
        [],
    );

    useEffect(() => parentNesting?.registerNestedPopup(reportContainsNode), [parentNesting, reportContainsNode]);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            const { current: wrapper } = wrapperRef;

            if (closeOnOutsideClick && wrapper && !containsNode(event.target as Node)) {
                event.stopPropagation();
                onClose(event);
            }
        },
        [closeOnOutsideClick, onClose, containsNode],
    );

    const handleKeyPressed = useCallback(
        (event: KeyboardEvent) => {
            if (closeOnEscape && event.key === 'Escape') {
                event.stopPropagation();
                onClose?.(event);
            }
        },
        [closeOnEscape, onClose],
    );

    const transformWrapperRect = useCallback(
        (rect: DOMRect) => {
            const popupSize = popupSizeRef.current;

            const overflowState = getOverflowState(rect, viewportElement, {
                anchorOrigin,
                transformOrigin,
                popupSize,
            });

            const popupOriginPositions = getPopupOriginPosition(
                rect,
                popupSize,
                viewportElement,
                anchorOrigin,
                transformOrigin,
            );

            const popupStyle = getPopupStyle(
                rect,
                popupOriginPositions.anchorOrigin,
                popupOriginPositions.transformOrigin,
                viewportElement,
            );

            handleBoundaryStyling(
                overflowState,
                { original: { anchorOrigin, transformOrigin }, resolved: popupOriginPositions },
                wrapperRef.current,
            );
            return popupStyle;
        },
        [anchorOrigin, transformOrigin, viewportElement],
    );

    const updateWrapperStyle = useCallback(() => {
        const currentAnchorRect = anchor.current?.getBoundingClientRect() ?? anchorRect;
        if (!isNullOrUndefined(currentAnchorRect.top)) {
            setWrapperStyle(transformWrapperRect(currentAnchorRect));
        }
    }, [anchor, anchorRect, viewportRect, transformWrapperRect]);

    const updateWrapperStyleRef = useRef(updateWrapperStyle);
    updateWrapperStyleRef.current = updateWrapperStyle;

    const handleWrapperRef = useCallback((node: HTMLDivElement | null) => {
        wrapperRef.current = node;
        setWrapperNode(node);

        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = null;

        if (!node) {
            return;
        }

        const measure = () => {
            const { width, height } = node.getBoundingClientRect();
            popupSizeRef.current = {
                height,
                width,
            };
            updateWrapperStyleRef.current();
        };

        measure();

        if (!isResizeObserverAvailable()) {
            return;
        }

        const observer = new ResizeObserver(measure);

        observer.observe(node);
        resizeObserverRef.current = observer;
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPressed);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleKeyPressed);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside, handleKeyPressed]);

    useLayoutEffect(() => {
        updateWrapperStyle();
    }, [updateWrapperStyle]);

    return (
        <Portal container={portalContainer}>
            <PopupNestingContext.Provider value={nestingContextValue}>
                <FocusShardContext.Provider value={focusShardRegistry}>
                    <FocusLock disabled={disableFocusLock} returnFocus shards={focusShards}>
                        {wrapperStyle && (
                            <div ref={handleWrapperRef} className={className} style={wrapperStyle}>
                                {children}
                            </div>
                        )}
                    </FocusLock>
                </FocusShardContext.Provider>
            </PopupNestingContext.Provider>
        </Portal>
    );
}

export default withVisibleCheck(Popup);

export { default as PopupNestingContext } from './PopupNestingContext';
export type { PopupContainsNode, PopupNestingContextValue } from './PopupNestingContext';

export type { OriginPosition, PopupProps } from './types';
