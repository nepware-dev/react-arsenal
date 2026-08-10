import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// jsdom does not implement ResizeObserver.
// Guarded so the setup is a no-op in the node environment (e.g. request tests).
if (typeof globalThis.ResizeObserver === 'undefined') {
    const ResizeObserverMock = vi.fn(function () {
        return {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        };
    });
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
}
