import {useEffect, useCallback, useState, useRef} from 'react';

const getPosition = e => {
    const eventObj = 'touches' in e ? e.touches[0] : e;

    return {pageX: eventObj.pageX, pageY: eventObj.pageY};
};

export default function useDrag(containerRef, direction, triggerChange) {
    const [dragOffset, setDragOffset] = useState(null);
    const [isDragging, setDragging] = useState(false);
    
    const mouseMoveEventRef = useRef(null);
    const mouseUpEventRef = useRef(null);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', mouseMoveEventRef.current);
            document.removeEventListener('mouseup', mouseUpEventRef.current);
            document.removeEventListener('touchmove', mouseMoveEventRef.current);
            document.removeEventListener('touchend', mouseUpEventRef.current);
        }
    }, []);

    const onStartMove = useCallback(e => {
        e.stopPropagation();
        setDragging(true);

        const {pageX: startX, pageY: startY} = getPosition(e);

        const onMouseMove = evnt => {
            evnt.preventDefault();

            const {pageX: moveX, pageY: moveY} = getPosition(evnt);
            const offsetX = moveX - startX;
            const offsetY = moveY - startY;

            const {width, height} = containerRef.current.getBoundingClientRect();

            let offset;
            switch(direction) {
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

        const onMouseUp = evnt => {
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
    }, [triggerChange]);

    return {isDragging, dragOffset, onStartMove};
}
