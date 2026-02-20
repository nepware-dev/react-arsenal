import { useState, useEffect } from 'react';

export default (node: HTMLElement | null) => {
    const [rect, setRect] = useState<DOMRect>({} as DOMRect);

    const calculate = () => setRect(node ? node.getBoundingClientRect() : ({} as DOMRect));

    useEffect(() => {
        calculate();
        window.addEventListener('resize', calculate);
        window.addEventListener('scroll', calculate, true);
        return () => {
            window.removeEventListener('resize', calculate);
            //true at last catches the event in dispatch so it is captured even if it doesn't bubble
            window.removeEventListener('scroll', calculate, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [!!node]);

    return rect;
};
