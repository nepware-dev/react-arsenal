import { useState, useEffect } from 'react';

interface Size {
    width?: number;
    height?: number;
}

export default (node = window) => {
    const [nodeSize, setNodeSize] = useState<Size>({
        width: undefined,
        height: undefined,
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
