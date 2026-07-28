import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';

import Table, { type Column } from '../../../components/Table';

interface Item {
    id: number;
    name: string;
    score: number;
    department: { title: string };
}

const data: Item[] = [
    { id: 1, name: 'Gamma', score: 7, department: { title: 'Radiology' } },
    { id: 2, name: 'Alpha', score: 42, department: { title: 'Cardiology' } },
    { id: 3, name: 'Beta', score: 0, department: { title: 'Neurology' } },
];

const columns: Column<Item>[] = [
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Score', accessor: 'score' },
];

const keyExtractor = (item: Item) => item.id;

const renderedNames = () =>
    screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => row.querySelectorAll('td')[0].textContent);

const nameHeader = () => screen.getByRole('columnheader', { name: /Name/ });

describe('Table sorting', () => {
    it('renders a sort control only for sortable columns', () => {
        render(<Table data={data} columns={columns} keyExtractor={keyExtractor} />);

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getByRole('button', { name: /Name/ })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /Score/ })).not.toHaveAttribute('aria-sort');
    });

    it('leaves data in its original order until a column is sorted', () => {
        render(<Table data={data} columns={columns} keyExtractor={keyExtractor} />);

        expect(renderedNames()).toEqual(['Gamma', 'Alpha', 'Beta']);
        expect(nameHeader()).toHaveAttribute('aria-sort', 'none');
    });

    it('cycles ascending, descending and back to unsorted on repeated clicks', () => {
        render(<Table data={data} columns={columns} keyExtractor={keyExtractor} />);
        const sortButton = screen.getByRole('button', { name: /Name/ });

        fireEvent.click(sortButton);
        expect(renderedNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
        expect(nameHeader()).toHaveAttribute('aria-sort', 'ascending');

        fireEvent.click(sortButton);
        expect(renderedNames()).toEqual(['Gamma', 'Beta', 'Alpha']);
        expect(nameHeader()).toHaveAttribute('aria-sort', 'descending');

        fireEvent.click(sortButton);
        expect(renderedNames()).toEqual(['Gamma', 'Alpha', 'Beta']);
        expect(nameHeader()).toHaveAttribute('aria-sort', 'none');
    });

    it('sorts via the keyboard when the header control is focused', async () => {
        const user = userEvent.setup();
        render(<Table data={data} columns={columns} keyExtractor={keyExtractor} />);

        await user.tab();
        expect(screen.getByRole('button', { name: /Name/ })).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(renderedNames()).toEqual(['Alpha', 'Beta', 'Gamma']);

        await user.keyboard(' ');
        expect(renderedNames()).toEqual(['Gamma', 'Beta', 'Alpha']);
    });

    it('starts from defaultSort when sorting is uncontrolled', () => {
        render(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                defaultSort={{ accessor: 'name', direction: 'desc' }}
            />,
        );

        expect(renderedNames()).toEqual(['Gamma', 'Beta', 'Alpha']);
        expect(nameHeader()).toHaveAttribute('aria-sort', 'descending');
    });

    it('sorts by sortAccessor when the value is not reachable through the accessor', () => {
        const departmentColumns: Column<Item>[] = [
            {
                Header: 'Department',
                accessor: 'department.title',
                sortable: true,
                sortAccessor: (item) => item.department.title,
            },
        ];
        render(
            <Table
                data={data}
                columns={departmentColumns}
                keyExtractor={keyExtractor}
                defaultSort={{ accessor: 'department.title', direction: 'asc' }}
                renderDataItem={({ item }) => item.name}
            />,
        );

        expect(renderedNames()).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('sorts with a custom comparator when one is provided', () => {
        const scoreColumns: Column<Item>[] = [
            {
                Header: 'Name',
                accessor: 'name',
                sortable: true,
                sortComparator: (firstItem, secondItem) => firstItem.score - secondItem.score,
            },
        ];
        render(
            <Table
                data={data}
                columns={scoreColumns}
                keyExtractor={keyExtractor}
                defaultSort={{ accessor: 'name', direction: 'asc' }}
            />,
        );

        expect(renderedNames()).toEqual(['Beta', 'Gamma', 'Alpha']);
    });

    it('sorts the whole dataset before applying pagination', () => {
        render(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                maxRows={1}
                defaultSort={{ accessor: 'name', direction: 'asc' }}
            />,
        );

        expect(renderedNames()).toEqual(['Alpha']);
    });

    it('reports sort changes without reordering data when manualSort is set', () => {
        const handleSortChange = vi.fn();
        render(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                sort={null}
                manualSort
                onSortChange={handleSortChange}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Name/ }));

        expect(handleSortChange).toHaveBeenCalledWith({ accessor: 'name', direction: 'asc' });
        expect(renderedNames()).toEqual(['Gamma', 'Alpha', 'Beta']);
    });

    it('keeps the controlled sort state in charge of the indicator', () => {
        const { rerender } = render(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                sort={{ accessor: 'name', direction: 'desc' }}
                onSortChange={vi.fn()}
            />,
        );
        expect(nameHeader()).toHaveAttribute('aria-sort', 'descending');

        fireEvent.click(screen.getByRole('button', { name: /Name/ }));
        expect(nameHeader()).toHaveAttribute('aria-sort', 'descending');

        rerender(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                sort={null}
                onSortChange={vi.fn()}
            />,
        );
        expect(nameHeader()).toHaveAttribute('aria-sort', 'none');
    });

    it('never makes the selection column sortable', () => {
        render(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                selectable
                selectedItems={[]}
                onSelectedItemsChange={vi.fn()}
            />,
        );

        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.getAllByRole('columnheader')[0]).not.toHaveAttribute('aria-sort');
    });

    it('does not mutate the data prop', () => {
        const originalOrder = [...data];
        render(
            <Table
                data={data}
                columns={columns}
                keyExtractor={keyExtractor}
                defaultSort={{ accessor: 'name', direction: 'asc' }}
            />,
        );

        expect(data).toEqual(originalOrder);
    });
});
