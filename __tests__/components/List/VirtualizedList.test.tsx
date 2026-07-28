import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import List from '../../../components/List';

interface TestItem {
    id: number;
    name: string;
}

const ITEM_HEIGHT = 100;

const mockData: TestItem[] = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i}` }));

const renderItem = ({ item }: { item: TestItem }) => <div data-testid={`item-${item.id}`}>{item.name}</div>;

const keyExtractor = (item: TestItem) => item.id;

const renderedIndexes = () =>
    screen
        .getAllByTestId(/^item-/)
        .map((node) => Number(node.getAttribute('data-testid')!.replace('item-', '')))
        .sort((a, b) => a - b);

const flushRaf = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)));

// The virtualizer reads clientHeight/clientWidth once on mount (via useLayoutEffect) and
// otherwise relies on ResizeObserver, which __tests__/setup.ts mocks as inert. So the
// viewport size has to be stubbed globally *before* the component mounts, not read off
// the rendered node afterwards.
let stubbedClientHeight = 0;
let stubbedClientWidth = 0;

beforeEach(() => {
    stubbedClientHeight = 0;
    stubbedClientWidth = 0;
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        get: () => stubbedClientHeight,
    });
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get: () => stubbedClientWidth,
    });
});

afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
    Reflect.deleteProperty(HTMLElement.prototype, 'clientWidth');
});

describe('VirtualizedList', () => {
    it('renders only a window of items rather than the whole dataset', () => {
        stubbedClientHeight = 3 * ITEM_HEIGHT;

        render(
            <List
                virtual
                data={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                overscan={0}
                className="scroll-container"
            />,
        );

        const indexes = renderedIndexes();

        expect(indexes.length).toBeGreaterThan(0);
        expect(indexes.length).toBeLessThan(mockData.length);
        expect(indexes).toContain(0);
        expect(indexes).not.toContain(mockData.length - 1);
    });

    it('shifts the rendered window when the list is scrolled', async () => {
        stubbedClientHeight = 3 * ITEM_HEIGHT;

        const { container } = render(
            <List
                virtual
                data={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                overscan={0}
                className="scroll-container"
            />,
        );

        const scrollContainer = container.querySelector<HTMLElement>('.scroll-container')!;
        const initialIndexes = renderedIndexes();
        expect(Math.min(...initialIndexes)).toBe(0);

        Object.defineProperty(scrollContainer, 'scrollTop', {
            value: 20 * ITEM_HEIGHT,
            configurable: true,
        });

        act(() => {
            scrollContainer.dispatchEvent(new Event('scroll'));
        });
        await flushRaf();

        const scrolledIndexes = renderedIndexes();
        expect(Math.min(...scrolledIndexes)).toBeGreaterThan(Math.max(...initialIndexes));
    });

    it('expands the rendered window by the overscan amount', () => {
        stubbedClientHeight = 3 * ITEM_HEIGHT;

        const { unmount } = render(
            <List
                virtual
                data={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                overscan={0}
                className="scroll-container"
            />,
        );
        const baseCount = renderedIndexes().length;
        unmount();

        render(
            <List
                virtual
                data={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                overscan={5}
                className="scroll-container"
            />,
        );
        const overscanCount = renderedIndexes().length;

        expect(overscanCount).toBeGreaterThan(baseCount);
    });

    it('virtualizes along the inline axis when horizontal', () => {
        stubbedClientWidth = 3 * ITEM_HEIGHT;

        render(
            <List
                virtual
                horizontal
                data={mockData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                overscan={0}
                className="scroll-container"
            />,
        );

        const indexes = renderedIndexes();

        expect(indexes.length).toBeGreaterThan(0);
        expect(indexes.length).toBeLessThan(mockData.length);
    });
});
