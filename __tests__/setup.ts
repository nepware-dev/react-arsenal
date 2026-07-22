import '@testing-library/jest-dom';

// jsdom does not implement layout so provide a deterministic, non-zero rect.
// Guarded so the setup is a no-op in the node environment (e.g. request tests).
if (typeof Element !== 'undefined') {
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
}
