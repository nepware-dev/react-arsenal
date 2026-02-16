import { isIntersectionObserverAvailable } from "../../utils";

const LAZY_LOAD_OBSERVERS: { [key: number]: IntersectionObserver } = {};
const callbacks = new WeakMap<Element, () => void>();

const checkIntersections = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const intersectCallback = callbacks.get(entry.target);

            if (intersectCallback) {
                intersectCallback();
            }
        }
    });
};

export const getObserver = (threshold: number) => {
    if (!isIntersectionObserverAvailable()) {
        return null;
    }

    LAZY_LOAD_OBSERVERS[threshold] =
        LAZY_LOAD_OBSERVERS[threshold] ||
        new IntersectionObserver(checkIntersections, {
            rootMargin: `${threshold}px`,
        });
    return LAZY_LOAD_OBSERVERS[threshold];
};

export const setObserverCallback = (element: Element, callback: () => void) => {
    callbacks.set(element, callback);
};
