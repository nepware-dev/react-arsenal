import type { Ref } from 'react';

export const getElement = (ref: Ref<HTMLDivElement> ) => {
    if (!ref) return null;

    if ('current' in ref) {
        return ref.current;
    }

    if (typeof ref === 'function') {
        console.warn('Callback refs are not supported. Please use a RefObject instead.');
        return null;
    }

    return null;
}
