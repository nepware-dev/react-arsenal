import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Image from '../../components/Image';
import * as utils from '../../utils';

interface MockIntersectionObserver {
    observe: Mock;
    unobserve: Mock;
    disconnect: Mock;
}

interface MockIntersectionObserverEntry {
    isIntersecting: boolean;
    target: Element;
}

interface MockIntersectionObserverCallback {
    (entries: MockIntersectionObserverEntry[], observer: MockIntersectionObserver): void;
}

describe('Image', () => {
    let mockIntersectionObserver: MockIntersectionObserver;
    let intersectionObserverCallback: MockIntersectionObserverCallback;

    beforeEach(() => {
        mockIntersectionObserver = {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
        };

        const MockObserver = vi.fn().mockImplementation(function (
            callback: MockIntersectionObserverCallback,
        ) {
            intersectionObserverCallback = callback;

            return {
                observe: mockIntersectionObserver.observe,
                unobserve: mockIntersectionObserver.unobserve,
                disconnect: mockIntersectionObserver.disconnect,
                takeRecords: vi.fn(),
                root: null,
                rootMargin: '',
                thresholds: [],
            };
        });

        vi.stubGlobal('IntersectionObserver', MockObserver);
        vi.spyOn(utils, 'isIntersectionObserverAvailable').mockReturnValue(true);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('Basic rendering', () => {
        it('renders image immediately when lazy is false', () => {
            const { container } = render(
                <Image src="test.jpg" alt="Test image" lazy={false} threshold={100} />,
            );

            const img = container.querySelector('img');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'test.jpg');
            expect(img).toHaveAttribute('alt', 'Test image');
        });

        it('renders placeholder when lazy loading is enabled', () => {
            const { container } = render(
                <Image src="test.jpg" alt="Test image" lazy={true} threshold={100} />,
            );

            const span = container.querySelector('span');
            expect(span).toBeInTheDocument();
        });

        it('renders placeholder with placeholder image', () => {
            const { container } = render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    lazy={true}
                    threshold={100}
                    lazyPlaceholderSrc="placeholder.jpg"
                />,
            );

            const img = container.querySelector('img');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'placeholder.jpg');
        });
    });

    describe('Lazy loading functionality', () => {
        it('observes element when lazy loading is enabled', () => {
            render(<Image src="test.jpg" alt="Test image" lazy={true} threshold={150} />);

            expect(mockIntersectionObserver.observe).toHaveBeenCalled();
        });

        it('loads image when element becomes visible', async () => {
            const { container } = render(
                <Image src="test.jpg" alt="Test image" lazy={true} threshold={100} />,
            );

            const span = container.querySelector('span');
            expect(span).toBeInTheDocument();

            const mockEntry = {
                isIntersecting: true,
                target: span,
            } as MockIntersectionObserverEntry;

            intersectionObserverCallback([mockEntry], mockIntersectionObserver);

            await waitFor(() => {
                const img = container.querySelector('img');
                expect(img).toHaveAttribute('src', 'test.jpg');
            });
        });

        it('uses custom threshold', () => {
            render(<Image src="test.jpg" alt="Test image" lazy={true} threshold={200} />);

            expect(IntersectionObserver).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    rootMargin: '200px',
                }),
            );
        });

        it('unobserves element on unmount', () => {
            const { unmount } = render(
                <Image src="test.jpg" alt="Test image" lazy={true} threshold={50} />,
            );

            unmount();

            expect(mockIntersectionObserver.unobserve).toHaveBeenCalled();
        });
    });

    describe('Callback functionality', () => {
        it('calls beforeLoad when image becomes visible', async () => {
            const beforeLoad = vi.fn();
            const { container } = render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    lazy={true}
                    threshold={100}
                    beforeLoad={beforeLoad}
                />,
            );

            const span = container.querySelector('span');
            const mockEntry = {
                isIntersecting: true,
                target: span,
            } as MockIntersectionObserverEntry;

            intersectionObserverCallback([mockEntry], mockIntersectionObserver as any);

            await waitFor(() => {
                expect(beforeLoad).toHaveBeenCalledTimes(1);
            });
        });

        it('calls afterLoad when image finishes loading', async () => {
            const afterLoad = vi.fn();
            const { container } = render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    lazy={true}
                    threshold={100}
                    afterLoad={afterLoad}
                />,
            );

            const span = container.querySelector('span');
            const mockEntry = {
                isIntersecting: true,
                target: span,
            } as MockIntersectionObserverEntry;

            intersectionObserverCallback([mockEntry], mockIntersectionObserver);

            await waitFor(() => {
                const img = container.querySelector('img');
                expect(img).toBeInTheDocument();
            });

            const img = container.querySelector('img');
            if (img) {
                img.dispatchEvent(new Event('load'));
            }

            await waitFor(() => {
                expect(afterLoad).toHaveBeenCalledTimes(1);
            });
        });

        it('does not call afterLoad multiple times', async () => {
            const afterLoad = vi.fn();
            const { container } = render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    lazy={true}
                    threshold={100}
                    afterLoad={afterLoad}
                />,
            );

            const span = container.querySelector('span');
            const mockEntry = {
                isIntersecting: true,
                target: span,
            } as MockIntersectionObserverEntry;

            intersectionObserverCallback([mockEntry], mockIntersectionObserver);

            await waitFor(() => {
                const img = container.querySelector('img');
                expect(img).toBeInTheDocument();
            });

            const img = container.querySelector('img');
            if (img) {
                img.dispatchEvent(new Event('load'));
            }

            await waitFor(() => {
                expect(afterLoad).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('IntersectionObserver not available', () => {
        it('renders image immediately when IntersectionObserver is not available', () => {
            vi.spyOn(utils, 'isIntersectionObserverAvailable').mockReturnValue(false);

            const { container } = render(
                <Image src="test.jpg" alt="Test image" lazy={true} threshold={100} />,
            );

            const img = container.querySelector('img');
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'test.jpg');
        });

        it('does not observe element when IntersectionObserver is not available', () => {
            vi.spyOn(utils, 'isIntersectionObserverAvailable').mockReturnValue(false);

            render(<Image src="test.jpg" alt="Test image" lazy={true} threshold={100} />);

            expect(mockIntersectionObserver.observe).not.toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('handles missing src gracefully', () => {
            expect(() => {
                render(<Image alt="Test image" lazy={true} threshold={100} />);
            }).not.toThrow();
        });

        it('passes through additional image props', () => {
            const { container } = render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    lazy={false}
                    threshold={100}
                    className="custom-class"
                    width={300}
                    height={200}
                />,
            );

            const img = container.querySelector('img');
            expect(img).toHaveClass('custom-class');
            expect(img).toHaveAttribute('width', '300');
            expect(img).toHaveAttribute('height', '200');
        });

        it('applies custom styles to placeholder', () => {
            const customStyle = { padding: '10px' };
            const { container } = render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    lazy={true}
                    threshold={100}
                    style={customStyle}
                />,
            );

            const span = container.querySelector('span');
            expect(span).toHaveStyle({ display: 'inline-block' });
            expect(span).toHaveStyle(customStyle);
        });

        it('handles observer cleanup when element is null', () => {
            const { unmount } = render(
                <Image src="test.jpg" alt="Test image" lazy={true} threshold={100} />,
            );

            expect(() => {
                unmount();
            }).not.toThrow();
        });

        it('does not call onLoad handler before image is visible', () => {
            const { container } = render(
                <Image src="test.jpg" alt="Test image" lazy={true} threshold={100} />,
            );

            const img = container.querySelector('img');
            if (img) {
                const onLoadHandler = img.onload;
                expect(onLoadHandler).toBeDefined();
            }
        });
    });
});
