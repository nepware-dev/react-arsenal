import React, { useCallback, useEffect, useRef } from 'react';

import { WindowPortalProps } from './types';
import Portal from '../Portal';

const WindowPortal: React.FC<WindowPortalProps> = ({
    children,
    width = 600,
    height = 400,
    top = 200,
    left = 200,
    onClose = () => {},
    backgroundColor,
}) => {
    const containerElRef = useRef<HTMLDivElement>(document.createElement('div'));
    const externalWindowRef = useRef<Window | null>(null);

    const handleBeforeUnload = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        const externalWindow = window.open(
            '',
            '',
            `width=${width},height=${height},left=${left},top=${top}`,
        );

        if (!externalWindow) return;

        externalWindowRef.current = externalWindow;

        externalWindow.document.body.appendChild(containerElRef.current);

        if (backgroundColor) {
            externalWindow.document.body.style.backgroundColor = backgroundColor;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!externalWindowRef.current) return;

        const externalWindow = externalWindowRef.current;

        externalWindow.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            externalWindow.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [handleBeforeUnload]);

    useEffect(() => {
        const externalWindow = externalWindowRef.current;
        if (!externalWindow) return;

        externalWindow.resizeTo(width, height);
    }, [width, height]);

    useEffect(() => {
        const externalWindow = externalWindowRef.current;
        if (!externalWindow) return;

        externalWindow.moveTo(left, top);
    }, [left, top]);

    useEffect(() => {
        return () => {
            const externalWindow = externalWindowRef.current;
            if (externalWindow) {
                externalWindow.close();
            }
        }
    },[]);

    return <Portal container={containerElRef.current}>{children}</Portal>;
};

export default WindowPortal;
