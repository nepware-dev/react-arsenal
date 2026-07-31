import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRef } from 'react';

import Popup from '../../components/Popup';
import useRect from '../../hooks/useRect';

vi.mock('../../hooks/useRect', () => ({
    default: vi.fn(),
}));

vi.mock('react-focus-lock', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseRect = useRect as Mock;

describe('Nested popups', () => {
    const onOuterClose = vi.fn();
    const onMiddleClose = vi.fn();
    const onInnerClose = vi.fn();

    const NestedPopups = ({ depth = 2 }: { depth?: number }) => {
        const outerAnchorRef = useRef<HTMLButtonElement>(null);
        const middleAnchorRef = useRef<HTMLButtonElement>(null);
        const innerAnchorRef = useRef<HTMLButtonElement>(null);

        return (
            <>
                <button ref={outerAnchorRef} data-testid="outer-anchor">
                    Outer anchor
                </button>
                <Popup anchor={outerAnchorRef} onClose={onOuterClose}>
                    <div data-testid="outer-content">
                        <button ref={middleAnchorRef} data-testid="middle-anchor">
                            Middle anchor
                        </button>
                        <Popup anchor={middleAnchorRef} onClose={onMiddleClose}>
                            <div data-testid="middle-content">
                                <button ref={innerAnchorRef} data-testid="inner-anchor">
                                    Inner anchor
                                </button>
                                {depth > 2 && (
                                    <Popup anchor={innerAnchorRef} onClose={onInnerClose}>
                                        <div data-testid="inner-content">Inner content</div>
                                    </Popup>
                                )}
                            </div>
                        </Popup>
                    </div>
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
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('portals the nested popup outside the parent popup wrapper', () => {
        render(<NestedPopups />);

        const outerContent = screen.getByTestId('outer-content');
        const middleContent = screen.getByTestId('middle-content');

        expect(outerContent.parentElement?.parentElement).toBe(document.body);
        expect(middleContent.parentElement?.parentElement).toBe(document.body);
        expect(outerContent.contains(middleContent)).toBe(false);
    });

    it('keeps the parent popup open when the nested popup is clicked', () => {
        render(<NestedPopups />);

        fireEvent.mouseDown(screen.getByTestId('middle-content'));

        expect(onOuterClose).not.toHaveBeenCalled();
        expect(onMiddleClose).not.toHaveBeenCalled();
    });

    it('keeps every ancestor popup open when the deepest popup is clicked', () => {
        render(<NestedPopups depth={3} />);

        fireEvent.mouseDown(screen.getByTestId('inner-content'));

        expect(onOuterClose).not.toHaveBeenCalled();
        expect(onMiddleClose).not.toHaveBeenCalled();
        expect(onInnerClose).not.toHaveBeenCalled();
    });

    it('still closes every popup on a genuine outside click', () => {
        render(<NestedPopups depth={3} />);

        fireEvent.mouseDown(document.body);

        expect(onOuterClose).toHaveBeenCalledTimes(1);
        expect(onMiddleClose).toHaveBeenCalledTimes(1);
        expect(onInnerClose).toHaveBeenCalledTimes(1);
    });

    it('closes only the parent popup when its own anchor region is left for an outside click', () => {
        render(<NestedPopups />);

        fireEvent.mouseDown(screen.getByTestId('outer-content'));

        expect(onOuterClose).not.toHaveBeenCalled();
        expect(onMiddleClose).toHaveBeenCalledTimes(1);
    });

    it('closes the parent popup on an outside click after the nested popup unmounts', () => {
        const { rerender } = render(<NestedPopups depth={3} />);

        rerender(<NestedPopups depth={2} />);
        fireEvent.mouseDown(document.body);

        expect(onOuterClose).toHaveBeenCalledTimes(1);
        expect(onMiddleClose).toHaveBeenCalledTimes(1);
        expect(onInnerClose).not.toHaveBeenCalled();
    });
});
