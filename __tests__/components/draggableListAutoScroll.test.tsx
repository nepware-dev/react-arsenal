import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import DraggableList from '../../components/DraggableList';

/*
 * jsdom lays nothing out and implements no scrolling, so only the listener and
 * frame lifecycle is worth asserting here. The velocity itself is a pure helper,
 * covered in draggableListUtils.test.ts.
 */

interface TestItem {
    id: number;
    name: string;
}

const mockData: TestItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
];

const renderList = (autoScroll: boolean) =>
    render(
        <DraggableList
            data={mockData}
            autoScroll={autoScroll}
            keyExtractor={(item: TestItem) => item.id}
            renderItem={({ item }) => <div data-testid={`item-${item.id}`}>{item.name}</div>}
            onChange={vi.fn()}
        />,
    );

const getWrapper = (id: number) => screen.getByTestId(`item-${id}`).parentElement as HTMLElement;

const createDataTransfer = () => ({
    setData: vi.fn(),
    getData: vi.fn(),
    effectAllowed: '',
    dropEffect: '',
});

type ListenerSpy = { mock: { calls: unknown[][] } };

const dragOverListenerCount = (spy: ListenerSpy) =>
    spy.mock.calls.filter((call) => call[0] === 'dragover').length;

describe('DraggableList autoScroll', () => {
    let addListener: ListenerSpy;
    let removeListener: ListenerSpy;

    beforeEach(() => {
        // Stubbed, so the loop schedules a frame that never runs.
        vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        addListener = vi.spyOn(document, 'addEventListener');
        removeListener = vi.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('tracks the pointer and runs frames only while its own drag is in flight', () => {
        renderList(true);
        const dataTransfer = createDataTransfer();
        const source = getWrapper(1);

        expect(dragOverListenerCount(addListener)).toBe(0);

        fireEvent.dragStart(source, { dataTransfer });

        expect(dragOverListenerCount(addListener)).toBe(1);
        expect(window.requestAnimationFrame).toHaveBeenCalled();

        fireEvent.dragEnd(source, { dataTransfer });

        expect(dragOverListenerCount(removeListener)).toBe(1);
        expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it('does nothing at all while autoScroll is off', () => {
        renderList(false);
        const dataTransfer = createDataTransfer();
        const source = getWrapper(1);

        fireEvent.dragStart(source, { dataTransfer });

        expect(dragOverListenerCount(addListener)).toBe(0);
        expect(window.requestAnimationFrame).not.toHaveBeenCalled();

        fireEvent.dragEnd(source, { dataTransfer });
    });

    it('stops listening when the list unmounts mid-drag', () => {
        const { unmount } = renderList(true);
        const dataTransfer = createDataTransfer();

        fireEvent.dragStart(getWrapper(1), { dataTransfer });
        expect(dragOverListenerCount(removeListener)).toBe(0);

        unmount();

        expect(dragOverListenerCount(removeListener)).toBe(1);
    });
});
