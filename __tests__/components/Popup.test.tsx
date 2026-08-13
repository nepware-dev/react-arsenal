import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useCallback, useEffect, useRef, useState } from 'react';

import Popup from '../../components/Popup';
import useRect from '../../hooks/useRect';

vi.mock('../../hooks/useRect', () => ({
    default: vi.fn(),
}));

vi.mock('../../components/Portal', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid='portal'>{children}</div>,
}));

type FocusLockNode = HTMLElement & { shards?: HTMLElement[] };

vi.mock('react-focus-lock', () => ({
    default: ({
        children,
        disabled,
        shards,
    }: {
        children: React.ReactNode;
        disabled?: boolean;
        shards?: HTMLElement[];
    }) => (
        <div
            data-testid='focus-lock'
            data-disabled={disabled}
            ref={(node: FocusLockNode | null) => {
                if (node) node.shards = shards;
            }}
        >
            {children}
        </div>
    ),
}));

const mockUseRect = useRect as Mock;

const getShards = (lock: HTMLElement) => (lock as FocusLockNode).shards ?? [];

const defaultAnchorRect = {
    top: 100,
    left: 200,
    right: 400,
    bottom: 150,
    width: 200,
    height: 50,
} as DOMRect;

const defaultBoundingRect = {
    top: 0,
    left: 0,
    right: 2000,
    bottom: 2000,
    width: 2000,
    height: 2000,
} as DOMRect;

const WRAPPER_PADDING = 20;

describe('Popup', () => {
    const mockOnClose = vi.fn();

    let mockAnchorRect: DOMRect;
    let mockBoundingRect: DOMRect | null;

    const setAnchorRect = (rect: DOMRect | null) => {
        mockAnchorRect = rect as DOMRect;
    };

    const TestComponent = ({ onClose = mockOnClose, ...props }: any) => {
        const anchorRef = useRef<HTMLButtonElement>(null);

        return (
            <>
                <button ref={anchorRef} data-testid='anchor-button'>
                    Anchor
                </button>
                <Popup anchor={anchorRef} onClose={onClose} {...props}>
                    <div data-testid='popup-content'>Popup Content</div>
                </Popup>
            </>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockAnchorRect = defaultAnchorRect;
        mockBoundingRect = defaultBoundingRect;

        Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
            if (this instanceof HTMLElement && this.dataset.testid === 'anchor-button') {
                return mockAnchorRect;
            }
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
            } as DOMRect;
        };

        mockUseRect.mockImplementation((node: HTMLElement | null) =>
            node === document.body ? mockBoundingRect : mockAnchorRect,
        );

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
            render(<TestComponent className='custom-popup' />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveClass('popup');
            expect(popup).toHaveClass('custom-popup');
        });

        it('renders inside FocusLock component', () => {
            render(<TestComponent />);

            expect(screen.getByTestId('focus-lock')).toBeInTheDocument();
            expect(screen.getByTestId('popup-content').closest('[data-testid="focus-lock"]')).toBeInTheDocument();
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
            render(<TestComponent anchorOrigin='top left' transformOrigin='top left' />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '100px', // top of anchor
                left: '200px', // left of anchor
                transform: 'translate(0, 0)', // top left transform
            });
        });

        it('positions popup with center center origins', () => {
            render(<TestComponent anchorOrigin='center center' transformOrigin='center center' />);

            const popupContent = screen.getByTestId('popup-content');
            const popup = popupContent.parentElement;

            expect(popup).toHaveStyle({
                top: '125px', // center of anchor (100 + 150) / 2
                left: '300px', // center of anchor (200 + 400) / 2
                transform: 'translate(-50%, -50%)', // center transform
            });
        });

        it('positions popup with top center origins', () => {
            render(<TestComponent anchorOrigin='top center' transformOrigin='top center' />);

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

            render(<TestComponent anchorOrigin='bottom right' transformOrigin='bottom right' />);

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

    describe('Focus lock shards', () => {
        const NestedPopups = ({ nested = true }: { nested?: boolean }) => {
            const anchorRef = useRef<HTMLButtonElement>(null);
            const nestedAnchorRef = useRef<HTMLButtonElement>(null);

            return (
                <>
                    <button ref={anchorRef} data-testid='anchor-button'>
                        Anchor
                    </button>
                    <Popup anchor={anchorRef} onClose={mockOnClose} disableFocusLock>
                        <div data-testid='popup-content'>
                            <button ref={nestedAnchorRef} data-testid='nested-anchor'>
                                Nested anchor
                            </button>
                            {nested && (
                                <Popup anchor={nestedAnchorRef} onClose={mockOnClose}>
                                    <div data-testid='nested-content'>Nested Content</div>
                                </Popup>
                            )}
                        </div>
                    </Popup>
                </>
            );
        };

        it('starts with no shards when nothing is portalled inside the popup', () => {
            render(<TestComponent />);

            expect(getShards(screen.getByTestId('focus-lock'))).toHaveLength(0);
        });

        it('registers a nested popup as a shard of the popup that owns it', () => {
            render(<NestedPopups />);

            const [outerLock] = screen.getAllByTestId('focus-lock');
            const nestedWrapper = screen.getByTestId('nested-content').parentElement;

            expect(getShards(outerLock)).toEqual([nestedWrapper]);
        });

        it('drops the shard again when the nested popup unmounts', () => {
            const { rerender } = render(<NestedPopups />);

            rerender(<NestedPopups nested={false} />);

            expect(getShards(screen.getByTestId('focus-lock'))).toHaveLength(0);
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
            setAnchorRect({
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

        it('does not render popup when anchor rect has no top property', () => {
            setAnchorRect({
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
                            <div data-testid='popup-content'>Content</div>
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
                        <div data-testid='popup-content'>Content</div>
                    </Popup>
                );
            };

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
                        <button ref={anchor1Ref} data-testid='anchor-1'>
                            Anchor 1
                        </button>
                        <button ref={anchor2Ref} data-testid='anchor-2'>
                            Anchor 2
                        </button>
                        <Popup anchor={anchor1Ref} onClose={mockOnClose}>
                            <div data-testid='popup-1'>Popup 1</div>
                        </Popup>
                        <Popup anchor={anchor2Ref} onClose={mockOnClose}>
                            <div data-testid='popup-2'>Popup 2</div>
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
                setAnchorRect({
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

            setAnchorRect({
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
            const origins: Array<[string, string, { top: string; left: string; transform: string }]> = [
                ['top left', 'top left', { top: '100px', left: '200px', transform: 'translate(0, 0)' }],
                ['top center', 'top center', { top: '100px', left: '300px', transform: 'translate(-50%, 0)' }],
                ['top right', 'top right', { top: '100px', left: '400px', transform: 'translate(-100%, 0)' }],
                ['bottom left', 'bottom left', { top: '150px', left: '200px', transform: 'translate(0, -100%)' }],
                [
                    'bottom center',
                    'bottom center',
                    { top: '150px', left: '300px', transform: 'translate(-50%, -100%)' },
                ],
                ['bottom right', 'bottom right', { top: '150px', left: '400px', transform: 'translate(-100%, -100%)' }],
                ['center left', 'center left', { top: '125px', left: '200px', transform: 'translate(0, -50%)' }],
                ['center center', 'center center', { top: '125px', left: '300px', transform: 'translate(-50%, -50%)' }],
                ['center right', 'center right', { top: '125px', left: '400px', transform: 'translate(-100%, -50%)' }],
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

    describe('Dynamic viewport positioning', () => {
        let mockContainerRect: DOMRect;
        let mockContainerClientSize: { width: number; height: number };

        const setContainerRect = (rect: { top: number; left: number; width: number; height: number }) => {
            mockContainerRect = {
                top: rect.top,
                left: rect.left,
                right: rect.left + rect.width,
                bottom: rect.top + rect.height,
                width: rect.width,
                height: rect.height,
                x: rect.left,
                y: rect.top,
                toJSON: () => ({}),
            } as DOMRect;
        };

        const TestComponentWithViewport = ({
            onClose = mockOnClose,
            setScroll = false,
            style = {},
            containerStyle = {},
            ...props
        }: any) => {
            const anchorRef = useRef<HTMLButtonElement>(null);
            const containerRef = useRef<HTMLDivElement>(null);

            const [isAnchorReady, setIsAnchorReady] = useState(false);
            const viewportContainerRefCallback = useCallback(
                (node: HTMLDivElement | null) => {
                    if (!node) return;

                    containerRef.current = node;

                    if (!setScroll) return;

                    Object.defineProperty(node, 'scrollTop', {
                        configurable: true,
                        value: 50,
                        writable: true,
                    });

                    Object.defineProperty(node, 'scrollLeft', {
                        configurable: true,
                        value: 30,
                        writable: true,
                    });

                    const updatedAnchorRect = {
                        ...mockAnchorRect,
                        top: mockAnchorRect.top - 50,
                        bottom: mockAnchorRect.bottom - 50,
                        left: mockAnchorRect.left - 30,
                        right: mockAnchorRect.right - 30,
                    };
                    setAnchorRect(updatedAnchorRect);
                },
                [setScroll],
            );

            useEffect(() => setIsAnchorReady(true), []);

            return (
                <div style={containerStyle} data-testid='viewport-wrapper'>
                    <div
                        ref={viewportContainerRefCallback}
                        data-testid='viewport-container'
                        style={{ overflow: 'auto', position: 'relative', ...style }}
                    >
                        <button ref={anchorRef} data-testid='anchor-button'>
                            Anchor
                        </button>
                        {isAnchorReady && (
                            <Popup container={containerRef.current} anchor={anchorRef} onClose={onClose} {...props}>
                                <div data-testid='popup-content'>Popup Content</div>
                            </Popup>
                        )}
                    </div>
                </div>
            );
        };

        beforeEach(() => {
            setContainerRect({ top: 0, left: 0, width: 300, height: 300 });
            mockContainerClientSize = { width: 300, height: 300 };

            Element.prototype.getBoundingClientRect = function (this: Element): DOMRect {
                const testId = this instanceof HTMLElement ? this.dataset.testid : undefined;

                if (testId === 'anchor-button') {
                    return mockAnchorRect;
                }

                if (testId === 'viewport-container') {
                    return mockContainerRect;
                }

                if (testId === 'viewport-wrapper') {
                    return {
                        top: mockContainerRect.top - WRAPPER_PADDING,
                        left: mockContainerRect.left - WRAPPER_PADDING,
                        right: mockContainerRect.right + WRAPPER_PADDING,
                        bottom: mockContainerRect.bottom + WRAPPER_PADDING,
                        width: mockContainerRect.width + 2 * WRAPPER_PADDING,
                        height: mockContainerRect.height + 2 * WRAPPER_PADDING,
                        x: mockContainerRect.left - WRAPPER_PADDING,
                        y: mockContainerRect.top - WRAPPER_PADDING,
                        toJSON: () => ({}),
                    }
                }

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
                } as DOMRect;
            };

            function mockClientDimension(dimension: 'width' | 'height'): PropertyDescriptor {
                return {
                    configurable: true,
                    get(this: HTMLElement) {
                        switch (this.dataset.testid) {
                            case 'viewport-container':
                                return mockContainerClientSize[dimension];
                            case 'viewport-wrapper':
                                return mockContainerClientSize[dimension] + 2 * WRAPPER_PADDING;
                            default:
                                return 0;
                        }
                    },
                };
            }

            Object.defineProperty(HTMLElement.prototype, 'clientWidth', mockClientDimension('width'));
            Object.defineProperty(HTMLElement.prototype, 'clientHeight', mockClientDimension('height'));

            mockUseRect.mockImplementation((node: HTMLElement | null) => {
                if (node === document.body) {
                    return mockBoundingRect;
                }

                if (node instanceof HTMLElement && node.dataset.testid === 'viewport-container') {
                    return mockContainerRect;
                }

                if (node instanceof HTMLElement && node.dataset.testid === 'viewport-wrapper') {
                    return {
                        top: mockContainerRect.top - WRAPPER_PADDING,
                        left: mockContainerRect.left - WRAPPER_PADDING,
                        right: mockContainerRect.right + WRAPPER_PADDING,
                        bottom: mockContainerRect.bottom + WRAPPER_PADDING,
                        width: mockContainerRect.width + 2 * WRAPPER_PADDING,
                        height: mockContainerRect.height + 2 * WRAPPER_PADDING,
                        x: mockContainerRect.left - WRAPPER_PADDING,
                        y: mockContainerRect.top - WRAPPER_PADDING,
                        toJSON: () => ({}),
                    };
                }
                return mockAnchorRect;
            });
        });

        it('keeps the original origin when the popup fits inside a scrollable viewport ancestor', () => {
            setAnchorRect({
                top: 150,
                left: 150,
                right: 190,
                bottom: 190,
                width: 40,
                height: 40,
            } as DOMRect);

            render(<TestComponentWithViewport anchorOrigin='bottom left' transformOrigin='top left' />);

            const popup = screen.getByTestId('popup-content').parentElement;

            expect(popup).toHaveStyle({
                top: '190px',
                left: '150px',
                transform: 'translate(0, 0)',
            });
        });

        it.each([
            ['backdropFilter', 'blur(4px)'],
            ['rotate', '45deg'],
            ['scale', '1.5'],
            ['translate', '10px'],
            ['willChange', 'transform'],
            ['contain', 'layout'],
        ])(
            'treats a static container with %s set as a containing block, same as position: relative',
            (property, value) => {
                setAnchorRect({
                    top: 150,
                    left: 150,
                    right: 190,
                    bottom: 190,
                    width: 40,
                    height: 40,
                } as DOMRect);

                render(
                    <TestComponentWithViewport
                        anchorOrigin='bottom left'
                        transformOrigin='top left'
                        style={{ position: 'static' }}
                        containerStyle={{[property]: value, padding: WRAPPER_PADDING}}
                    />,
                );

                const popup = screen.getByTestId('popup-content').parentElement;

                expect(popup).toHaveStyle({
                    top: '210px',
                    left: '170px',
                    transform: 'translate(0, 0)',
                });
            },
        );

        it('flips the anchor/transform origin so the popup stays inside the viewport ancestor', () => {
            const style = document.createElement('style');
            style.textContent = '.test-boundary-margin { margin: 12px; }';
            document.head.appendChild(style);

            setAnchorRect({
                top: 200,
                left: 10,
                right: 60,
                bottom: 250,
                width: 50,
                height: 50,
            } as DOMRect);

            render(
                <TestComponentWithViewport
                    className='test-boundary-margin'
                    anchorOrigin='bottom left'
                    transformOrigin='top left'
                />,
            );

            const popup = screen.getByTestId('popup-content').parentElement as HTMLElement;

            // Overflows bottom → flips to "top left" / "bottom left", anchoring to anchor's top edge.
            expect(popup).toHaveStyle({
                top: '200px',
                left: '10px',
                transform: 'translate(0, -100%)',
            });

            expect(popup.style.marginTop).toBe('-12px');

            document.head.removeChild(style);
        });

        it('picks the flipped candidate with the lowest overflow even when it still overflows the viewport ancestor', () => {
            setAnchorRect({
                top: 10,
                left: 10,
                right: 50,
                bottom: 50,
                width: 40,
                height: 40,
            } as DOMRect);

            mockContainerClientSize = { width: 50, height: 50 };

            render(<TestComponentWithViewport anchorOrigin='bottom left' transformOrigin='top left'/>);

            const popup = screen.getByTestId('popup-content').parentElement;

            // Anchor sits in the top-left corner, so no candidate fits fully, but flipping to
            // "top right" / "bottom right" overflows least (only past the top/left edges).
               expect(popup).toHaveStyle({
                top: '10px',
                left: '50px',
                transform: 'translate(-100%, -100%)',
            });
        });

        it('accounts for container scroll offset when positioning the popup', () => {
            setAnchorRect({
                top: 100,
                left: 150,
                right: 190,
                bottom: 140,
                width: 40,
                height: 40,
            } as DOMRect);

            render(<TestComponentWithViewport anchorOrigin='bottom left' transformOrigin='top left' setScroll />);

            const popup = screen.getByTestId('popup-content').parentElement;

            // scrollTop (50) & scrollLeft (30) are factored into positioning but values are viewport-relative,
            // so anchor.bottom (140) and anchor.left (150) are used without adding scroll offset.
            expect(popup).toHaveStyle({
                top: '140px',
                left: '150px',
                transform: 'translate(0, 0)',
            });
        });

        it('adjusts popup position after container scroll when anchor is near the bottom and overflow flip occurs', () => {
            setAnchorRect({
                top: 100,
                left: 50,
                right: 100,
                bottom: 150,
                width: 50,
                height: 50,
            } as DOMRect);

            render(<TestComponentWithViewport anchorOrigin='top left' transformOrigin='bottom left' setScroll />);

            const popup = screen.getByTestId('popup-content').parentElement;

            // Scroll pushes popup out of view → flips to "bottom left" / "top left".
            // top: anchor.top (100), no scroll added (viewport-relative).
            expect(popup).toHaveStyle({
                top: '150px',
                left: '50px',
                transform: 'translate(0, 0)',
            });
        });

        it('flips anchor/transform origin horizontally when anchor is near the right edge and container is scrolled', () => {
            setAnchorRect({
                top: 100,
                left: 70,
                right: 110,
                bottom: 140,
                width: 40,
                height: 40,
            } as DOMRect);

            render(<TestComponentWithViewport anchorOrigin='bottom right' transformOrigin='top right' setScroll />);

            const popup = screen.getByTestId('popup-content').parentElement;

            // Overflow right edge → flips to "bottom left" / "top left".
            expect(popup).toHaveStyle({
                top: '140px',
                left: '70px',
                transform: 'translate(0, 0)',
            });
        });

        it('flips origin when window scroll pushes popup past viewport bottom', () => {
            const defaultAnchorRect = {
                top: 120,
                left: 10,
                right: 50,
                bottom: 170,
                width: 40,
                height: 50,
            } as DOMRect;
            setAnchorRect(defaultAnchorRect);

            Object.defineProperty(window, 'pageYOffset', { value: 30, writable: true });

            const updatedAnchorRect = {
                ...defaultAnchorRect,
                top: defaultAnchorRect.top - 30,
                bottom: defaultAnchorRect.bottom - 30,
            };
            const updatedUpdatedContainerRect = {
                ...mockContainerRect,
                top: mockContainerRect.top - 30,
                bottom: mockContainerRect.bottom - 30,
            };
            setAnchorRect(updatedAnchorRect);
            setContainerRect(updatedUpdatedContainerRect);

            render(<TestComponentWithViewport anchorOrigin='top left' transformOrigin='bottom left' />);

            // pageYOffset pushes popup above viewport → flips to "bottom left" / "top left".
            // top: anchor.bottom (140), viewport-relative.
            const popup = screen.getByTestId('popup-content').parentElement;
            expect(popup).toHaveStyle({
                top: '170px',
                left: '10px',
                transform: 'translate(0, 0)',
            });
        });
    });
});
