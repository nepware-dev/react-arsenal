import { useEffect, useCallback, useState, useRef } from 'react';

const getPosition = (e: MouseEvent | TouchEvent | React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const eventObj = 'touches' in e ? e.touches[0] : e;

    return { pageX: eventObj.pageX, pageY: eventObj.pageY };
};

export default function useDrag(
    containerRef: React.RefObject<HTMLDivElement | null>,
    direction: 'rtl' | 'ltr' | 'ttb' | 'btt',
    triggerChange: (offset: number) => void,
) {
    const [dragOffset, setDragOffset] = useState<number | null>(null);
    const [isDragging, setDragging] = useState(false);

    const mouseMoveEventRef = useRef<((evnt: MouseEvent | TouchEvent) => void) | null>(null);
    const mouseUpEventRef = useRef<((evnt: MouseEvent | TouchEvent) => void) | null>(null);

    useEffect(() => {
        return () => {
            if (mouseMoveEventRef.current) {
                document.removeEventListener('mousemove', mouseMoveEventRef.current);
                document.removeEventListener('touchmove', mouseMoveEventRef.current);
            }
            if (mouseUpEventRef.current) {
                document.removeEventListener('mouseup', mouseUpEventRef.current);
                document.removeEventListener('touchend', mouseUpEventRef.current);
            }
        };
    }, []);

    const onStartMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
            e.stopPropagation();
            setDragging(true);

            const { pageX: startX, pageY: startY } = getPosition(e);

            const onMouseMove = (evnt: MouseEvent | TouchEvent) => {
                evnt.preventDefault();

                const { pageX: moveX, pageY: moveY } = getPosition(evnt);
                const offsetX = moveX - startX;
                const offsetY = moveY - startY;

                if (!containerRef.current) {
                    console.warn('Container ref is not set for useDrag');
                    return;
                }

                const { width, height } = containerRef.current.getBoundingClientRect();

                let offset;
                switch (direction) {
                    case 'btt':
                        offset = -offsetY / height;
                        break;
                    case 'ttb':
                        offset = offsetY / height;
                        break;
                    case 'rtl':
                        offset = -offsetX / width;
                        break;
                    default:
                        offset = offsetX / width;
                }

                setDragOffset(offset);
                triggerChange && triggerChange(offset);
            };

            const onMouseUp = (evnt: MouseEvent | TouchEvent) => {
                evnt.preventDefault();

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('touchend', onMouseUp);

                setDragging(false);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('touchmove', onMouseMove);
            document.addEventListener('touchend', onMouseUp);

            mouseMoveEventRef.current = onMouseMove;
            mouseUpEventRef.current = onMouseUp;
        },
        [triggerChange],
    );

    return { isDragging, dragOffset, onStartMove };
}
