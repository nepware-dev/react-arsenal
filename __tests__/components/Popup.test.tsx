import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRef } from 'react';

import Popup from '../../components/Popup';
import useRect from '../../hooks/useRect';

vi.mock('../../hooks/useRect', () => ({
    default: vi.fn(),
}));

vi.mock('../../components/Portal', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="portal">{children}</div>
    ),
}));

vi.mock('react-focus-lock', () => ({
    default: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
        <div data-testid="focus-lock" data-disabled={disabled}>
            {children}
        </div>
    ),
}));


const mockUseRect = useRect as Mock;

describe('FunctionalPopup', () => {
    const mockOnClose = vi.fn();

    const TestComponent = ({ onClose = mockOnClose, ...props }: any) => {
        const anchorRef = useRef<HTMLButtonElement>(null);

        return (
            <>
                <button ref={anchorRef} data-testid="anchor-button">
                    Anchor
                </button>
                <Popup anchor={anchorRef} onClose={onClose} {...props}>
                    <div data-testid="popup-content">Popup Content</div>
                </Popup>
            </>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseRect.mockReturnValue({
            top: 100,
            left: 200,
            right: 400,
            bottom: 150,
            width: 200,
            height: 50,
        } as DOMRect);

        Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
        Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders popup with children inside portal', () => {
            render(<TestComponent />);

            expect(screen.getByTestId('portal')).toBeInTheDocument();
            expect(screen.getByTestId('popup-content')).toBeInTheDocument();
            expect(screen.getByText('Popup Content')).toBeInTheDocument();
        });

        it('renders with custom className', () => {
            render(<TestComponent className="custom-popup" />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveClass('popup');
            expect(popup).toHaveClass('custom-popup');
        });

        it('renders inside FocusLock component', () => {
            render(<TestComponent />);

            expect(screen.getByTestId('focus-lock')).toBeInTheDocument();
            expect(
                screen.getByTestId('popup-content').closest('[data-testid="focus-lock"]'),
            ).toBeInTheDocument();
        });
    });

    describe('Anchor positioning', () => {
        it('positions popup with default anchor and transform origins (bottom right)', () => {
            render(<TestComponent />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '150px', // bottom of anchor (150)
                left: '400px', // right of anchor (400)
                transform: 'translate(-100%, -100%)', // bottom right transform
            });
        });

        it('positions popup with top left origins', () => {
            render(<TestComponent anchorOrigin="top left" transformOrigin="top left" />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '100px', // top of anchor
                left: '200px', // left of anchor
                transform: 'translate(0, 0)', // top left transform
            });
        });

        it('positions popup with center center origins', () => {
            render(<TestComponent anchorOrigin="center center" transformOrigin="center center" />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '125px', // center of anchor (100 + 150) / 2
                left: '300px', // center of anchor (200 + 400) / 2
                transform: 'translate(-50%, -50%)', // center transform
            });
        });

        it('positions popup with top center origins', () => {
            render(<TestComponent anchorOrigin="top center" transformOrigin="top center" />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '100px',
                left: '300px', // center horizontally
                transform: 'translate(-50%, 0)',
            });
        });

        it('accounts for window scroll offset', () => {
            Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true });
            Object.defineProperty(window, 'pageXOffset', { value: 100, writable: true });

            render(<TestComponent anchorOrigin="bottom right" transformOrigin="bottom right" />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '200px', // 150 + 50 (pageYOffset)
                left: '500px', // 400 + 100 (pageXOffset)
            });
        });
    });

    describe('Outside click handling', () => {
        it('calls onClose when clicking outside popup', () => {
            render(<TestComponent closeOnOutsideClick={true} />);

            fireEvent.mouseDown(document.body);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
            expect(mockOnClose).toHaveBeenCalledWith(expect.any(MouseEvent));
        });

        it('does not call onClose when clicking inside popup', () => {
            render(<TestComponent closeOnOutsideClick={true} />);

            const popupContent = screen.getByTestId('popup-content');
            fireEvent.mouseDown(popupContent);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('does not call onClose when clicking on anchor', () => {
            render(<TestComponent closeOnOutsideClick={true} />);

            const anchor = screen.getByTestId('anchor-button');
            fireEvent.mouseDown(anchor);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('does not call onClose when closeOnOutsideClick is false', () => {
            render(<TestComponent closeOnOutsideClick={false} />);

            fireEvent.mouseDown(document.body);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('stops propagation when closing on outside click', () => {
            render(<TestComponent closeOnOutsideClick={true} />);

            const event = new MouseEvent('mousedown', { bubbles: true });
            const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

            fireEvent(document.body, event);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe('Escape key handling', () => {
        it('calls onClose when pressing escape', () => {
            render(<TestComponent closeOnEscape={true} />);

            fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });

            expect(mockOnClose).toHaveBeenCalledTimes(1);
            expect(mockOnClose).toHaveBeenCalledWith(expect.any(KeyboardEvent));
        });

        it('does not call onClose when pressing another key', () => {
            render(<TestComponent closeOnEscape={true} />);

            fireEvent.keyDown(document.body, { key: 'a', code: 'KeyA' });

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('does not call onClose when closeOnEscape is false', () => {
            render(<TestComponent closeOnEscape={false} />);

            fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it('stops propagation when closing on escape', () => {
            render(<TestComponent closeOnEscape={true} />);

            const event = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true });
            const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

            fireEvent(document.body, event);

            expect(stopPropagationSpy).toHaveBeenCalled();
        });
    });

    describe('Focus lock functionality', () => {
        it('enables focus lock by default', () => {
            render(<TestComponent />);

            const focusLock = screen.getByTestId('focus-lock');
            expect(focusLock).toHaveAttribute('data-disabled', 'false');
        });

        it('disables focus lock when disableFocusLock is true', () => {
            render(<TestComponent disableFocusLock={true} />);

            const focusLock = screen.getByTestId('focus-lock');
            expect(focusLock).toHaveAttribute('data-disabled', 'true');
        });
    });

    describe('Event listener management', () => {
        it('adds mousedown event listener on mount', () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            render(<TestComponent />);

            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        });

        it('removes mousedown event listener on unmount', () => {
            const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

            const { unmount } = render(<TestComponent />);
            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
        });

        it('updates event listener when dependencies change', () => {
            const { rerender } = render(<TestComponent closeOnOutsideClick={true} />);

            fireEvent.mouseDown(document.body);
            expect(mockOnClose).toHaveBeenCalledTimes(1);

            mockOnClose.mockClear();

            rerender(<TestComponent closeOnOutsideClick={false} />);

            fireEvent.mouseDown(document.body);
            expect(mockOnClose).not.toHaveBeenCalled();
        });
    });

    describe('Anchor rect updates', () => {
        it('updates position when anchor rect changes', () => {
            const { rerender } = render(<TestComponent />);

            const popupContent = screen.getByTestId('popup-content');
            let popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '150px',
                left: '400px',
            });

            // Update anchor rect
            mockUseRect.mockReturnValue({
                top: 200,
                left: 300,
                right: 500,
                bottom: 250,
                width: 200,
                height: 50,
            } as DOMRect);

            rerender(<TestComponent />);

            popup = screen.getByTestId('popup-content').parentElement;

            expect(popup).toHaveStyle({
                top: '250px', // new bottom
                left: '500px', // new right
            });
        });

        it('does not render popup when anchor rect is null', () => {
            mockUseRect.mockReturnValue(null);

            render(<TestComponent />);

            expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
        });

        it('does not render popup when anchor rect has no top property', () => {
            mockUseRect.mockReturnValue({
                left: 200,
                right: 400,
                bottom: 150,
                width: 200,
                height: 50,
            } as any);

            render(<TestComponent />);

            expect(screen.queryByTestId('popup-content')).not.toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('handles missing onClose prop gracefully', () => {
            const TestWithoutOnClose = () => {
                const anchorRef = useRef<HTMLButtonElement>(null);
                return (
                    <>
                        <button ref={anchorRef}>Anchor</button>
                        <Popup anchor={anchorRef}>
                            <div data-testid="popup-content">Content</div>
                        </Popup>
                    </>
                );
            };

            expect(() => {
                render(<TestWithoutOnClose />);
                fireEvent.mouseDown(document.body);
            }).not.toThrow();
        });

        it('handles null anchor element', () => {
            const TestWithNullAnchor = () => {
                const anchorRef = useRef<HTMLButtonElement>(null);
                return (
                    <Popup anchor={anchorRef} onClose={mockOnClose}>
                        <div data-testid="popup-content">Content</div>
                    </Popup>
                );
            };

            mockUseRect.mockReturnValue(null);

            expect(() => {
                render(<TestWithNullAnchor />);
            }).not.toThrow();
        });

        it('handles empty children', () => {
            const TestWithEmptyChildren = () => {
                const anchorRef = useRef<HTMLButtonElement>(null);
                return (
                    <>
                        <button ref={anchorRef}>Anchor</button>
                        <Popup anchor={anchorRef} onClose={mockOnClose}>
                            {null}
                        </Popup>
                    </>
                );
            };

            expect(() => {
                render(<TestWithEmptyChildren />);
            }).not.toThrow();
        });

        it('handles multiple popups simultaneously', () => {
            const TestMultiplePopups = () => {
                const anchor1Ref = useRef<HTMLButtonElement>(null);
                const anchor2Ref = useRef<HTMLButtonElement>(null);

                return (
                    <>
                        <button ref={anchor1Ref} data-testid="anchor-1">
                            Anchor 1
                        </button>
                        <button ref={anchor2Ref} data-testid="anchor-2">
                            Anchor 2
                        </button>
                        <Popup anchor={anchor1Ref} onClose={mockOnClose}>
                            <div data-testid="popup-1">Popup 1</div>
                        </Popup>
                        <Popup anchor={anchor2Ref} onClose={mockOnClose}>
                            <div data-testid="popup-2">Popup 2</div>
                        </Popup>
                    </>
                );
            };

            render(<TestMultiplePopups />);

            expect(screen.getByTestId('popup-1')).toBeInTheDocument();
            expect(screen.getByTestId('popup-2')).toBeInTheDocument();
        });

        it('handles rapid anchor position changes', async () => {
            const { rerender } = render(<TestComponent />);

            // Simulate rapid position updates
            for (let i = 0; i < 5; i++) {
                mockUseRect.mockReturnValue({
                    top: 100 + i * 10,
                    left: 200 + i * 10,
                    right: 400 + i * 10,
                    bottom: 150 + i * 10,
                    width: 200,
                    height: 50,
                } as DOMRect);

                rerender(<TestComponent />);
            }

            await waitFor(() => {
                const popup = screen.getByTestId('popup-content').parentElement;
                expect(popup).toHaveStyle({
                    top: '190px', // 150 + 4*10
                    left: '440px', // 400 + 4*10
                });
            });
        });

        it('preserves popup visibility during anchor movement', () => {
            const { rerender } = render(<TestComponent />);

            expect(screen.getByTestId('popup-content')).toBeInTheDocument();

            mockUseRect.mockReturnValue({
                top: 500,
                left: 600,
                right: 800,
                bottom: 550,
                width: 200,
                height: 50,
            } as DOMRect);

            rerender(<TestComponent />);

            expect(screen.getByTestId('popup-content')).toBeInTheDocument();
        });
    });

    describe('Transform calculations', () => {
        it('correctly calculates all origin combinations', () => {
            const origins: Array<
                [string, string, { top: string; left: string; transform: string }]
            > = [
                [
                    'top left',
                    'top left',
                    { top: '100px', left: '200px', transform: 'translate(0, 0)' },
                ],
                [
                    'top center',
                    'top center',
                    { top: '100px', left: '300px', transform: 'translate(-50%, 0)' },
                ],
                [
                    'top right',
                    'top right',
                    { top: '100px', left: '400px', transform: 'translate(-100%, 0)' },
                ],
                [
                    'bottom left',
                    'bottom left',
                    { top: '150px', left: '200px', transform: 'translate(0, -100%)' },
                ],
                [
                    'bottom center',
                    'bottom center',
                    { top: '150px', left: '300px', transform: 'translate(-50%, -100%)' },
                ],
                [
                    'bottom right',
                    'bottom right',
                    { top: '150px', left: '400px', transform: 'translate(-100%, -100%)' },
                ],
                [
                    'center left',
                    'center left',
                    { top: '125px', left: '200px', transform: 'translate(0, -50%)' },
                ],
                [
                    'center center',
                    'center center',
                    { top: '125px', left: '300px', transform: 'translate(-50%, -50%)' },
                ],
                [
                    'center right',
                    'center right',
                    { top: '125px', left: '400px', transform: 'translate(-100%, -50%)' },
                ],
            ];

            origins.forEach(([anchorOrigin, transformOrigin, expectedStyle]) => {
                const { unmount } = render(
                    <TestComponent anchorOrigin={anchorOrigin} transformOrigin={transformOrigin} />,
                );

                const popup = screen.getByTestId('popup-content').parentElement;
                expect(popup).toHaveStyle(expectedStyle);
                unmount();
            });
        });
    });
});
