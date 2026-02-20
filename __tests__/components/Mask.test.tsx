import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

import Mask from '../../components/Mask';
import useSize from '../../hooks/useSize';

vi.mock('../../hooks/useSize', () => ({
    default: vi.fn(),
}));

vi.mock('../../components/Portal', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="portal">{children}</div>
    ),
}));

vi.mock('react-focus-lock', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="focus-lock">{children}</div>
    ),
}));

const mockUseSize = useSize as Mock;

describe('Mask', () => {
    const defaultRect = {
        top: 100,
        left: 200,
        width: 300,
        height: 150,
    };

    const defaultPadding: [number, number] = [20, 20];

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseSize.mockReturnValue({
            width: 1920,
            height: 1080,
        });

        document.body.style.overflow = '';
    });

    afterEach(() => {
        cleanup();
        document.body.style.overflow = '';
    });

    describe('Basic rendering', () => {
        it('renders mask component with default props', () => {
            const { getByTestId } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            expect(getByTestId('portal')).toBeInTheDocument();
            expect(getByTestId('focus-lock')).toBeInTheDocument();
        });

        it('renders SVG with correct dimensions', () => {
            const { container } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
            expect(svg).toHaveAttribute('width', '1920');
            expect(svg).toHaveAttribute('height', '1080');
        });

        it('renders all required SVG elements', () => {
            const { container } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            const maskrect = container.querySelector('.maskrect');
            const clickarea = container.querySelector('.clickarea');
            const highlightedarea = container.querySelector('.highlightedarea');

            expect(maskrect).toBeInTheDocument();
            expect(clickarea).toBeInTheDocument();
            expect(highlightedarea).toBeInTheDocument();
        });
    });

    describe('Padding calculations', () => {
        it('applies padding correctly to mask area', () => {
            const rect = { top: 100, left: 200, width: 300, height: 150 };
            const padding: [number, number] = [40, 60];

            const { container } = render(<Mask rect={rect} padding={padding} />);

            const maskDefs = container.querySelector('defs mask rect:nth-child(2)');
            expect(maskDefs).toBeInTheDocument();

            expect(maskDefs).toHaveAttribute('x', '180');
            expect(maskDefs).toHaveAttribute('y', '70');
            expect(maskDefs).toHaveAttribute('width', '340');
            expect(maskDefs).toHaveAttribute('height', '210');
        });

        it('uses default padding when not provided', () => {
            const rect = { top: 100, left: 200, width: 300, height: 150 };

            const { container } = render(<Mask rect={rect} />);

            const maskDefs = container.querySelector('defs mask rect:nth-child(2)');
            expect(maskDefs).toBeInTheDocument();

            expect(maskDefs).toHaveAttribute('x', '190');
            expect(maskDefs).toHaveAttribute('y', '90');
            expect(maskDefs).toHaveAttribute('width', '320');
            expect(maskDefs).toHaveAttribute('height', '170');
        });

        it('handles zero padding', () => {
            const rect = { top: 100, left: 200, width: 300, height: 150 };
            const padding: [number, number] = [0, 0];

            const { container } = render(<Mask rect={rect} padding={padding} />);

            const maskDefs = container.querySelector('defs mask rect:nth-child(2)');

            expect(maskDefs).toHaveAttribute('x', '200');
            expect(maskDefs).toHaveAttribute('y', '100');
            expect(maskDefs).toHaveAttribute('width', '300');
            expect(maskDefs).toHaveAttribute('height', '150');
        });
    });

    describe('Body scroll lock', () => {
        it('sets body overflow to hidden on mount', () => {
            render(<Mask rect={defaultRect} padding={defaultPadding} />);

            expect(document.body.style.overflow).toBe('hidden');
        });

        it('restores body overflow on unmount', () => {
            document.body.style.overflow = 'auto';

            const { unmount } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            expect(document.body.style.overflow).toBe('hidden');

            unmount();

            expect(document.body.style.overflow).toBe('');
        });

        it('handles multiple mount/unmount cycles', () => {
            const { unmount: unmount1 } = render(
                <Mask rect={defaultRect} padding={defaultPadding} />,
            );
            expect(document.body.style.overflow).toBe('hidden');

            unmount1();
            expect(document.body.style.overflow).toBe('');

            const { unmount: unmount2 } = render(
                <Mask rect={defaultRect} padding={defaultPadding} />,
            );
            expect(document.body.style.overflow).toBe('hidden');

            unmount2();
            expect(document.body.style.overflow).toBe('');
        });
    });

    describe('Visibility control', () => {
        it('renders when isVisible is true', () => {
            const { getByTestId } = render(
                <Mask rect={defaultRect} padding={defaultPadding} isVisible={true} />,
            );

            expect(getByTestId('portal')).toBeInTheDocument();
        });

        it('does not render when isVisible is false', () => {
            const { queryByTestId } = render(
                <Mask rect={defaultRect} padding={defaultPadding} isVisible={false} />,
            );

            expect(queryByTestId('portal')).not.toBeInTheDocument();
        });

        it('renders by default when isVisible is not provided', () => {
            const { getByTestId } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            expect(getByTestId('portal')).toBeInTheDocument();
        });
    });

    describe('SVG mask and clip path', () => {
        it('creates mask with correct ID', () => {
            const { container } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            const mask = container.querySelector('mask#mask');
            expect(mask).toBeInTheDocument();
        });

        it('creates clipPath with correct ID', () => {
            const { container } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            const clipPath = container.querySelector('clipPath#clippath');
            expect(clipPath).toBeInTheDocument();
        });

        it('applies mask to maskrect', () => {
            const { container } = render(<Mask rect={defaultRect} padding={defaultPadding} />);

            const maskrect = container.querySelector('.maskrect');
            expect(maskrect).toHaveAttribute('mask', 'url(#mask)');
        });
    });

    describe('Edge cases', () => {
        it('handles rect with zero dimensions', () => {
            const rect = { top: 0, left: 0, width: 0, height: 0 };

            expect(() => {
                render(<Mask rect={rect} padding={defaultPadding} />);
            }).not.toThrow();
        });

        it('handles negative padding values', () => {
            const rect = { top: 100, left: 200, width: 300, height: 150 };
            const padding: [number, number] = [-10, -10];

            const { container } = render(<Mask rect={rect} padding={padding} />);

            const maskDefs = container.querySelector('defs mask rect:nth-child(2)');

            expect(maskDefs).toHaveAttribute('x', '205');
            expect(maskDefs).toHaveAttribute('y', '105');
            expect(maskDefs).toHaveAttribute('width', '290');
            expect(maskDefs).toHaveAttribute('height', '140');
        });

        it('handles asymmetric padding', () => {
            const rect = { top: 100, left: 200, width: 300, height: 150 };
            const padding: [number, number] = [50, 100];

            const { container } = render(<Mask rect={rect} padding={padding} />);

            const maskDefs = container.querySelector('defs mask rect:nth-child(2)');

            expect(maskDefs).toHaveAttribute('x', '175');
            expect(maskDefs).toHaveAttribute('y', '50');
            expect(maskDefs).toHaveAttribute('width', '350');
            expect(maskDefs).toHaveAttribute('height', '250');
        });

        it('updates when window size changes', () => {
            const { container, rerender } = render(
                <Mask rect={defaultRect} padding={defaultPadding} />,
            );

            let svg = container.querySelector('svg');
            expect(svg).toHaveAttribute('width', '1920');
            expect(svg).toHaveAttribute('height', '1080');

            mockUseSize.mockReturnValue({
                width: 1024,
                height: 768,
            });

            rerender(<Mask rect={defaultRect} padding={defaultPadding} />);

            svg = container.querySelector('svg');
            expect(svg).toHaveAttribute('width', '1024');
            expect(svg).toHaveAttribute('height', '768');
        });

        it('handles rect at viewport edges', () => {
            const rect = { top: 0, left: 0, width: 1920, height: 1080 };

            expect(() => {
                render(<Mask rect={rect} padding={defaultPadding} />);
            }).not.toThrow();
        });
    });
});
