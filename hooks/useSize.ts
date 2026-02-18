import { useState, useEffect } from 'react';

interface Size {
    width?: number;
    height?: number;
}

export default (node: Window = window, defaultSize?: Size) => {
    const [nodeSize, setNodeSize] = useState<Size>({
        width: defaultSize?.width,
        height: defaultSize?.height,
    });

    useEffect(() => {
        const handleResize = () => {
            setNodeSize({
                width: node.innerWidth,
                height: node.innerHeight,
            });
        };

        node.addEventListener('resize', handleResize);
        handleResize();
        return () => node.removeEventListener('resize', handleResize);
    }, [!!node]);

    return nodeSize;
};
