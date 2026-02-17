import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ImageProps } from './types';
import { getObserver, setObserverCallback } from './utils';
import { isIntersectionObserverAvailable } from '../../utils';

const Image: React.FC<ImageProps> = (props) => {
    const {
        threshold = 100,
        afterLoad,
        beforeLoad,
        lazy = true,
        lazyPlaceholderSrc,
        src,
        ...imageProps
    } = props;

    const placeholderRef = useRef<HTMLSpanElement>(null);

    const [loaded, setLoaded] = useState(false);
    const [visible, setVisible] = useState(false);

    const styleProp = {
        display: 'inline-block',
        ...imageProps.style,
    };

    const observer = useMemo(() => getObserver(threshold), [threshold]);

    const onVisible = useCallback(() => {
        beforeLoad && beforeLoad();
        setVisible(true);
    }, [beforeLoad]);

    const onImageLoad = useCallback(() => {
        if (loaded) {
            return;
        }
        afterLoad && afterLoad();
        setLoaded(true);
    }, [afterLoad, loaded]);

    const renderImage = useCallback(
        (src?: string) => (
            <img onLoad={visible ? onImageLoad : () => {}} src={src} {...imageProps} />
        ),
        [visible, imageProps, onImageLoad],
    );

    useEffect(() => {
        const element = placeholderRef.current;

        if (lazy && element && observer && isIntersectionObserverAvailable()) {
            setObserverCallback(element, onVisible);
            observer.observe(element);
        }
        return () => {
            if (element && observer) {
                observer.unobserve(element);
            }
        };
    }, [onVisible, threshold, observer, lazy]);

    if (visible || !isIntersectionObserverAvailable() || !lazy) {
        return renderImage(src);
    }

    return (
        <span ref={placeholderRef} style={styleProp}>
            {lazyPlaceholderSrc && renderImage(lazyPlaceholderSrc)}
        </span>
    );
};

export default Image;

export type { ImageProps };
