import { useCallback, useLayoutEffect } from 'react';

import styles from './styles.module.scss';
import { usePanelGroupContext } from './PanelGroupContext';
import cs from '../../cs';

interface PanelResizerProps {
    index: number;
}

const PanelResizer: React.FC<PanelResizerProps> = ({ index }) => {
    const {
        direction,
        reported,
        resizingIndex,
        resizerClassName,
        renderResizer,
        getPanelId,
        startResize,
        moveResize,
        endResize,
        cancelResize,
        nudge,
        reset,
    } = usePanelGroupContext();

    const isResizing = resizingIndex === index;

    const handlePointerDown = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => {
            if (event.button !== 0) {
                return;
            }
            // Keeps the rest of the gesture on this element, so a fast drag cannot
            // outrun the handler and mouse, touch and pen take the same path.
            event.currentTarget.setPointerCapture?.(event.pointerId);
            startResize(index, event.pointerId, event.clientX, event.clientY);
        },
        [index, startResize],
    );

    const handlePointerMove = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) =>
            moveResize(event.pointerId, event.clientX, event.clientY),
        [moveResize],
    );

    const handlePointerUp = useCallback(
        (event: React.PointerEvent<HTMLDivElement>) => endResize(event.pointerId),
        [endResize],
    );

    // A resizer taken out of the tree mid-drag never receives its pointer up, and the
    // session it leaves open would suspend the group's layout sync for good.
    useLayoutEffect(() => {
        if (!isResizing) {
            return;
        }
        return cancelResize;
    }, [cancelResize, isResizing]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            const decreaseKey = direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
            const increaseKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

            let steps: number;

            if (event.key === decreaseKey) {
                steps = -1;
            } else if (event.key === increaseKey) {
                steps = 1;
            } else if (event.key === 'Home') {
                steps = Number.NEGATIVE_INFINITY;
            } else if (event.key === 'End') {
                steps = Number.POSITIVE_INFINITY;
            } else {
                return;
            }

            event.preventDefault();
            nudge(index, steps);
        },
        [direction, index, nudge],
    );

    const percentage = reported?.[index];

    return (
        <div
            role="separator"
            tabIndex={0}
            aria-label="Resize panel"
            aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
            aria-controls={getPanelId(index)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage === undefined ? undefined : Math.round(percentage)}
            className={cs(styles.resizer, resizerClassName, {
                [styles.resizing]: isResizing,
            })}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={cancelResize}
            onKeyDown={handleKeyDown}
            onDoubleClick={reset}
        >
            {renderResizer?.({ index, direction, isResizing })}
        </div>
    );
};

PanelResizer.displayName = 'PanelResizer';

export default PanelResizer;
