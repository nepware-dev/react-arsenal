import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

import WindowPortal from '../../components/WindowPortal';

interface MockDocument {
    body: {
        appendChild: Mock;
        style: {
            backgroundColor?: string;
        };
    };
}

interface MockWindow extends Partial<Omit<Window, 'document'>> {
    document: MockDocument;
    addEventListener: Mock;
    removeEventListener: Mock;
    resizeTo: Mock;
    moveTo: Mock;
    close: Mock;
}

describe('WindowPortal', () => {
    let mockWindow: MockWindow;
    let mockDocument: MockDocument;
    let originalWindowOpen: typeof window.open;

    beforeEach(() => {
        mockDocument = {
            body: {
                appendChild: vi.fn(),
                style: {},
            },
        };

        mockWindow = {
            document: mockDocument,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            resizeTo: vi.fn(),
            moveTo: vi.fn(),
            close: vi.fn(),
        };

        originalWindowOpen = window.open;
        window.open = vi.fn().mockReturnValue(mockWindow);
    });

    afterEach(() => {
        cleanup();
        window.open = originalWindowOpen;
        vi.clearAllMocks();
    });

    describe('Basic rendering and window creation', () => {
        it('creates a new window with default parameters', () => {
            render(
                <WindowPortal width={600}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(window.open).toHaveBeenCalledWith(
                '',
                '',
                'width=600,height=400,left=200,top=200',
            );
        });

        it('creates a window with custom parameters', () => {
            render(
                <WindowPortal width={800} height={600} left={100} top={50}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(window.open).toHaveBeenCalledWith(
                '',
                '',
                'width=800,height=600,left=100,top=50',
            );
        });

        it('handles window creation failure gracefully', () => {
            window.open = vi.fn().mockReturnValue(null);

            expect(() => {
                render(
                    <WindowPortal width={600}>
                        <div>Portal content</div>
                    </WindowPortal>,
                );
            }).not.toThrow();
        });
    });

    describe('Background color functionality', () => {
        it('sets background color when provided', () => {
            render(
                <WindowPortal width={600} backgroundColor="#ff0000">
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(mockDocument.body.style.backgroundColor).toBe('#ff0000');
        });
    });

    describe('Window event handling', () => {
        it('adds beforeunload event listener', () => {
            render(
                <WindowPortal width={600}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(mockWindow.addEventListener).toHaveBeenCalledWith(
                'beforeunload',
                expect.any(Function),
            );
        });

        it('calls onClose when beforeunload is triggered', () => {
            const mockOnClose = vi.fn();

            render(
                <WindowPortal width={600} onClose={mockOnClose}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            if (!mockWindow.addEventListener.mock.calls.length) {
                throw new Error('addEventListener was not called');
            }

            const beforeUnloadHandler = mockWindow.addEventListener.mock.calls.find(
                (call) => call[0] === 'beforeunload',
            )?.[1];

            if (typeof beforeUnloadHandler === 'function') {
                beforeUnloadHandler();
            }

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('removes event listener on cleanup', () => {
            const { unmount } = render(
                <WindowPortal width={600}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            unmount();

            expect(mockWindow.removeEventListener).toHaveBeenCalledWith(
                'beforeunload',
                expect.any(Function),
            );
        });
    });

    describe('Window resize and move functionality', () => {
        it('resizes window when dimensions change', () => {
            const { rerender } = render(
                <WindowPortal width={600} height={400}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            rerender(
                <WindowPortal width={800} height={600}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(mockWindow.resizeTo).toHaveBeenCalledWith(800, 600);
        });

        it('moves window when position changes', () => {
            const { rerender } = render(
                <WindowPortal width={600} left={200} top={200}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            rerender(
                <WindowPortal width={600} left={100} top={50}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(mockWindow.moveTo).toHaveBeenCalledWith(100, 50);
        });
    });

    describe('Edge cases', () => {
        it('handles missing external window reference', () => {
            window.open = vi.fn().mockReturnValue(null);

            const { rerender } = render(
                <WindowPortal width={600}>
                    <div>Portal content</div>
                </WindowPortal>,
            );

            expect(() => {
                rerender(
                    <WindowPortal width={800}>
                        <div>Portal content</div>
                    </WindowPortal>,
                );
            }).not.toThrow();
        });

        it('handles empty children', () => {
            expect(() => {
                render(<WindowPortal width={600}>{null}</WindowPortal>);
            }).not.toThrow();
        });

        it('handles multiple children', () => {
            expect(() => {
                render(
                    <WindowPortal width={600}>
                        <div>Child 1</div>
                        <div>Child 2</div>
                        <span>Child 3</span>
                    </WindowPortal>,
                );
            }).not.toThrow();
        });

        it('closes external window on unmount', () => {
            const { unmount } = render(
                <WindowPortal width={600}>
                    <div>Portal content</div>
                </WindowPortal>,
            );
            unmount();
            expect(mockWindow.close).toHaveBeenCalled();
        });
    });
});
