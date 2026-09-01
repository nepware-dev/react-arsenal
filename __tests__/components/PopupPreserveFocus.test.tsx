import '@testing-library/jest-dom';
import { render, cleanup, createEvent, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { useRef, useState, type ReactNode } from 'react';

import Popup from '../../components/Popup';

const noop = () => {};

const pressAndReadDefault = (target: HTMLElement, init?: MouseEventInit) => {
    const event = createEvent.mouseDown(target, { bubbles: true, ...init });
    fireEvent(target, event);
    return event.defaultPrevented;
};

// jsdom lays nothing out, so a scroller has to be described by hand.
const makeScroller = (target: HTMLElement, clientLeft = 0) => {
    Object.defineProperty(target, 'clientLeft', { value: clientLeft, configurable: true });
    Object.defineProperty(target, 'clientWidth', { value: 100, configurable: true });
    Object.defineProperty(target, 'scrollHeight', { value: 500, configurable: true });
    target.getBoundingClientRect = () => new DOMRect(0, 0, clientLeft + 100, 100);
    return target;
};

const renderPopupWith = (content: ReactNode) => {
    const Harness = () => {
        const anchor = useRef<HTMLDivElement>(null);

        return (
            <div>
                <div ref={anchor}>anchor</div>
                <Popup isVisible anchor={anchor} onClose={noop}>
                    {content}
                </Popup>
            </div>
        );
    };

    return render(<Harness />);
};

afterEach(cleanup);

describe('Popup focus preservation', () => {
    it('guards a press on plain popup content', () => {
        renderPopupWith(<p data-testid="target">just text</p>);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(true);
    });

    it('guards a press on a disabled control, which cannot take focus either', () => {
        renderPopupWith(<input disabled tabIndex={-1} data-testid="target" />);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(true);
    });

    it('leaves a press on a control alone so it can take pointer focus', () => {
        renderPopupWith(<button type="button" data-testid="target">press me</button>);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(false);
    });

    // tabIndex -1 is focusable by pointer even though Tab skips it.
    it('leaves a press on an element made focusable by tabindex alone', () => {
        renderPopupWith(<div tabIndex={-1} data-testid="target">focusable</div>);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(false);
    });

    // Guarding the press would stop the browser starting a native drag.
    it('leaves a press on a draggable item alone', () => {
        renderPopupWith(<div draggable data-testid="target">drag me</div>);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(false);
    });

    it('leaves a press on content marked data-selectable alone', () => {
        renderPopupWith(<p data-selectable data-testid="target">selectable prose</p>);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(false);
    });

    it('guards a press on an inline element, which has no scrollbar to drive', () => {
        renderPopupWith(<p>label <span data-testid="target">Option B</span></p>);

        expect(pressAndReadDefault(screen.getByTestId('target'), { clientX: 30 })).toBe(true);
    });

    it('leaves a press on a trailing edge scrollbar alone', () => {
        renderPopupWith(<div data-testid="target">scrollable content</div>);
        const target = makeScroller(screen.getByTestId('target'));

        expect(pressAndReadDefault(target, { clientX: 120 })).toBe(false);
    });

    it('leaves a press on a leading edge scrollbar alone', () => {
        renderPopupWith(<div data-testid="target">scrollable content</div>);
        const target = makeScroller(screen.getByTestId('target'), 16);

        expect(pressAndReadDefault(target, { clientX: 8 })).toBe(false);
    });

    it('leaves a non primary press alone', () => {
        renderPopupWith(<p data-testid="target">just text</p>);

        expect(pressAndReadDefault(screen.getByTestId('target'), { button: 1 })).toBe(false);
    });

    it('ignores a focusable ancestor outside the popup', () => {
        const InFocusableContainer = () => {
            const anchor = useRef<HTMLDivElement>(null);
            const [container, setContainer] = useState<HTMLDivElement | null>(null);

            return (
                <div>
                    <div ref={anchor}>anchor</div>
                    <div ref={setContainer} tabIndex={0}>
                        {container && (
                            <Popup isVisible anchor={anchor} container={container} onClose={noop}>
                                <p data-testid="target">just text</p>
                            </Popup>
                        )}
                    </div>
                </div>
            );
        };
        render(<InFocusableContainer />);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(true);
    });

    it('leaves a press inside a nested popup to that popup', () => {
        const Nested = () => {
            const outerAnchor = useRef<HTMLDivElement>(null);
            const innerAnchor = useRef<HTMLDivElement>(null);

            return (
                <div>
                    <div ref={outerAnchor}>outer anchor</div>
                    <Popup isVisible anchor={outerAnchor} onClose={noop}>
                        <div ref={innerAnchor}>inner anchor</div>
                        <Popup isVisible anchor={innerAnchor} onClose={noop}>
                            <button type="button" data-testid="target">nested control</button>
                        </Popup>
                    </Popup>
                </div>
            );
        };
        render(<Nested />);

        expect(pressAndReadDefault(screen.getByTestId('target'))).toBe(false);
    });
});
