import '@testing-library/jest-dom';

// jsdom does not implement layout so provide a deterministic, non-zero rect.
Element.prototype.getBoundingClientRect = function (): DOMRect {
    return {
        top: 100,
        left: 100,
        right: 200,
        bottom: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 100,
        toJSON: () => ({}),
    };
};
