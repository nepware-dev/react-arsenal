import type { ImgHTMLAttributes } from 'react';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    /**
     * Number of pixels before which image is loaded
     */
    threshold?: number;
    /**
     * Denotes if the image is lazy loaded (Defaults to true)
     */
    lazy?: boolean;
    /**
     * Callback called just as the image starts loading
     */
    beforeLoad?: () => void;
    /**
     * Callback called after image loads
     */
    afterLoad?: () => void;
    /**
     * Image source for placeholder (if any)
     */
    lazyPlaceholderSrc?: string;
}
