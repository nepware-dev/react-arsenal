import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import DraggableList, { DraggableListProps } from '../../components/DraggableList';

interface TestItem {
    id: number;
    name: string;
}

const mockData: TestItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
];

const createDataTransfer = () => ({
    setData: vi.fn(),
    getData: vi.fn(),
    effectAllowed: '',
    dropEffect: '',
});

const getWrapper = (id: number) => screen.getByTestId(`item-${id}`).parentElement as HTMLElement;

const orderOf = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[data-testid^="item-"]')).map((node) => node.textContent);

const dragAndDrop = (source: HTMLElement, target: HTMLElement) => {
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    fireEvent.dragEnd(source, { dataTransfer });

    return dataTransfer;
};

const onChange = vi.fn();

const defaultProps: DraggableListProps<TestItem> = {
    data: mockData,
    keyExtractor: (item) => item.id,
    renderItem: ({ item, isDragging }) => (
        <div data-testid={`item-${item.id}`} data-dragging={isDragging}>
            {item.name}
        </div>
    ),
    onChange,
};

describe('DraggableList', () => {
    beforeEach(() => {
        onChange.mockClear();
    });

    describe('rendering', () => {
        it('renders every item', () => {
            render(<DraggableList {...defaultProps} />);

            mockData.forEach((item) => {
                expect(screen.getByText(item.name)).toBeInTheDocument();
            });
        });

        it('makes item wrappers draggable', () => {
            render(<DraggableList {...defaultProps} />);

            expect(getWrapper(1)).toHaveAttribute('draggable', 'true');
        });

        it('does not make item wrappers draggable when disabled', () => {
            render(<DraggableList {...defaultProps} disabled />);

            expect(getWrapper(1)).toHaveAttribute('draggable', 'false');
        });

        it('applies className, style and component', () => {
            const { container } = render(
                <DraggableList
                    {...defaultProps}
                    className='custom-list'
                    style={{ padding: '20px' }}
                    component='ul'
                />,
            );

            const list = container.querySelector('ul.custom-list');
            expect(list).toBeInTheDocument();
            expect(list).toHaveStyle({ padding: '20px' });
        });

        it('applies classNameItem to each item wrapper', () => {
            render(<DraggableList {...defaultProps} classNameItem='custom-item' />);

            expect(getWrapper(2)).toHaveClass('custom-item');
        });

        it('renders the header and footer components', () => {
            render(
                <DraggableList
                    {...defaultProps}
                    HeaderComponent={<div>List header</div>}
                    FooterComponent={<div>List footer</div>}
                />,
            );

            expect(screen.getByText('List header')).toBeInTheDocument();
            expect(screen.getByText('List footer')).toBeInTheDocument();
        });

        it('does not warn about the list Fragment container', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            render(<DraggableList {...defaultProps} className='custom-list' />);

            expect(warn).not.toHaveBeenCalledWith(
                expect.stringContaining('You cannot use className'),
            );
            warn.mockRestore();
        });
    });

    describe('loading state', () => {
        it('renders the default loading component, or a custom one', () => {
            const { unmount } = render(<DraggableList {...defaultProps} data={[]} loading />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.queryByText('No item to display')).not.toBeInTheDocument();
            unmount();

            render(
                <DraggableList
                    {...defaultProps}
                    data={[]}
                    loading
                    LoadingComponent={<div>Fetching</div>}
                />,
            );

            expect(screen.getByText('Fetching')).toBeInTheDocument();
        });
    });

    describe('empty state', () => {
        it('renders the default empty component, or a custom one', () => {
            const { unmount } = render(<DraggableList {...defaultProps} data={[]} />);

            expect(screen.getByText('No item to display')).toBeInTheDocument();
            unmount();

            render(
                <DraggableList
                    {...defaultProps}
                    data={[]}
                    EmptyComponent={<div>Nothing here</div>}
                />,
            );

            expect(screen.getByText('Nothing here')).toBeInTheDocument();
            expect(screen.queryByText('No item to display')).not.toBeInTheDocument();
        });
    });

    describe('reordering', () => {
        it('calls onChange once with the final order after a drop', () => {
            render(<DraggableList {...defaultProps} />);

            dragAndDrop(getWrapper(1), getWrapper(3));

            expect(onChange).toHaveBeenCalledOnce();
            expect(onChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [mockData[1], mockData[2], mockData[0]],
                item: mockData[0],
                from: 0,
                to: 2,
            });
        });

        it('sets the drag transfer data and effects', () => {
            render(<DraggableList {...defaultProps} />);

            const dataTransfer = dragAndDrop(getWrapper(1), getWrapper(2));

            expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', '');
            expect(dataTransfer.effectAllowed).toBe('move');
            expect(dataTransfer.dropEffect).toBe('move');
        });

        it('does not mutate the data prop', () => {
            render(<DraggableList {...defaultProps} />);

            dragAndDrop(getWrapper(3), getWrapper(1));

            expect(mockData.map((item) => item.id)).toEqual([1, 2, 3]);
        });

        it('does not call onChange when dropped at its original position', () => {
            render(<DraggableList {...defaultProps} />);

            dragAndDrop(getWrapper(2), getWrapper(2));

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not call onChange when the drag is cancelled before a drop', () => {
            render(<DraggableList {...defaultProps} />);

            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChange).not.toHaveBeenCalled();
        });

        it('previews the reordering while dragging and reverts it on cancel', () => {
            const { container } = render(<DraggableList {...defaultProps} />);

            const order = () =>
                Array.from(container.querySelectorAll('[data-testid^="item-"]')).map(
                    (node) => node.textContent,
                );

            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(3), { dataTransfer });

            expect(order()).toEqual(['Item 2', 'Item 3', 'Item 1']);
            expect(screen.getByTestId('item-1')).toHaveAttribute('data-dragging', 'true');

            fireEvent.dragEnd(source, { dataTransfer });

            expect(order()).toEqual(['Item 1', 'Item 2', 'Item 3']);
            expect(onChange).not.toHaveBeenCalled();
        });

        it('cancels an in-flight drag when the list becomes disabled', () => {
            const { container, rerender } = render(<DraggableList {...defaultProps} />);
            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(3), { dataTransfer });

            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);

            rerender(<DraggableList {...defaultProps} disabled />);

            expect(orderOf(container)).toEqual(['Item 1', 'Item 2', 'Item 3']);

            fireEvent.drop(getWrapper(3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not reorder when disabled', () => {
            render(<DraggableList {...defaultProps} disabled />);

            dragAndDrop(getWrapper(1), getWrapper(3));

            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('isDraggableExtractor', () => {
        // Item 2 is the excluded one, e.g. a section header.
        const isDraggableExtractor = (item: TestItem) => item.id !== 2;

        const renderExcluding = () =>
            render(<DraggableList {...defaultProps} isDraggableExtractor={isDraggableExtractor} />);

        it('marks only the excluded item wrapper as not draggable', () => {
            renderExcluding();

            expect(getWrapper(1)).toHaveAttribute('draggable', 'true');
            expect(getWrapper(2)).toHaveAttribute('draggable', 'false');
            expect(getWrapper(3)).toHaveAttribute('draggable', 'true');
        });

        it('does not begin a drag from an excluded item', () => {
            const { container } = renderExcluding();
            const dataTransfer = createDataTransfer();
            const source = getWrapper(2);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(3), { dataTransfer });

            expect(orderOf(container)).toEqual(['Item 1', 'Item 2', 'Item 3']);

            fireEvent.drop(getWrapper(3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not reorder the preview when dragging over an excluded item', () => {
            const { container } = renderExcluding();
            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(2), { dataTransfer });

            expect(orderOf(container)).toEqual(['Item 1', 'Item 2', 'Item 3']);

            fireEvent.dragOver(getWrapper(3), { dataTransfer });

            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);

            fireEvent.dragEnd(source, { dataTransfer });
        });

        it('commits the current preview order when dropped on an excluded item', () => {
            renderExcluding();
            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(3), { dataTransfer });
            fireEvent.dragOver(getWrapper(2), { dataTransfer });
            fireEvent.drop(getWrapper(2), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChange).toHaveBeenCalledOnce();
            expect(onChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [mockData[1], mockData[2], mockData[0]],
                item: mockData[0],
                from: 0,
                to: 2,
            });
        });

        it('passes isDraggable to renderItem', () => {
            render(
                <DraggableList
                    {...defaultProps}
                    isDraggableExtractor={isDraggableExtractor}
                    renderItem={({ item, isDraggable }) => (
                        <div data-testid={`item-${item.id}`} data-draggable={isDraggable}>
                            {item.name}
                        </div>
                    )}
                />,
            );

            expect(screen.getByTestId('item-1')).toHaveAttribute('data-draggable', 'true');
            expect(screen.getByTestId('item-2')).toHaveAttribute('data-draggable', 'false');
        });

        it('passes isDraggable false to renderItem when disabled', () => {
            render(
                <DraggableList
                    {...defaultProps}
                    disabled
                    renderItem={({ item, isDraggable }) => (
                        <div data-testid={`item-${item.id}`} data-draggable={isDraggable}>
                            {item.name}
                        </div>
                    )}
                />,
            );

            expect(screen.getByTestId('item-1')).toHaveAttribute('data-draggable', 'false');
        });
    });

    describe('pointer movement', () => {
        /*
         * fireEvent cannot express this: jsdom has no DragEvent, so the coordinates
         * are dropped and every event reads as a pointer of unknown position.
         */
        const dragOverAt = (
            target: HTMLElement,
            dataTransfer: ReturnType<typeof createDataTransfer>,
            screenX: number,
            screenY: number,
        ) => {
            const event = new Event('dragover', { bubbles: true, cancelable: true });
            Object.defineProperties(event, {
                dataTransfer: { value: dataTransfer },
                screenX: { value: screenX },
                screenY: { value: screenY },
            });
            act(() => {
                target.dispatchEvent(event);
            });
        };

        it('reorders as the pointer moves onto another item', () => {
            const { container } = render(<DraggableList {...defaultProps} />);
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(getWrapper(1), { dataTransfer });
            dragOverAt(getWrapper(3), dataTransfer, 10, 10);

            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);
        });

        it('ignores an item sliding under a pointer that has not moved', () => {
            const { container } = render(<DraggableList {...defaultProps} />);
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(getWrapper(1), { dataTransfer });
            dragOverAt(getWrapper(3), dataTransfer, 10, 10);
            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);

            // The reorder above put a different item under the same point, which the
            // browser reports as a dragover. Acting on it would move the drag to a
            // place the user never pointed at, and the reflow would do it again.
            dragOverAt(getWrapper(2), dataTransfer, 10, 10);

            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);
        });

        it('reorders again once the pointer really moves', () => {
            const { container } = render(<DraggableList {...defaultProps} />);
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(getWrapper(1), { dataTransfer });
            dragOverAt(getWrapper(3), dataTransfer, 10, 10);
            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);

            // Ignored: same point.
            dragOverAt(getWrapper(2), dataTransfer, 10, 10);
            expect(orderOf(container)).toEqual(['Item 2', 'Item 3', 'Item 1']);

            // Same item, but the pointer has now moved onto it for real.
            dragOverAt(getWrapper(2), dataTransfer, 10, 24);

            expect(orderOf(container)).toEqual(['Item 1', 'Item 2', 'Item 3']);
        });
    });

    describe('target midpoint', () => {
        /* jsdom lays nothing out, so the items are given boxes: a short one first
         * and a tall one after it, which is the shape that used to trade places. */
        const giveBoxes = (heights: Record<number, [number, number]>) => {
            Object.entries(heights).forEach(([id, [top, height]]) => {
                const el = getWrapper(Number(id));
                el.getBoundingClientRect = () =>
                    ({ top, left: 0, right: 200, bottom: top + height, width: 200, height }) as DOMRect;
            });
        };

        const dragOverAtPoint = (
            target: HTMLElement,
            dataTransfer: ReturnType<typeof createDataTransfer>,
            clientY: number,
            screenY: number,
        ) => {
            const event = new Event('dragover', { bubbles: true, cancelable: true });
            Object.defineProperties(event, {
                dataTransfer: { value: dataTransfer },
                clientX: { value: 100 },
                clientY: { value: clientY },
                screenX: { value: 100 },
                screenY: { value: screenY },
            });
            act(() => {
                target.dispatchEvent(event);
            });
        };

        it('moves an item forward only once the pointer is past the target centre', () => {
            const { container } = render(<DraggableList {...defaultProps} />);
            const dataTransfer = createDataTransfer();

            // Item 1 is short and first; Item 2 is tall and sits below it.
            giveBoxes({ 1: [0, 40], 2: [40, 300], 3: [340, 40] });

            fireEvent.dragStart(getWrapper(1), { dataTransfer });

            // Upper half of the tall item: not yet far enough to displace it.
            dragOverAtPoint(getWrapper(2), dataTransfer, 80, 10);
            expect(orderOf(container)).toEqual(['Item 1', 'Item 2', 'Item 3']);

            // Past its centre, so the move is what the pointer is actually asking for.
            dragOverAtPoint(getWrapper(2), dataTransfer, 300, 20);
            expect(orderOf(container)).toEqual(['Item 2', 'Item 1', 'Item 3']);
        });

        it('does not send the item straight back from the half it landed in', () => {
            const { container } = render(<DraggableList {...defaultProps} />);
            const dataTransfer = createDataTransfer();

            giveBoxes({ 1: [0, 40], 2: [40, 300], 3: [340, 40] });

            fireEvent.dragStart(getWrapper(1), { dataTransfer });
            dragOverAtPoint(getWrapper(2), dataTransfer, 300, 10);
            expect(orderOf(container)).toEqual(['Item 2', 'Item 1', 'Item 3']);

            // The reflow leaves the pointer over the tall item's lower half, which now
            // means "stay after it" rather than "go back in front of it".
            dragOverAtPoint(getWrapper(2), dataTransfer, 300, 20);
            expect(orderOf(container)).toEqual(['Item 2', 'Item 1', 'Item 3']);
        });
    });

    describe('dragHandle', () => {
        const withHandle = (props = {}) =>
            render(
                <DraggableList
                    {...defaultProps}
                    dragHandle
                    renderItem={({ item, dragHandleProps }) => (
                        <div data-testid={`item-${item.id}`}>
                            <span data-testid={`grip-${item.id}`} {...dragHandleProps} />
                            {item.name}
                        </div>
                    )}
                    {...props}
                />,
            );

        it('leaves items undraggable until their grip is pressed', () => {
            withHandle();

            expect(getWrapper(1)).not.toHaveAttribute('draggable', 'true');

            fireEvent.pointerDown(screen.getByTestId('grip-1'));

            expect(getWrapper(1)).toHaveAttribute('draggable', 'true');
        });

        it('arms only the item whose grip was pressed', () => {
            withHandle();

            fireEvent.pointerDown(screen.getByTestId('grip-2'));

            expect(getWrapper(2)).toHaveAttribute('draggable', 'true');
            expect(getWrapper(1)).not.toHaveAttribute('draggable', 'true');
        });

        it('disarms when the press ends without a drag', () => {
            withHandle();

            fireEvent.pointerDown(screen.getByTestId('grip-1'));
            fireEvent.pointerUp(window);

            expect(getWrapper(1)).not.toHaveAttribute('draggable', 'true');
        });

        it('still reorders when dragged by the grip', () => {
            withHandle();

            fireEvent.pointerDown(screen.getByTestId('grip-1'));
            dragAndDrop(getWrapper(1), getWrapper(3));

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'reorder',
                    data: [mockData[1], mockData[2], mockData[0]],
                }),
            );
        });

        it('keeps the whole item draggable when no handle is asked for', () => {
            render(<DraggableList {...defaultProps} />);

            expect(getWrapper(1)).toHaveAttribute('draggable', 'true');
        });
    });

    describe('sectionExtractor', () => {
        interface SectionItem extends TestItem {
            section: string;
            isHeader?: boolean;
        }

        const sectionData: SectionItem[] = [
            { id: 1, name: 'Citrus', section: 'citrus', isHeader: true },
            { id: 2, name: 'Orange', section: 'citrus' },
            { id: 3, name: 'Lemon', section: 'citrus' },
            { id: 4, name: 'Berries', section: 'berries', isHeader: true },
            { id: 5, name: 'Strawberry', section: 'berries' },
            { id: 6, name: 'Blueberry', section: 'berries' },
        ];

        const flatData = sectionData.filter((item) => !item.isHeader);

        const sectionExtractor = (item: SectionItem) => item.section;

        const renderSectioned = (data: SectionItem[], withHeaders = false) =>
            render(
                <DraggableList<SectionItem>
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <div data-testid={`item-${item.id}`}>{item.name}</div>
                    )}
                    sectionExtractor={sectionExtractor}
                    isDraggableExtractor={withHeaders ? (item) => !item.isHeader : undefined}
                    onChange={onChange}
                />,
            );

        it('reorders within a section and reports the move', () => {
            renderSectioned(flatData);

            dragAndDrop(getWrapper(2), getWrapper(3));

            expect(onChange).toHaveBeenCalledOnce();
            expect(onChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [flatData[1], flatData[0], flatData[2], flatData[3]],
                item: flatData[0],
                from: 0,
                to: 1,
            });
        });

        it('does not reorder while hovering an item of another section', () => {
            const { container } = renderSectioned(flatData);
            const dataTransfer = createDataTransfer();
            const source = getWrapper(2);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(5), { dataTransfer });

            expect(orderOf(container)).toEqual(['Orange', 'Lemon', 'Strawberry', 'Blueberry']);

            fireEvent.dragEnd(source, { dataTransfer });
        });

        it('commits the last legal in-section order when dropped on another section', () => {
            renderSectioned(flatData);
            const dataTransfer = createDataTransfer();
            const source = getWrapper(2);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(3), { dataTransfer });
            fireEvent.dragOver(getWrapper(6), { dataTransfer });
            fireEvent.drop(getWrapper(6), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChange).toHaveBeenCalledOnce();
            expect(onChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [flatData[1], flatData[0], flatData[2], flatData[3]],
                item: flatData[0],
                from: 0,
                to: 1,
            });
        });

        it('keeps items on their own side of a non-draggable header', () => {
            const { container } = renderSectioned(sectionData, true);
            const dataTransfer = createDataTransfer();
            const source = getWrapper(2);
            const initialOrder = [
                'Citrus',
                'Orange',
                'Lemon',
                'Berries',
                'Strawberry',
                'Blueberry',
            ];

            fireEvent.dragStart(source, { dataTransfer });

            // The header is inert, and the section past it is out of bounds.
            fireEvent.dragOver(getWrapper(4), { dataTransfer });
            expect(orderOf(container)).toEqual(initialOrder);

            fireEvent.dragOver(getWrapper(5), { dataTransfer });
            expect(orderOf(container)).toEqual(initialOrder);

            // Its own section still reorders.
            fireEvent.dragOver(getWrapper(3), { dataTransfer });
            expect(orderOf(container)).toEqual([
                'Citrus',
                'Lemon',
                'Orange',
                'Berries',
                'Strawberry',
                'Blueberry',
            ]);

            fireEvent.drop(getWrapper(3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChange).toHaveBeenCalledOnce();
            expect(onChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [
                    sectionData[0],
                    sectionData[2],
                    sectionData[1],
                    sectionData[3],
                    sectionData[4],
                    sectionData[5],
                ],
                item: sectionData[1],
                from: 1,
                to: 2,
            });
        });

        it('does not drag a header itself', () => {
            const { container } = renderSectioned(sectionData, true);
            const dataTransfer = createDataTransfer();
            const source = getWrapper(4);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(5), { dataTransfer });
            fireEvent.drop(getWrapper(5), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(orderOf(container)).toEqual([
                'Citrus',
                'Orange',
                'Lemon',
                'Berries',
                'Strawberry',
                'Blueberry',
            ]);
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('nested lists', () => {
        type GroupId = 'g1' | 'g2';

        interface Group {
            id: GroupId;
            label: string;
            items: TestItem[];
        }

        const groups: Group[] = [
            {
                id: 'g1',
                label: 'Group 1',
                items: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ],
            },
            {
                id: 'g2',
                label: 'Group 2',
                items: [
                    { id: 3, name: 'Item 3' },
                    { id: 4, name: 'Item 4' },
                ],
            },
        ];

        const onGroupChange = vi.fn();
        const onItemChange = {
            g1: vi.fn(),
            g2: vi.fn(),
        };

        beforeEach(() => {
            onGroupChange.mockClear();
            onItemChange.g1.mockClear();
            onItemChange.g2.mockClear();
        });

        const renderNested = () =>
            render(
                <DraggableList<Group>
                    data={groups}
                    keyExtractor={(group) => group.id}
                    renderItem={({ item: group }) => (
                        <div data-testid={`group-${group.id}`}>
                            {group.label}
                            <DraggableList<TestItem>
                                data={group.items}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <div data-testid={`item-${item.id}`}>{item.name}</div>
                                )}
                                onChange={onItemChange[group.id]}
                            />
                        </div>
                    )}
                    onChange={onGroupChange}
                />,
            );

        const getGroupWrapper = (id: string) =>
            screen.getByTestId(`group-${id}`).parentElement as HTMLElement;

        const groupOrder = (container: HTMLElement) =>
            Array.from(container.querySelectorAll('[data-testid^="group-"]')).map((node) =>
                node.getAttribute('data-testid'),
            );

        const itemOrder = (groupId: string) =>
            Array.from(
                screen.getByTestId(`group-${groupId}`).querySelectorAll('[data-testid^="item-"]'),
            ).map((node) => node.textContent);

        const expectNoItemChange = () => {
            expect(onItemChange.g1).not.toHaveBeenCalled();
            expect(onItemChange.g2).not.toHaveBeenCalled();
        };

        it('does not reorder the outer groups when dragging an inner item', () => {
            const { container } = renderNested();
            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getGroupWrapper('g2'), { dataTransfer });

            expect(groupOrder(container)).toEqual(['group-g1', 'group-g2']);

            fireEvent.drop(getGroupWrapper('g2'), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(groupOrder(container)).toEqual(['group-g1', 'group-g2']);
            expect(onGroupChange).not.toHaveBeenCalled();
        });

        it('reorders within the inner list and notifies only that list', () => {
            const { container } = renderNested();
            const dataTransfer = createDataTransfer();
            const source = getWrapper(1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getWrapper(2), { dataTransfer });

            expect(itemOrder('g1')).toEqual(['Item 2', 'Item 1']);
            expect(groupOrder(container)).toEqual(['group-g1', 'group-g2']);

            fireEvent.drop(getWrapper(2), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onItemChange.g1).toHaveBeenCalledOnce();
            expect(onItemChange.g1).toHaveBeenCalledWith({
                action: 'reorder',
                data: [groups[0].items[1], groups[0].items[0]],
                item: groups[0].items[0],
                from: 0,
                to: 1,
            });
            expect(onItemChange.g2).not.toHaveBeenCalled();
            expect(onGroupChange).not.toHaveBeenCalled();
        });

        it('reorders the outer groups when dragging a group', () => {
            const { container } = renderNested();
            const dataTransfer = createDataTransfer();
            const source = getGroupWrapper('g1');

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(getGroupWrapper('g2'), { dataTransfer });

            expect(groupOrder(container)).toEqual(['group-g2', 'group-g1']);

            fireEvent.drop(getGroupWrapper('g2'), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onGroupChange).toHaveBeenCalledOnce();
            expect(onGroupChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [groups[1], groups[0]],
                item: groups[0],
                from: 0,
                to: 1,
            });
            expectNoItemChange();
        });

        it('commits an outer group drop that lands on an inner item', () => {
            renderNested();

            dragAndDrop(getGroupWrapper('g1'), getWrapper(3));

            expect(onGroupChange).toHaveBeenCalledOnce();
            expect(onGroupChange).toHaveBeenCalledWith({
                action: 'reorder',
                data: [groups[1], groups[0]],
                item: groups[0],
                from: 0,
                to: 1,
            });
            expectNoItemChange();
        });

        it('does nothing when an inner item is dragged over another group', () => {
            const { container } = renderNested();

            dragAndDrop(getWrapper(1), getWrapper(3));

            expect(groupOrder(container)).toEqual(['group-g1', 'group-g2']);
            expect(itemOrder('g1')).toEqual(['Item 1', 'Item 2']);
            expect(itemOrder('g2')).toEqual(['Item 3', 'Item 4']);
            expect(onGroupChange).not.toHaveBeenCalled();
            expectNoItemChange();
        });
    });

    describe('cross-list moves', () => {
        const dataA: TestItem[] = [
            { id: 1, name: 'A1' },
            { id: 2, name: 'A2' },
        ];
        const dataB: TestItem[] = [
            { id: 3, name: 'B1' },
            { id: 4, name: 'B2' },
        ];

        const onChangeA = vi.fn();
        const onChangeB = vi.fn();

        const spies = [onChangeA, onChangeB];

        beforeEach(() => {
            spies.forEach((spy) => spy.mockClear());
        });

        interface PairOptions {
            dataB?: TestItem[];
            /** null renders list B without a group at all. */
            groupB?: string | null;
        }

        const renderPair = ({ dataB: bData = dataB, groupB = 'g' }: PairOptions = {}) => {
            const result = render(
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={({ item }) => (
                            <div data-testid={`item-${item.id}`}>{item.name}</div>
                        )}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={bData}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={({ item }) => (
                            <div data-testid={`item-${item.id}`}>{item.name}</div>
                        )}
                        group={groupB ?? undefined}
                        onChange={onChangeB}
                    />
                </>,
            );

            return {
                ...result,
                listA: result.container.querySelector('.list-a') as HTMLElement,
                listB: result.container.querySelector('.list-b') as HTMLElement,
            };
        };

        /** Scoped because the source keeps its item mounted while another list shows it. */
        const wrapperIn = (list: HTMLElement, id: number) =>
            within(list).getByTestId(`item-${id}`).parentElement as HTMLElement;

        const visibleOrderIn = (list: HTMLElement) =>
            Array.from(list.querySelectorAll<HTMLElement>('[data-testid^="item-"]'))
                .filter((node) => (node.parentElement as HTMLElement).style.display !== 'none')
                .map((node) => node.textContent);

        const expectNoSpyCalls = () => {
            spies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
        };

        /** fireEvent cannot express this: jsdom has no DragEvent, so it drops the coordinates. */
        const dragOverAt = (
            target: HTMLElement,
            dataTransfer: ReturnType<typeof createDataTransfer>,
            screenX: number,
            screenY: number,
        ) => {
            const event = new Event('dragover', { bubbles: true, cancelable: true });
            Object.defineProperties(event, {
                dataTransfer: { value: dataTransfer },
                screenX: { value: screenX },
                screenY: { value: screenY },
            });
            act(() => {
                target.dispatchEvent(event);
            });
        };

        it('moves an item into another list of the group', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A2']);

            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChangeA).toHaveBeenCalledOnce();
            expect(onChangeA).toHaveBeenCalledWith({
                action: 'remove',
                data: [dataA[1]],
                item: dataA[0],
                from: 0,
            });
            expect(onChangeB).toHaveBeenCalledOnce();
            expect(onChangeB).toHaveBeenCalledWith({
                action: 'add',
                data: [dataA[0], dataB[0], dataB[1]],
                item: dataA[0],
                from: 0,
                to: 0,
            });
            // Decided order: the source releases the item before the receiver takes it.
            expect(onChangeA.mock.invocationCallOrder[0]).toBeLessThan(
                onChangeB.mock.invocationCallOrder[0],
            );
        });

        it('appends to an empty receiving list dropped on its container', () => {
            const { listA, listB } = renderPair({ dataB: [] });
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1']);

            fireEvent.drop(listB, { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChangeA).toHaveBeenCalledWith({
                action: 'remove',
                data: [dataA[1]],
                item: dataA[0],
                from: 0,
            });
            expect(onChangeB).toHaveBeenCalledWith({
                action: 'add',
                data: [dataA[0]],
                item: dataA[0],
                from: 0,
                to: 0,
            });
        });

        it('appends when dropped on the container of a non-empty list', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2', 'A1']);

            fireEvent.drop(listB, { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChangeB).toHaveBeenCalledWith({
                action: 'add',
                data: [dataB[0], dataB[1], dataA[0]],
                item: dataA[0],
                from: 0,
                to: 2,
            });
        });

        it('reverts both lists when the drag is cancelled', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A1', 'A2']);
            expectNoSpyCalls();
        });

        it('releases the item when the drag leaves the receiving container', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            fireEvent.dragLeave(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A1', 'A2']);

            fireEvent.dragEnd(source, { dataTransfer });
            expectNoSpyCalls();
        });

        it('keeps hosting when the drag only moves between the receiver’s children', () => {
            const { listB, listA } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });
            // Entering the next child is reported before leaving the previous one.
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragLeave(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            fireEvent.dragEnd(source, { dataTransfer });
        });

        it('releases after an enter and leave that never hosted anything', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            // Crossing the container without ever hovering an item.
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragLeave(listB, { dataTransfer });

            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            fireEvent.dragLeave(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A1', 'A2']);

            fireEvent.dragEnd(source, { dataTransfer });
            expectNoSpyCalls();
        });

        it('reorders locally when the drag returns to its own list', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.dragOver(wrapperIn(listA, 2), { dataTransfer });

            expect(visibleOrderIn(listA)).toEqual(['A2', 'A1']);
            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);

            fireEvent.drop(wrapperIn(listA, 2), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChangeA).toHaveBeenCalledOnce();
            expect(onChangeA).toHaveBeenCalledWith({
                action: 'reorder',
                data: [dataA[1], dataA[0]],
                item: dataA[0],
                from: 0,
                to: 1,
            });
            expect(onChangeB).not.toHaveBeenCalled();
        });

        it('ignores a foreign drag on a list without a group', () => {
            const { listA, listB } = renderPair({ groupB: null });
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A1', 'A2']);

            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expectNoSpyCalls();
        });

        it('ignores a drag from a list of another group', () => {
            const { listA, listB } = renderPair({ groupB: 'other' });
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);

            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expectNoSpyCalls();
        });

        it('previews an arriving item with the receiving list’s own presentation', () => {
            const { container } = render(
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        classNameItem='item-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={({ item }) => (
                            <div data-testid={`item-${item.id}`} data-panel='A'>
                                {`A:${item.name}`}
                            </div>
                        )}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        classNameItem='item-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={({ item, isDragging }) => (
                            <div
                                data-testid={`item-${item.id}`}
                                data-panel='B'
                                data-dragging={isDragging}
                            >
                                {`B:${item.name}`}
                            </div>
                        )}
                        group='g'
                        onChange={onChangeB}
                    />
                </>,
            );
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(wrapperIn(listA, 1), { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            // A's item, drawn by B's renderItem and wrapped in B's classNameItem.
            const arrived = within(listB).getByTestId('item-1');
            expect(arrived).toHaveTextContent('B:A1');
            expect(arrived).toHaveAttribute('data-panel', 'B');
            expect(arrived).toHaveAttribute('data-dragging', 'true');
            expect(arrived.parentElement).toHaveClass('item-b');
            expect(arrived.parentElement).not.toHaveClass('item-a');
        });

        it('hides the item only while another list holds it', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            expect(source).toBeVisible();

            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });
            expect(source).not.toBeVisible();

            fireEvent.dragOver(wrapperIn(listA, 2), { dataTransfer });
            expect(source).toBeVisible();

            fireEvent.dragEnd(source, { dataTransfer });
            expect(source).toBeVisible();
        });

        it('does not re-render a list outside the group during a cross-list drag', () => {
            const renderOutsider = vi.fn(({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            ));
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );

            const { container } = render(
                <>
                    <DraggableList
                        data={[{ id: 9, name: 'Outsider' }]}
                        className='list-out'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderOutsider}
                        onChange={vi.fn()}
                    />
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeB}
                    />
                </>,
            );
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);
            const rendersBefore = renderOutsider.mock.calls.length;

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChangeB).toHaveBeenCalledOnce();
            expect(renderOutsider.mock.calls.length).toBe(rendersBefore);
        });

        it('unhides the source item when the receiving list unmounts', () => {
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );
            const Pair = ({ showB }: { showB: boolean }) => (
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeA}
                    />
                    {showB && (
                        <DraggableList
                            data={dataB}
                            className='list-b'
                            keyExtractor={(item: TestItem) => item.id}
                            renderItem={renderItem}
                            group='g'
                            onChange={onChangeB}
                        />
                    )}
                </>
            );

            const { container, rerender } = render(<Pair showB />);
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(source).not.toBeVisible();

            rerender(<Pair showB={false} />);

            expect(source).toBeVisible();

            fireEvent.dragEnd(source, { dataTransfer });
            expectNoSpyCalls();
        });

        it('does not add an item the source no longer holds by the time it is dropped', () => {
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );
            const Pair = ({ sourceData }: { sourceData: TestItem[] }) => (
                <>
                    <DraggableList
                        data={sourceData}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeB}
                    />
                </>
            );

            const { container, rerender } = render(<Pair sourceData={dataA} />);
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(wrapperIn(listA, 1), { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            // The source's data changed under the drag, so its item is already gone.
            rerender(<Pair sourceData={[dataA[1]]} />);

            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expectNoSpyCalls();
        });

        it('adds the item as the source last had it, not as it was picked up', () => {
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );
            const Pair = ({ sourceData }: { sourceData: TestItem[] }) => (
                <>
                    <DraggableList
                        data={sourceData}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeB}
                    />
                </>
            );

            const renamed: TestItem = { id: 1, name: 'A1 renamed' };
            const { container, rerender } = render(<Pair sourceData={dataA} />);
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(wrapperIn(listA, 1), { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            // The source edited the item while it was away.
            rerender(<Pair sourceData={[renamed, dataA[1]]} />);

            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });

            expect(onChangeA).toHaveBeenCalledWith({
                action: 'remove',
                data: [dataA[1]],
                item: renamed,
                from: 0,
            });
            expect(onChangeB).toHaveBeenCalledWith({
                action: 'add',
                data: [renamed, dataB[0], dataB[1]],
                item: renamed,
                from: 0,
                to: 0,
            });
        });

        it('cancels a cross-list drag when the source list becomes disabled', () => {
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );
            const Pair = ({ sourceDisabled }: { sourceDisabled: boolean }) => (
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        disabled={sourceDisabled}
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeB}
                    />
                </>
            );

            const { container, rerender } = render(<Pair sourceDisabled={false} />);
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(wrapperIn(listA, 1), { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            rerender(<Pair sourceDisabled />);

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A1', 'A2']);

            fireEvent.drop(wrapperIn(listB, 3), { dataTransfer });

            expectNoSpyCalls();
        });

        it('releases a hosted item when the receiving list becomes disabled', () => {
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );
            const Pair = ({ receiverDisabled }: { receiverDisabled: boolean }) => (
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        disabled={receiverDisabled}
                        onChange={onChangeB}
                    />
                </>
            );

            const { container, rerender } = render(<Pair receiverDisabled={false} />);
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);
            expect(source).not.toBeVisible();

            // Only the receiver is disabled: the drag itself is still in flight.
            rerender(<Pair receiverDisabled />);

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(source).toBeVisible();

            fireEvent.dragEnd(source, { dataTransfer });
            expectNoSpyCalls();
        });

        it('lets an inner list of the group host without the outer one stealing the item', () => {
            const onPanelChange = vi.fn();
            const { container } = render(
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={({ item }) => (
                            <div data-testid={`item-${item.id}`}>{item.name}</div>
                        )}
                        group='g'
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={[{ id: 7, name: 'Panel' }]}
                        className='list-outer'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={({ item }) => (
                            <div data-testid={`panel-${item.id}`}>
                                {item.name}
                                <DraggableList
                                    data={dataB}
                                    className='list-inner'
                                    keyExtractor={(card: TestItem) => card.id}
                                    renderItem={({ item: card }) => (
                                        <div data-testid={`item-${card.id}`}>{card.name}</div>
                                    )}
                                    group='g'
                                    onChange={onChangeB}
                                />
                            </div>
                        )}
                        group='g'
                        onChange={onPanelChange}
                    />
                </>,
            );

            const listA = container.querySelector('.list-a') as HTMLElement;
            const listInner = container.querySelector('.list-inner') as HTMLElement;
            const dataTransfer = createDataTransfer();

            fireEvent.dragStart(wrapperIn(listA, 1), { dataTransfer });
            fireEvent.dragEnter(listInner, { dataTransfer });
            fireEvent.dragOver(listInner, { dataTransfer });

            expect(visibleOrderIn(listInner)).toEqual(['B1', 'B2', 'A1']);
            // The outer list shares the group, but the inner one already took it.
            expect(screen.queryByTestId('panel-1')).not.toBeInTheDocument();
            expect(onPanelChange).not.toHaveBeenCalled();
        });

        it('reorders an inner list of the group without the outer one taking part', () => {
            const onPanelChange = vi.fn();
            const { container } = render(
                <DraggableList
                    data={[{ id: 7, name: 'Panel' }]}
                    className='list-outer'
                    keyExtractor={(item: TestItem) => item.id}
                    renderItem={({ item }) => (
                        <div data-testid={`panel-${item.id}`}>
                            {item.name}
                            <DraggableList
                                data={dataB}
                                className='list-inner'
                                keyExtractor={(card: TestItem) => card.id}
                                renderItem={({ item: card }) => (
                                    <div data-testid={`item-${card.id}`}>{card.name}</div>
                                )}
                                group='g'
                                onChange={onChangeB}
                            />
                        </div>
                    )}
                    group='g'
                    onChange={onPanelChange}
                />,
            );

            const listInner = container.querySelector('.list-inner') as HTMLElement;
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listInner, 3);

            fireEvent.dragStart(source, { dataTransfer });
            dragOverAt(wrapperIn(listInner, 4), dataTransfer, 20, 20);

            expect(visibleOrderIn(listInner)).toEqual(['B2', 'B1']);
            // The outer list shares the group, but this drag is not a visitor to it.
            expect(screen.queryByTestId('panel-3')).not.toBeInTheDocument();

            fireEvent.drop(wrapperIn(listInner, 4), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onChangeB).toHaveBeenCalledOnce();
            expect(onChangeB).toHaveBeenCalledWith({
                action: 'reorder',
                data: [dataB[1], dataB[0]],
                item: dataB[0],
                from: 0,
                to: 1,
            });
            expect(onPanelChange).not.toHaveBeenCalled();
        });

        it('starts each gesture with a fresh container enter count', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            // Entered without ever hosting, then cancelled without a matching leave.
            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            fireEvent.dragLeave(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expect(visibleOrderIn(listA)).toEqual(['A1', 'A2']);

            fireEvent.dragEnd(source, { dataTransfer });
            expectNoSpyCalls();
        });

        it('ends a group drag it started even after losing its group prop', () => {
            const renderItem = ({ item }: { item: TestItem }) => (
                <div data-testid={`item-${item.id}`}>{item.name}</div>
            );
            const Pair = ({ sourceGroup }: { sourceGroup?: string }) => (
                <>
                    <DraggableList
                        data={dataA}
                        className='list-a'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group={sourceGroup}
                        onChange={onChangeA}
                    />
                    <DraggableList
                        data={dataB}
                        className='list-b'
                        keyExtractor={(item: TestItem) => item.id}
                        renderItem={renderItem}
                        group='g'
                        onChange={onChangeB}
                    />
                </>
            );

            const { container, rerender } = render(<Pair sourceGroup='g' />);
            const listA = container.querySelector('.list-a') as HTMLElement;
            const listB = container.querySelector('.list-b') as HTMLElement;
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            rerender(<Pair />);
            fireEvent.dragEnd(source, { dataTransfer });

            fireEvent.dragOver(listB, { dataTransfer });

            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);
            expectNoSpyCalls();
        });

        it('samples the pointer afresh for each gesture', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            dragOverAt(wrapperIn(listB, 3), dataTransfer, 40, 40);

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            fireEvent.dragEnd(source, { dataTransfer });

            // The same point as the first gesture, which must not read as a still pointer.
            fireEvent.dragStart(source, { dataTransfer });
            dragOverAt(wrapperIn(listB, 3), dataTransfer, 40, 40);

            expect(visibleOrderIn(listB)).toEqual(['A1', 'B1', 'B2']);

            fireEvent.dragEnd(source, { dataTransfer });
        });

        it('unhides the source item when the drag returns to a target it already visited', () => {
            const { listA, listB } = renderPair();
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(listA, 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listA, 2), { dataTransfer });

            expect(visibleOrderIn(listA)).toEqual(['A2', 'A1']);

            fireEvent.dragEnter(listB, { dataTransfer });
            fireEvent.dragOver(wrapperIn(listB, 3), { dataTransfer });

            expect(source).not.toBeVisible();

            // The same source/target pair as the earlier hover, so a cached
            // dragover decision must not be reused across the trip to B.
            fireEvent.dragOver(wrapperIn(listA, 2), { dataTransfer });

            expect(source).toBeVisible();
            expect(visibleOrderIn(listB)).toEqual(['B1', 'B2']);

            fireEvent.dragEnd(source, { dataTransfer });
        });

        it('moves a card between the columns of a board without disturbing them', () => {
            type ColumnId = 'c1' | 'c2';
            const columns: { id: ColumnId; title: string; cards: TestItem[] }[] = [
                { id: 'c1', title: 'Todo', cards: dataA },
                { id: 'c2', title: 'Done', cards: dataB },
            ];
            const onColumnChange = vi.fn();
            const onCardChange = { c1: vi.fn(), c2: vi.fn() };

            const { container } = render(
                <DraggableList
                    data={columns}
                    keyExtractor={(column: (typeof columns)[number]) => column.id}
                    renderItem={({ item: column }) => (
                        <div data-testid={`column-${column.id}`}>
                            {column.title}
                            <DraggableList
                                data={column.cards}
                                className={`cards-${column.id}`}
                                keyExtractor={(card: TestItem) => card.id}
                                renderItem={({ item: card }) => (
                                    <div data-testid={`item-${card.id}`}>{card.name}</div>
                                )}
                                group='cards'
                                onChange={onCardChange[column.id]}
                            />
                        </div>
                    )}
                    onChange={onColumnChange}
                />,
            );

            const cardsOf = (id: string) => container.querySelector(`.cards-${id}`) as HTMLElement;
            const dataTransfer = createDataTransfer();
            const source = wrapperIn(cardsOf('c1'), 1);

            fireEvent.dragStart(source, { dataTransfer });
            fireEvent.dragEnter(cardsOf('c2'), { dataTransfer });
            fireEvent.dragOver(wrapperIn(cardsOf('c2'), 4), { dataTransfer });

            expect(visibleOrderIn(cardsOf('c2'))).toEqual(['B1', 'A1', 'B2']);
            expect(visibleOrderIn(cardsOf('c1'))).toEqual(['A2']);

            fireEvent.drop(wrapperIn(cardsOf('c2'), 4), { dataTransfer });
            fireEvent.dragEnd(source, { dataTransfer });

            expect(onCardChange.c1).toHaveBeenCalledOnce();
            expect(onCardChange.c1).toHaveBeenCalledWith({
                action: 'remove',
                data: [dataA[1]],
                item: dataA[0],
                from: 0,
            });
            expect(onCardChange.c2).toHaveBeenCalledOnce();
            expect(onCardChange.c2).toHaveBeenCalledWith({
                action: 'add',
                data: [dataB[0], dataA[0], dataB[1]],
                item: dataA[0],
                from: 0,
                to: 1,
            });
            expect(onCardChange.c1.mock.invocationCallOrder[0]).toBeLessThan(
                onCardChange.c2.mock.invocationCallOrder[0],
            );
            expect(onColumnChange).not.toHaveBeenCalled();
            expect(
                Array.from(container.querySelectorAll('[data-testid^="column-"]')).map((node) =>
                    node.getAttribute('data-testid'),
                ),
            ).toEqual(['column-c1', 'column-c2']);
        });
    });
});
