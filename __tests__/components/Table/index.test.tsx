import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Table, { type Column, type TableProps } from '../../../components/Table';
import styles from '../../../components/Table/styles.module.scss';

interface BasicItem {
    id: number;
    name: string;
    score: number;
}

interface MixedItem {
    id: number;
    name: string;
    verified: boolean;
    note: string | null;
    joined: Date;
    tags: string[];
    address: { city: string };
}

const basicColumns: Column[] = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Score', accessor: 'score' },
];

const basicData: BasicItem[] = [
    { id: 1, name: 'Alpha', score: 42 },
    { id: 2, name: 'Beta', score: 0 },
    { id: 3, name: 'Gamma', score: 7 },
];

const mixedData: MixedItem[] = [
    {
        id: 1,
        name: 'Alpha',
        verified: true,
        note: null,
        joined: new Date('2024-01-15T00:00:00.000Z'),
        tags: ['a', 'b'],
        address: { city: 'Kathmandu' },
    },
    {
        id: 2,
        name: 'Beta',
        verified: false,
        note: 'pending',
        joined: new Date('2023-06-01T00:00:00.000Z'),
        tags: [],
        address: { city: 'Pokhara' },
    },
];

const keyExtractor = (item: { id: number }) => item.id;

const renderTable = (props: Partial<TableProps<BasicItem>> = {}) =>
    render(
        <Table data={basicData} columns={basicColumns} keyExtractor={keyExtractor} {...props} />,
    );

describe('Table', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders column headers from the columns prop', () => {
            renderTable();

            expect(screen.getByText('Name')).toBeInTheDocument();
            expect(screen.getByText('Score')).toBeInTheDocument();
        });

        it('renders string and number values directly without a custom renderer', () => {
            renderTable();

            expect(screen.getByText('Alpha')).toBeInTheDocument();
            expect(screen.getByText('42')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('applies a custom className and style to the table element', () => {
            const { container } = renderTable({
                className: 'custom-table',
                style: { backgroundColor: 'red' },
            });

            expect(container.querySelector('table.custom-table')).toBeInTheDocument();
            expect(container.querySelector('table[style*="background-color"]')).toBeInTheDocument();
        });
    });

    describe('Mixed data types in cells', () => {
        it('renders booleans and null values as empty cells without crashing', () => {
            const columns: Column[] = [
                { Header: 'Verified', accessor: 'verified' },
                { Header: 'Note', accessor: 'note' },
            ];

            const { container } = render(
                <Table data={mixedData} columns={columns} keyExtractor={keyExtractor} />,
            );

            const rows = container.querySelectorAll('tbody tr');

            const alphaCells = (rows[0] as HTMLElement).querySelectorAll('td');
            expect(alphaCells[0].textContent).toBe('');
            expect(alphaCells[1].textContent).toBe('');
        });

        it('renders strings for the plain "note" value when present', () => {
            const columns: Column[] = [{ Header: 'Note', accessor: 'note' }];

            render(<Table data={mixedData} columns={columns} keyExtractor={keyExtractor} />);

            expect(screen.getByText('pending')).toBeInTheDocument();
        });

        it('formats booleans, dates, arrays and nested objects via renderDataItem', () => {
            const columns: Column[] = [
                { Header: 'Verified', accessor: 'verified' },
                { Header: 'Joined', accessor: 'joined' },
                { Header: 'Tags', accessor: 'tags' },
                { Header: 'City', accessor: 'address' },
            ];

            render(
                <Table
                    data={mixedData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={({ item, column }) => {
                        switch (column.accessor) {
                            case 'verified':
                                return item.verified ? 'Yes' : 'No';
                            case 'joined':
                                return item.joined.toISOString().slice(0, 10);
                            case 'tags':
                                return item.tags.join(', ') || '—';
                            case 'address':
                                return item.address.city;
                            default:
                                return null;
                        }
                    }}
                />,
            );

            expect(screen.getByText('Yes')).toBeInTheDocument();
            expect(screen.getByText('No')).toBeInTheDocument();
            expect(screen.getByText('2024-01-15')).toBeInTheDocument();
            expect(screen.getByText('a, b')).toBeInTheDocument();
            expect(screen.getByText('—')).toBeInTheDocument();
            expect(screen.getByText('Kathmandu')).toBeInTheDocument();
            expect(screen.getByText('Pokhara')).toBeInTheDocument();
        });
    });

    describe('Custom header rendering', () => {
        it('uses renderHeader to fully override the header', () => {
            renderTable({
                renderHeader: ({ columns }) => (
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.accessor}>Custom: {col.Header}</th>
                            ))}
                        </tr>
                    </thead>
                ),
            });

            expect(screen.getByText('Custom: Name')).toBeInTheDocument();
            expect(screen.getByText('Custom: Score')).toBeInTheDocument();
        });

        it('uses renderHeaderItem to override individual header cell content', () => {
            renderTable({
                renderHeaderItem: ({ column }) => `[${column.Header}]`,
            });

            expect(screen.getByText('[Name]')).toBeInTheDocument();
            expect(screen.getByText('[Score]')).toBeInTheDocument();
        });
    });

    describe('Pagination', () => {
        const paginatedData: BasicItem[] = Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
            score: i,
        }));

        it('shows only the first page of items by default (maxRows = 10)', () => {
            render(
                <Table data={paginatedData} columns={basicColumns} keyExtractor={keyExtractor} />,
            );

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 10')).toBeInTheDocument();
            expect(screen.queryByText('Item 11')).not.toBeInTheDocument();
        });

        it('shows the correct slice of items for a given page', () => {
            render(
                <Table
                    data={paginatedData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    page={2}
                    maxRows={10}
                />,
            );

            expect(screen.queryByText('Item 10')).not.toBeInTheDocument();
            expect(screen.getByText('Item 11')).toBeInTheDocument();
            expect(screen.getByText('Item 15')).toBeInTheDocument();
        });

        it('respects a custom maxRows value', () => {
            render(
                <Table
                    data={paginatedData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    maxRows={5}
                />,
            );

            expect(screen.getByText('Item 5')).toBeInTheDocument();
            expect(screen.queryByText('Item 6')).not.toBeInTheDocument();
        });

        it('ignores page/maxRows and renders all data when controlled', () => {
            render(
                <Table
                    data={paginatedData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    controlled
                    maxRows={5}
                />,
            );

            expect(screen.getByText('Item 1')).toBeInTheDocument();
            expect(screen.getByText('Item 15')).toBeInTheDocument();
        });
    });

    describe('Loading and empty states', () => {
        it('renders the default empty message when data is empty', () => {
            render(<Table data={[]} columns={basicColumns} keyExtractor={keyExtractor} />);

            expect(screen.getByText('No item to display')).toBeInTheDocument();
        });

        it('renders a custom EmptyComponent when data is empty', () => {
            render(
                <Table
                    data={[]}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    EmptyComponent={<div>Nothing here</div>}
                />,
            );

            expect(screen.getByText('Nothing here')).toBeInTheDocument();
        });

        it('renders the default loading message when loading with no data', () => {
            render(<Table data={[]} columns={basicColumns} keyExtractor={keyExtractor} loading />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('renders a custom LoadingComponent', () => {
            render(
                <Table
                    data={[]}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    loading
                    LoadingComponent={<div>Fetching…</div>}
                />,
            );

            expect(screen.getByText('Fetching…')).toBeInTheDocument();
        });
    });

    describe('Row interaction', () => {
        it('calls onRowClick with the clicked item', () => {
            const onRowClick = vi.fn();
            renderTable({ onRowClick });

            fireEvent.click(screen.getByText('Beta'));

            expect(onRowClick).toHaveBeenCalledTimes(1);
            expect(onRowClick).toHaveBeenCalledWith(basicData[1]);
        });
    });

    describe('rowSpacingHeight', () => {
        it('renders a spacer row after every data row when set', () => {
            const { container } = renderTable({ rowSpacingHeight: 8 });

            const spacers = container.querySelectorAll(`.${styles.rowSpacing}`);
            expect(spacers).toHaveLength(basicData.length);
        });

        it('does not render spacer rows when unset', () => {
            const { container } = renderTable();

            expect(container.querySelectorAll(`.${styles.rowSpacing}`)).toHaveLength(0);
        });
    });

    describe('Custom rowRenderer', () => {
        it('overrides the default row rendering entirely', () => {
            render(
                <Table
                    data={basicData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    rowRenderer={({ item }) => (
                        <tr data-testid={`custom-row-${item.id}`}>
                            <td>Custom: {item.name}</td>
                        </tr>
                    )}
                />,
            );

            expect(screen.getByTestId('custom-row-1')).toBeInTheDocument();
            expect(screen.getByText('Custom: Alpha')).toBeInTheDocument();
        });

        it('passes isSelected to the custom rowRenderer', () => {
            const rowRenderer = vi.fn(({ item }) => (
                <tr key={item.id}>
                    <td>{item.name}</td>
                </tr>
            ));
            render(
                <Table
                    data={basicData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    selectable
                    selectedItems={[basicData[0]]}
                    rowRenderer={rowRenderer}
                />,
            );

            expect(rowRenderer).toHaveBeenCalledWith(
                expect.objectContaining({ item: basicData[0], isSelected: true }),
            );
            expect(rowRenderer).toHaveBeenCalledWith(
                expect.objectContaining({ item: basicData[1], isSelected: false }),
            );
        });
    });

    describe('Selectable rows', () => {
        it('renders a header checkbox and a checkbox per row when selectable', () => {
            renderTable({ selectable: true });

            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(basicData.length + 1);
        });

        function SelectableHarness({
            initialSelected = [] as BasicItem[],
        }: {
            initialSelected?: BasicItem[];
        }) {
            const [selectedItems, setSelectedItems] = useState<BasicItem[]>(initialSelected);
            return (
                <Table
                    data={basicData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    selectable
                    selectedRowClassName="my-selected-row"
                    selectedItems={selectedItems}
                    onSelectedItemsChange={setSelectedItems}
                />
            );
        }

        it('toggles selection of a single row when its checkbox is clicked', () => {
            render(<SelectableHarness />);

            const alphaRow = screen.getByText('Alpha').closest('tr') as HTMLElement;
            const checkbox = within(alphaRow).getByRole('checkbox');

            fireEvent.click(checkbox);
            expect(checkbox).toBeChecked();
            expect(alphaRow).toHaveClass('my-selected-row');
            expect(alphaRow).toHaveClass(styles.rowSelected);

            fireEvent.click(checkbox);
            expect(checkbox).not.toBeChecked();
            expect(alphaRow).not.toHaveClass('my-selected-row');
        });

        it('selects and deselects all visible rows via the header checkbox', () => {
            render(<SelectableHarness />);

            const headerCheckbox = screen.getAllByRole('checkbox')[0];

            fireEvent.click(headerCheckbox);
            basicData.forEach((item) => {
                const row = screen.getByText(item.name).closest('tr') as HTMLElement;
                expect(within(row).getByRole('checkbox')).toBeChecked();
            });

            fireEvent.click(headerCheckbox);
            basicData.forEach((item) => {
                const row = screen.getByText(item.name).closest('tr') as HTMLElement;
                expect(within(row).getByRole('checkbox')).not.toBeChecked();
            });
        });

        it('marks the header checkbox indeterminate when only some rows are selected', () => {
            render(<SelectableHarness />);

            const alphaRow = screen.getByText('Alpha').closest('tr') as HTMLElement;
            fireEvent.click(within(alphaRow).getByRole('checkbox'));

            const headerCheckbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
            expect(headerCheckbox.indeterminate).toBe(true);
            expect(headerCheckbox.checked).toBe(false);
        });

        it('resets selection whenever page or maxRows changes', () => {
            const onSelectedItemsChange = vi.fn();
            const { rerender } = render(
                <Table
                    data={basicData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    selectable
                    page={1}
                    selectedItems={[basicData[0]]}
                    onSelectedItemsChange={onSelectedItemsChange}
                />,
            );
            onSelectedItemsChange.mockClear();

            rerender(
                <Table
                    data={basicData}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                    selectable
                    page={2}
                    selectedItems={[basicData[0]]}
                    onSelectedItemsChange={onSelectedItemsChange}
                />,
            );

            expect(onSelectedItemsChange).toHaveBeenCalledWith([]);
        });
    });

    describe('Edge cases', () => {
        it('renders without error when data is an empty array and selectable is true', () => {
            render(
                <Table data={[]} columns={basicColumns} keyExtractor={keyExtractor} selectable />,
            );

            expect(screen.getByText('No item to display')).toBeInTheDocument();
        });

        it('renders a single column table', () => {
            render(
                <Table
                    data={basicData}
                    columns={[{ Header: 'Name', accessor: 'name' }]}
                    keyExtractor={keyExtractor}
                />,
            );

            expect(screen.getAllByRole('row')).toHaveLength(basicData.length + 1);
        });

        it('updates rendered rows when data changes', () => {
            const { rerender } = renderTable();
            expect(screen.getByText('Alpha')).toBeInTheDocument();

            rerender(
                <Table
                    data={[{ id: 99, name: 'Omega', score: 1 }]}
                    columns={basicColumns}
                    keyExtractor={keyExtractor}
                />,
            );

            expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
            expect(screen.getByText('Omega')).toBeInTheDocument();
        });
    });
});
