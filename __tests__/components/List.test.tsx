import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import List, { KeyExtractor, ListProps, ListRenderItem } from '../../components/List';

interface TestItem {
    id: number;
    name: string;
    value: string;
}

const mockData: TestItem[] = [
    { id: 1, name: 'Item 1', value: 'Value 1' },
    { id: 2, name: 'Item 2', value: 'Value 2' },
    { id: 3, name: 'Item 3', value: 'Value 3' },
];

const defaultRenderItem: ListRenderItem<TestItem> = ({ item }) => (
    <div data-testid={`item-${item.id}`}>
        <span>{item.name}</span>
        <span>{item.value}</span>
    </div>
);

const defaultKeyExtractor: KeyExtractor<TestItem> = (item) => item.id;

const defaultProps: ListProps<TestItem> = {
    data: mockData,
    renderItem: defaultRenderItem,
    keyExtractor: defaultKeyExtractor,
};

describe('List', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render list items correctly', () => {
            render(<List {...defaultProps} />);

            expect(screen.getByTestId('item-1')).toBeInTheDocument();
            expect(screen.getByText('Item 2')).toBeInTheDocument();
            expect(screen.getByText('Value 3')).toBeInTheDocument();
        });

        it('should render all items from data array', () => {
            render(<List {...defaultProps} />);

            mockData.forEach((item) => {
                expect(screen.getByText(item.name)).toBeInTheDocument();
                expect(screen.getByText(item.value)).toBeInTheDocument();
            });
        });

        it('should apply custom className', () => {
            const { container } = render(
                <List {...defaultProps} className="custom-list" />,
            );

            const listElement = container.querySelector('.custom-list');
            expect(listElement).toBeInTheDocument();
        });

        it('should apply custom style', () => {
            const customStyle = { backgroundColor: 'red', padding: '20px' };
            const { container } = render(<List {...defaultProps} style={customStyle} />);

            const listElement = container.querySelector('[style*="background-color"]');
            expect(listElement).toBeInTheDocument();
        });

        it('should use custom component', () => {
            const { container } = render(<List {...defaultProps} component="ul" />);

            expect(container.querySelector('ul')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should render empty component when data is empty', () => {
            render(<List {...defaultProps} data={[]} />);

            expect(screen.getByText('No item to display')).toBeInTheDocument();
        });

        it('should render custom empty component', () => {
            const CustomEmpty = <div>Custom Empty State</div>;
            render(<List {...defaultProps} data={[]} EmptyComponent={CustomEmpty} />);

            expect(screen.getByText('Custom Empty State')).toBeInTheDocument();
            expect(screen.queryByText('No item to display')).not.toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should render loading component during initial load when data is empty', () => {
            render(<List {...defaultProps} data={[]} loading={true} />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should not render list items during initial empty load', () => {
            render(<List {...defaultProps} data={[]} loading={true} />);

            expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
            expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
        });

        it('should render a loading footer alongside items while paginating', () => {
            render(<List {...defaultProps} loading={true} onEndReached={vi.fn()} />);

            expect(screen.getByTestId('item-1')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should render custom loading component', () => {
            const CustomLoading = <div>Custom Loading...</div>;
            render(
                <List
                    {...defaultProps}
                    data={[]}
                    loading={true}
                    LoadingComponent={CustomLoading}
                />,
            );

            expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
    });

    describe('Header and Footer', () => {
        it('should render header component', () => {
            const Header = <div>List Header</div>;
            render(<List {...defaultProps} HeaderComponent={Header} />);

            expect(screen.getByText('List Header')).toBeInTheDocument();
        });

        it('should render footer component', () => {
            const Footer = <div>List Footer</div>;
            render(<List {...defaultProps} FooterComponent={Footer} />);

            expect(screen.getByText('List Footer')).toBeInTheDocument();
        });

        it('should render both header and footer', () => {
            const Header = <div>List Header</div>;
            const Footer = <div>List Footer</div>;
            render(
                <List
                    {...defaultProps}
                    HeaderComponent={Header}
                    FooterComponent={Footer}
                />,
            );

            expect(screen.getByText('List Header')).toBeInTheDocument();
            expect(screen.getByText('List Footer')).toBeInTheDocument();
        });
    });

    describe('Key Extractor', () => {
        it('should use keyExtractor to generate unique keys', () => {
            const keyExtractor = vi.fn((item: TestItem) => `key-${item.id}`);
            render(<List {...defaultProps} keyExtractor={keyExtractor} />);

            expect(keyExtractor).toHaveBeenCalledTimes(mockData.length);
            mockData.forEach((item, index) => {
                expect(keyExtractor).toHaveBeenCalledWith(item, index);
            });
        });
    });

    describe('Item Rendering', () => {
        it('should call renderItem for each item', () => {
            const renderItem = vi.fn(defaultRenderItem);
            render(<List {...defaultProps} renderItem={renderItem} />);

            expect(renderItem).toHaveBeenCalledTimes(mockData.length);
            mockData.forEach((item, index) => {
                expect(renderItem).toHaveBeenCalledWith(expect.objectContaining({ item, index }));
            });
        });

        it('should pass custom classNameItem to renderItem', () => {
            const renderItem = vi.fn(({ item, className }: any) => (
                <div className={className}>{item.name}</div>
            ));

            render(
                <List
                    {...defaultProps}
                    renderItem={renderItem}
                    classNameItem="custom-item"
                />,
            );

            expect(renderItem).toHaveBeenCalledWith(
                expect.objectContaining({ className: 'custom-item' }),
            );
        });
    });

    describe('Scroll and onEndReached', () => {
        it('should trigger onEndReached when scrolled near bottom', async () => {
            const onEndReached = vi.fn();
            const { container } = render(
                <List
                    {...defaultProps}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={100}
                    style={{ height: '200px', overflow: 'auto' }}
                />,
            );

            const listElement = container.querySelector('[style*="height"]');
            expect(listElement).toBeInTheDocument();

            Object.defineProperty(listElement, 'scrollHeight', { value: 1000, writable: true });
            Object.defineProperty(listElement, 'scrollTop', { value: 800, writable: true });
            Object.defineProperty(listElement, 'offsetHeight', { value: 200, writable: true });

            fireEvent.scroll(listElement!);

            await waitFor(
                () => {
                    expect(onEndReached).toHaveBeenCalled();
                },
                { timeout: 300 },
            );
        });

        it('should not trigger onEndReached when not scrolled enough', async () => {
            const onEndReached = vi.fn();
            const { container } = render(
                <List
                    {...defaultProps}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={100}
                    style={{ height: '200px', overflow: 'auto' }}
                />,
            );

            const listElement = container.querySelector('[style*="height"]');

            Object.defineProperty(listElement, 'scrollHeight', { value: 1000, writable: true });
            Object.defineProperty(listElement, 'scrollTop', { value: 100, writable: true });
            Object.defineProperty(listElement, 'offsetHeight', { value: 200, writable: true });

            fireEvent.scroll(listElement!);

            await new Promise((resolve) => setTimeout(resolve, 300));

            expect(onEndReached).not.toHaveBeenCalled();
        });

        it('should not trigger onEndReached when loading', async () => {
            const onEndReached = vi.fn();
            const { container } = render(
                <List
                    {...defaultProps}
                    onEndReached={onEndReached}
                    loading={true}
                    onEndReachedThreshold={100}
                    style={{ height: '200px', overflow: 'auto' }}
                />,
            );

            const listElement = container.querySelector('[style*="height"]');

            if (listElement) {
                Object.defineProperty(listElement, 'scrollHeight', { value: 1000, writable: true });
                Object.defineProperty(listElement, 'scrollTop', { value: 800, writable: true });
                Object.defineProperty(listElement, 'offsetHeight', { value: 200, writable: true });

                fireEvent.scroll(listElement);

                await new Promise((resolve) => setTimeout(resolve, 300));
            }

            expect(onEndReached).not.toHaveBeenCalled();
        });
    });

    describe('Container and Content', () => {
        it('should wrap content in container when contentContainerClassName is provided', () => {
            const { container } = render(
                <List {...defaultProps} contentContainerClassName="content-container" />,
            );

            expect(container.querySelector('.content-container')).toBeInTheDocument();
        });

        it('should not create extra wrapper when contentContainerClassName is not provided', () => {
            const { container } = render(<List {...defaultProps} />);

            expect(container.querySelector('.content-container')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle single item', () => {
            const singleItemData = [mockData[0]];
            render(<List {...defaultProps} data={singleItemData} />);

            expect(screen.getByTestId('item-1')).toBeInTheDocument();
            expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
        });

        it('should handle large dataset', () => {
            const largeData = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                value: `Value ${i}`,
            }));

            render(<List {...defaultProps} data={largeData} />);

            expect(screen.getByTestId('item-0')).toBeInTheDocument();
            expect(screen.getByTestId('item-50')).toBeInTheDocument();
            expect(screen.getByTestId('item-99')).toBeInTheDocument();
        });

        it('should update when data changes', () => {
            const { rerender } = render(<List {...defaultProps} />);

            expect(screen.getByTestId('item-1')).toBeInTheDocument();

            const newData = [{ id: 4, name: 'New Item', value: 'New Value' }];
            rerender(<List {...defaultProps} data={newData} />);

            expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
            expect(screen.getByTestId('item-4')).toBeInTheDocument();
            expect(screen.getByText('New Item')).toBeInTheDocument();
        });
    });
});
