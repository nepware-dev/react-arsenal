import { useState } from 'react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import PanelGroup, { Panel } from '../../components/ResizablePanel';

/*
 * The measure module is real here, so these run against the DOM the component
 * actually writes. jsdom has no layout engine, so the layout comes from the
 * controlled prop rather than a drag.
 */
const Group = ({ style }: { style: React.CSSProperties }) => {
    const [layout, setLayout] = useState<number[] | undefined>([30, 70]);

    return (
        <PanelGroup layout={layout} onLayout={setLayout}>
            <Panel style={style}>one</Panel>
            <Panel>two</Panel>
        </PanelGroup>
    );
};

const panelOne = () => screen.getByText('one');
const growth = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLElement>('[id*="-panel-"]')].map((el) => el.style.flexGrow);

describe('PanelGroup reset', () => {
    it('gives back inline flex written as longhands', () => {
        render(<Group style={{ flexBasis: '300px' }} />);
        expect(panelOne().style.flexGrow).toBe('30');

        fireEvent.doubleClick(screen.getByRole('separator'));

        expect(panelOne().style.flexBasis).toBe('300px');
        expect(panelOne().style.flexGrow).toBe('');
    });

    it('gives back inline flex written as the shorthand', () => {
        render(<Group style={{ flex: '0 0 300px' }} />);

        fireEvent.doubleClick(screen.getByRole('separator'));

        expect(panelOne().style.flexBasis).toBe('300px');
        expect(panelOne().style.flexGrow).toBe('0');
    });

    it('leaves nothing behind when the panel had no inline flex', () => {
        render(<Group style={{ color: 'red' }} />);

        fireEvent.doubleClick(screen.getByRole('separator'));

        expect(panelOne().style.flexBasis).toBe('');
        expect(panelOne().style.flexGrow).toBe('');
        expect(panelOne().style.color).toBe('red');
    });
});

describe('PanelGroup applied layout', () => {
    // The group cannot know which element sits at which index from one render to the
    // next, so the growth it wrote has to be reasserted rather than assumed to hold.
    it('follows the panels when keyed children are reordered', () => {
        const layout = [30, 70];
        const a = <Panel key="a">a</Panel>;
        const b = <Panel key="b">b</Panel>;

        const { container, rerender } = render(<PanelGroup layout={layout}>{[a, b]}</PanelGroup>);
        expect(growth(container)).toEqual(['30', '70']);

        rerender(<PanelGroup layout={layout}>{[b, a]}</PanelGroup>);

        expect(growth(container)).toEqual(['30', '70']);
    });

    it('reasserts itself over an inline flex the consumer changes', () => {
        const layout = [30, 70];
        const { container, rerender } = render(
            <PanelGroup layout={layout}>
                <Panel style={{ flexBasis: '100px' }}>a</Panel>
                <Panel>b</Panel>
            </PanelGroup>,
        );

        rerender(
            <PanelGroup layout={layout}>
                <Panel style={{ flexBasis: '400px' }}>a</Panel>
                <Panel>b</Panel>
            </PanelGroup>,
        );

        expect(growth(container)).toEqual(['30', '70']);
        expect(screen.getByText('a').style.flexBasis).toBe('0px');
    });
});

describe('PanelGroup panel accounting', () => {
    // Applied as far as it goes, it would leave the skipped panel on a zero basis.
    it('ignores a layout that does not describe every panel', () => {
        const { container } = render(
            <PanelGroup layout={[30, 70]}>
                <Panel>a</Panel>
                <Panel>b</Panel>
                <Panel>c</Panel>
            </PanelGroup>,
        );

        expect(growth(container)).toEqual(['', '', '']);
        expect(screen.getByText('c').style.flexBasis).toBe('');
    });

    it('stops sizing the panels when a child renders none', () => {
        const { container } = render(
            <PanelGroup layout={[50, 50]}>
                <Panel>a</Panel>
                <div>toolbar</div>
                <Panel>b</Panel>
            </PanelGroup>,
        );

        expect(growth(container)).toEqual(['', '']);
    });
});

class FakeResizeObserver {
    static instances: FakeResizeObserver[] = [];

    observed = new Set<Element>();

    constructor(public callback: ResizeObserverCallback) {
        FakeResizeObserver.instances.push(this);
    }

    observe(el: Element) {
        this.observed.add(el);
    }

    unobserve(el: Element) {
        this.observed.delete(el);
    }

    disconnect() {
        this.observed.clear();
    }
}

describe('PanelGroup observation', () => {
    beforeEach(() => {
        FakeResizeObserver.instances = [];
        vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    });

    afterEach(() => vi.unstubAllGlobals());

    it('follows a replaced panel rather than the element it left behind', () => {
        const Group = ({ id }: { id: string }) => (
            <PanelGroup>
                <Panel key={id}>a</Panel>
                <Panel key="b">b</Panel>
            </PanelGroup>
        );

        const { rerender } = render(<Group id="a1" />);
        const [observer] = FakeResizeObserver.instances;
        const before = screen.getByText('a');

        rerender(<Group id="a2" />);
        const after = screen.getByText('a');

        expect(after).not.toBe(before);
        expect(observer.observed.has(after)).toBe(true);
        expect(observer.observed.has(before)).toBe(false);
    });
});
