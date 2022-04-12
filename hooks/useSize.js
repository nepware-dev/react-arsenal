import { useState, useEffect } from 'react';

export default (node=window) => {
    const [nodeSize, setNodeSize] = useState({
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
