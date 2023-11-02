import React from 'react';
import PropTypes from 'prop-types';

import {isIntersectionObserverAvailable} from '../../utils';

const checkIntersections = entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.onVisible();
        }
    });
};

const LAZY_LOAD_OBSERVERS={};

const getObserver = threshold => {
    LAZY_LOAD_OBSERVERS[threshold] = LAZY_LOAD_OBSERVERS[threshold] || new IntersectionObserver(checkIntersections, {
        rootMargin: `${threshold}px`,
    });
    return LAZY_LOAD_OBSERVERS[threshold];
};

const Image = props => {
    const placeholderRef = React.useRef();
    
    const {threshold=100, afterLoad, beforeLoad, lazy=true, lazyPlaceholderSrc, src, alt, ...imageProps} = props;

    const [loaded, setLoaded] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    const onVisible = React.useCallback(() => {
        beforeLoad && beforeLoad();
        setVisible(true);
    }, [beforeLoad]);

    const observer = React.useMemo(() => getObserver(threshold), [threshold]);

    React.useEffect(() => {
        const element = placeholderRef.current;
        if(lazy && element && isIntersectionObserverAvailable()) {
            element.onVisible = onVisible;
            observer.observe(element);
        }
        return () => {
            element && observer.unobserve(element);
        }
    }, [onVisible, threshold, observer, lazy]); 

    const onImageLoad = React.useCallback(() => {
        if(loaded) {
            return;
        }
        afterLoad && afterLoad();
        setLoaded(true);
    }, [afterLoad, loaded]);

    const renderImage = React.useCallback(src => (
        <img onLoad={visible ? onImageLoad : () => {}} src={src} alt={alt} {...imageProps} />
    ), [visible, imageProps, onImageLoad, alt]);

    if(visible || !isIntersectionObserverAvailable() || !lazy) {
        return renderImage(src);
    }

    const styleProp = {
        display: 'inline-block',
        ...imageProps.style,
    };

    return (
        <span ref={placeholderRef} style={styleProp}>
            {lazyPlaceholderSrc && renderImage(lazyPlaceholderSrc)}
        </span>
    );
};

Image.propTypes = {
    /**
     * Number of pixels before which image is loaded
     */
    threshold: PropTypes.number,
    /**
     * Denotes if the image is lazy loaded (Defaults to true)
     */
    lazy: PropTypes.bool,
    /**
     * Callback called just as the image starts loading
     */
    beforeLoad: PropTypes.func,
    /**
     * Callback called after image loads
     */
    afterLoad: PropTypes.func,
    /**
     * Image source for placeholder (if any)
     */
    lazyPlaceholderSrc: PropTypes.any,
}

export default Image;
