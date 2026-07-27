import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import HierarchicalTable, {
    type Column,
    type Hierarchical,
    type HierarchicalTableProps,
} from '../../../components/Table/Hierarchical';
import { buildHierarchy } from '../../../utils';

const getToggleIcon = (row: HTMLElement) => row.querySelector('svg');

interface OrgNode {
    id: number;
    title: string;
    count: number;
    active: boolean;
    tags: string[];
    info: { code: string } | null;
}

const columns: Column[] = [
    { Header: 'Title', accessor: 'title' },
    { Header: 'Count', accessor: 'count' },
    { Header: 'Active', accessor: 'active' },
    { Header: 'Tags', accessor: 'tags' },
    { Header: 'Info', accessor: 'info' },
];

const orgData: Hierarchical<OrgNode>[] = [
    {
        id: 1,
        title: 'Engineering',
        count: 42,
        active: true,
        tags: ['eng', 'core'],
        info: { code: 'ENG' },
        level: 0,
        children: [
            {
                id: 2,
                title: 'Frontend',
                count: 10,
                active: false,
                tags: [],
                info: null,
                level: 1,
                children: [],
            },
            {
                id: 3,
                title: 'Backend',
                count: 12,
                active: true,
                tags: ['api'],
                info: { code: 'BE' },
                level: 1,
                children: [
                    {
                        id: 4,
                        title: 'Platform',
                        count: 3,
                        active: true,
                        tags: [],
                        info: null,
                        level: 2,
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        id: 5,
        title: 'Sales',
        count: 8,
        active: false,
        tags: [],
        info: null,
        level: 0,
        children: [],
    },
];

const renderDataItem = ({ item, column }: { item: OrgNode; column: Column }) => {
    switch (column.accessor) {
        case 'count':
            return item.count;
        case 'active':
            return item.active ? 'Yes' : 'No';
        case 'tags':
            return item.tags.length ? item.tags.join(', ') : '—';
        case 'info':
            return item.info ? item.info.code : 'N/A';
        default:
            return item.title;
    }
};

const keyExtractor = (item: OrgNode) => item.id;

describe('HierarchicalTable', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Already hierarchical data (no hierarchyBuilder)', () => {
        it('renders root nodes and auto-expands level-0 nodes by default (initialExpandedLevel=1)', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                />,
            );

            expect(screen.getByText('Engineering')).toBeInTheDocument();
            expect(screen.getByText('Sales')).toBeInTheDocument();
            expect(screen.getByText('Frontend')).toBeInTheDocument();
            expect(screen.getByText('Backend')).toBeInTheDocument();
            expect(screen.queryByText('Platform')).not.toBeInTheDocument();
        });

        it('renders mixed value types correctly via renderDataItem', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                />,
            );

            const engineeringRow = screen.getByText('Engineering').closest('tr') as HTMLElement;
            const frontendRow = screen.getByText('Frontend').closest('tr') as HTMLElement;
            const backendRow = screen.getByText('Backend').closest('tr') as HTMLElement;
            const salesRow = screen.getByText('Sales').closest('tr') as HTMLElement;

            const cellsOf = (row: HTMLElement) => row.querySelectorAll('td');

            expect(cellsOf(engineeringRow)[1].textContent).toBe('42');
            expect(cellsOf(engineeringRow)[2].textContent).toBe('Yes');
            expect(cellsOf(frontendRow)[2].textContent).toBe('No');
            expect(cellsOf(engineeringRow)[3].textContent).toBe('eng, core');
            expect(cellsOf(frontendRow)[3].textContent).toBe('—');
            expect(cellsOf(backendRow)[4].textContent).toBe('BE');
            expect(cellsOf(frontendRow)[4].textContent).toBe('N/A');
            expect(cellsOf(salesRow)[1].textContent).toBe('8');
        });

        it('renders nothing per cell by default when no renderDataItem/rowRenderer is given (unlike the base Table, which falls back to the raw value)', () => {
            const { container } = render(
                <HierarchicalTable
                    data={orgData}
                    columns={[{ Header: 'Title', accessor: 'title' }]}
                    keyExtractor={keyExtractor}
                />,
            );

            expect(container.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
            expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
            expect(screen.queryByText('Sales')).not.toBeInTheDocument();
        });

        it('expands a node to reveal its children when its toggle icon is clicked', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                />,
            );

            expect(screen.queryByText('Platform')).not.toBeInTheDocument();

            const backendRow = screen.getByText('Backend').closest('tr') as HTMLElement;

            fireEvent.click(getToggleIcon(backendRow)!);

            expect(screen.getByText('Platform')).toBeInTheDocument();

            fireEvent.click(getToggleIcon(backendRow)!);
            expect(screen.queryByText('Platform')).not.toBeInTheDocument();
        });

        it('does not render a toggle icon for leaf nodes', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                />,
            );

            const salesRow = screen.getByText('Sales').closest('tr') as HTMLElement;
            const frontendRow = screen.getByText('Frontend').closest('tr') as HTMLElement;

            expect(getToggleIcon(salesRow)).toBeNull();
            expect(getToggleIcon(frontendRow)).toBeNull();
        });

        it('stops row-click propagation when the toggle icon is clicked', () => {
            const onRowClick = vi.fn();
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    onRowClick={onRowClick}
                />,
            );

            const engineeringRow = screen.getByText('Engineering').closest('tr') as HTMLElement;
            fireEvent.click(getToggleIcon(engineeringRow)!);

            expect(onRowClick).not.toHaveBeenCalled();
        });

        it('calls onRowClick with the item when a data cell (not the toggle) is clicked', () => {
            const onRowClick = vi.fn();
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    onRowClick={onRowClick}
                />,
            );

            fireEvent.click(screen.getByText('Sales'));

            expect(onRowClick).toHaveBeenCalledTimes(1);
            expect(onRowClick.mock.calls[0][0]).toMatchObject({ id: 5, title: 'Sales' });
        });

        it('respects a custom initialExpandedLevel of 0 (nothing pre-expanded)', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    hierarchyOptions={{ initialExpandedLevel: 0 }}
                />,
            );

            expect(screen.getByText('Engineering')).toBeInTheDocument();
            expect(screen.queryByText('Frontend')).not.toBeInTheDocument();
        });

        it('respects a custom initialExpandedLevel of 2 (grandchildren pre-expanded)', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    hierarchyOptions={{ initialExpandedLevel: 2 }}
                />,
            );

            expect(screen.getByText('Backend')).toBeInTheDocument();
            expect(screen.getByText('Platform')).toBeInTheDocument();
        });

        it('re-syncs expanded rows when initialExpandedLevel changes after mount', () => {
            const { rerender } = render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    hierarchyOptions={{ initialExpandedLevel: 1 }}
                />,
            );

            expect(screen.queryByText('Platform')).not.toBeInTheDocument();

            rerender(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    hierarchyOptions={{ initialExpandedLevel: 3 }}
                />,
            );

            expect(screen.getByText('Platform')).toBeInTheDocument();
        });

        it('preserves manual expand/collapse state when data changes but config stays the same', () => {
            const { rerender } = render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                />,
            );

            const backendRow = screen.getByText('Backend').closest('tr') as HTMLElement;
            fireEvent.click(getToggleIcon(backendRow)!);
            expect(screen.getByText('Platform')).toBeInTheDocument();

            const updatedData = orgData.map((node) =>
                node.id === 1 ? { ...node, title: 'Engineering (updated)' } : node,
            );
            rerender(
                <HierarchicalTable
                    data={updatedData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                />,
            );

            expect(screen.getByText('Engineering (updated)')).toBeInTheDocument();
            expect(screen.getByText('Platform')).toBeInTheDocument();
        });

        it('renders one spacer row per top-level item when rowSpacingHeight is set, regardless of expansion', () => {
            const { container } = render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    rowSpacingHeight={8}
                    hierarchyOptions={{ initialExpandedLevel: 0 }}
                />,
            );

            const spacingRows = Array.from(container.querySelectorAll('tr')).filter((tr) =>
                (tr as HTMLElement).getAttribute('style')?.includes('height'),
            );
            expect(spacingRows).toHaveLength(orgData.length);
        });

        describe('className propagation', () => {
            it('applies bodyRowChildClassName to non-root rows only', () => {
                render(
                    <HierarchicalTable
                        data={orgData}
                        columns={columns}
                        keyExtractor={keyExtractor}
                        renderDataItem={renderDataItem}
                        bodyRowChildClassName="is-child"
                    />,
                );

                const engineeringRow = screen.getByText('Engineering').closest('tr');
                const frontendRow = screen.getByText('Frontend').closest('tr');

                expect(engineeringRow).not.toHaveClass('is-child');
                expect(frontendRow).toHaveClass('is-child');
            });

            it('applies bodyRowParentClassName only to expanded rows with children', () => {
                render(
                    <HierarchicalTable
                        data={orgData}
                        columns={columns}
                        keyExtractor={keyExtractor}
                        renderDataItem={renderDataItem}
                        bodyRowParentClassName="is-parent"
                    />,
                );

                const engineeringRow = screen.getByText('Engineering').closest('tr');
                const salesRow = screen.getByText('Sales').closest('tr');
                const backendRow = screen.getByText('Backend').closest('tr');

                expect(engineeringRow).toHaveClass('is-parent');
                expect(salesRow).not.toHaveClass('is-parent');
                expect(backendRow).not.toHaveClass('is-parent');
            });

            it('marks only the final visible leaf of the tree with bodyRowLastChildClassName', () => {
                render(
                    <HierarchicalTable
                        data={orgData}
                        columns={columns}
                        keyExtractor={keyExtractor}
                        renderDataItem={renderDataItem}
                        bodyRowLastChildClassName="is-last"
                        hierarchyOptions={{ initialExpandedLevel: 3 }}
                    />,
                );

                const frontendRow = screen.getByText('Frontend').closest('tr');
                const platformRow = screen.getByText('Platform').closest('tr');
                const salesRow = screen.getByText('Sales').closest('tr');

                expect(frontendRow).not.toHaveClass('is-last');
                expect(platformRow).toHaveClass('is-last');
                expect(salesRow).toHaveClass('is-last');
            });

            it('moves bodyRowLastChildClassName from a collapsed parent to its child once expanded', () => {
                render(
                    <HierarchicalTable
                        data={orgData}
                        columns={columns}
                        keyExtractor={keyExtractor}
                        renderDataItem={renderDataItem}
                        bodyRowLastChildClassName="is-last"
                    />,
                );

                const backendRow = screen.getByText('Backend').closest('tr') as HTMLElement;
                expect(backendRow).toHaveClass('is-last');

                fireEvent.click(getToggleIcon(backendRow)!);

                const platformRow = screen.getByText('Platform').closest('tr');
                expect(backendRow).not.toHaveClass('is-last');
                expect(platformRow).toHaveClass('is-last');
            });
        });

        it('supports a custom rowRenderer that bypasses the default row', () => {
            render(
                <HierarchicalTable
                    data={orgData}
                    columns={columns}
                    keyExtractor={keyExtractor}
                    rowRenderer={({ item }) => (
                        <tr data-testid={`custom-${(item as OrgNode).id}`}>
                            <td>Node: {(item as OrgNode).title}</td>
                        </tr>
                    )}
                />,
            );

            expect(screen.getByTestId('custom-1')).toBeInTheDocument();
            expect(screen.getByText('Node: Engineering')).toBeInTheDocument();
        });

        it('supports custom levelKey/childrenKey names', () => {
            interface RenamedNode {
                id: number;
                title: string;
            }
            const renamedData: Hierarchical<RenamedNode, 'kids', 'depth'>[] = [
                {
                    id: 1,
                    title: 'Root',
                    depth: 0,
                    kids: [{ id: 2, title: 'Kid', depth: 1, kids: [] }],
                },
            ];

            render(
                <HierarchicalTable
                    data={renamedData}
                    columns={[{ Header: 'Title', accessor: 'title' }]}
                    keyExtractor={(item: RenamedNode) => item.id}
                    hierarchyOptions={{ levelKey: 'depth', childrenKey: 'kids' }}
                    renderDataItem={({ item }) => (item as unknown as RenamedNode).title}
                />,
            );

            expect(screen.getByText('Root')).toBeInTheDocument();
            expect(screen.getByText('Kid')).toBeInTheDocument();
        });
    });

    describe('Flat data converted via hierarchyBuilder', () => {
        interface FlatNode {
            id: number | string;
            parent: number | string | null;
            name: string;
        }

        const columns: Column[] = [{ Header: 'Name', accessor: 'name' }];
        const renderName = ({ item }: { item: FlatNode }) => item.name;

        it('builds and renders a multi-level tree from flat data', () => {
            const numericFlatData: FlatNode[] = [
                { id: 1, parent: null, name: 'Root 1' },
                { id: 2, parent: 1, name: 'Child 1.1' },
                { id: 3, parent: 1, name: 'Child 1.2' },
                { id: 4, parent: 2, name: 'Grandchild 1.1.1' },
                { id: 5, parent: null, name: 'Root 2' },
            ];

            render(
                <HierarchicalTable
                    data={numericFlatData}
                    columns={columns}
                    keyExtractor={(item: FlatNode) => item.id}
                    hierarchyOptions={{ hierarchyBuilder: buildHierarchy }}
                    renderDataItem={renderName}
                />,
            );

            expect(screen.getByText('Root 1')).toBeInTheDocument();
            expect(screen.getByText('Root 2')).toBeInTheDocument();
            expect(screen.getByText('Child 1.1')).toBeInTheDocument();
            expect(screen.getByText('Child 1.2')).toBeInTheDocument();
            expect(screen.queryByText('Grandchild 1.1.1')).not.toBeInTheDocument();

            const childRow = screen.getByText('Child 1.1').closest('tr') as HTMLElement;
            fireEvent.click(getToggleIcon(childRow)!);
            expect(screen.getByText('Grandchild 1.1.1')).toBeInTheDocument();
        });

        it('supports a custom parentKeyExtractor', () => {
            interface CustomParentNode {
                id: number;
                parentId: number | null;
                name: string;
            }
            const data: CustomParentNode[] = [
                { id: 1, parentId: null, name: 'Root' },
                { id: 2, parentId: 1, name: 'Child' },
            ];

            render(
                <HierarchicalTable
                    data={data}
                    columns={columns}
                    keyExtractor={(item: CustomParentNode) => item.id}
                    hierarchyOptions={{
                        hierarchyBuilder: buildHierarchy,
                        parentKeyExtractor: (item) =>
                            (item as unknown as CustomParentNode).parentId,
                    }}
                    renderDataItem={({ item }) => (item as unknown as CustomParentNode).name}
                />,
            );

            expect(screen.getByText('Root')).toBeInTheDocument();
            expect(screen.getByText('Child')).toBeInTheDocument();
        });

        it('documents current behavior: a falsy (0) numeric id/parent value breaks nesting', () => {
            // buildHierarchy checks truthiness of both the item key and the parent key.
            // An item keyed 0 is never inserted into its internal lookup map, so it is
            // silently dropped from the rendered tree entirely; a child whose parent id
            // is 0 is treated as having no parent (parentId is falsy) and is rendered as
            // its own top-level root instead of being nested.
            const zeroKeyedData: FlatNode[] = [
                { id: 0, parent: null, name: 'Root Zero' },
                { id: 1, parent: 0, name: 'Should-be child of Zero' },
            ];

            render(
                <HierarchicalTable
                    data={zeroKeyedData}
                    columns={columns}
                    keyExtractor={(item: FlatNode) => item.id}
                    hierarchyOptions={{ hierarchyBuilder: buildHierarchy }}
                    renderDataItem={renderName}
                />,
            );

            expect(screen.queryByText('Root Zero')).not.toBeInTheDocument();

            const otherRow = screen
                .getByText('Should-be child of Zero')
                .closest('tr') as HTMLElement;
            expect(getToggleIcon(otherRow)).toBeNull();
        });

        it('renders an empty table when the flat data array is empty', () => {
            render(
                <HierarchicalTable
                    data={[]}
                    columns={columns}
                    keyExtractor={(item: FlatNode) => item.id}
                    hierarchyOptions={{ hierarchyBuilder: buildHierarchy }}
                />,
            );

            expect(screen.getByText('No item to display')).toBeInTheDocument();
        });
    });

    describe('Sorting', () => {
        const sortableColumns: Column<Hierarchical<OrgNode>>[] = [
            { Header: 'Title', accessor: 'title', sortable: true },
            { Header: 'Count', accessor: 'count', sortable: true },
            { Header: 'Info', accessor: 'info' },
        ];

        const buildSortableData = (): Hierarchical<OrgNode>[] => [
            {
                id: 1,
                title: 'Engineering',
                count: 42,
                active: true,
                tags: ['eng'],
                info: { code: 'ENG' },
                level: 0,
                children: [
                    {
                        id: 2,
                        title: 'Frontend',
                        count: 10,
                        active: false,
                        tags: [],
                        info: null,
                        level: 1,
                        children: [],
                    },
                    {
                        id: 3,
                        title: 'Backend',
                        count: 12,
                        active: true,
                        tags: ['api'],
                        info: { code: 'BE' },
                        level: 1,
                        children: [
                            {
                                id: 4,
                                title: 'Platform',
                                count: 3,
                                active: true,
                                tags: [],
                                info: null,
                                level: 2,
                                children: [],
                            },
                            {
                                id: 5,
                                title: 'Database',
                                count: 9,
                                active: true,
                                tags: [],
                                info: null,
                                level: 2,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 6,
                title: 'Sales',
                count: 8,
                active: false,
                tags: [],
                info: null,
                level: 0,
                children: [],
            },
        ];

        const dataRows = () => screen.getAllByRole('row').slice(1);
        const renderedTitles = () =>
            dataRows().map((row) => row.querySelectorAll('td')[0].textContent);
        const renderedLevels = () =>
            dataRows().map((row) =>
                row.querySelectorAll('td')[0].style.getPropertyValue('--row-level'),
            );

        const renderSortableTable = (
            props: Partial<HierarchicalTableProps<OrgNode>> = {},
            sortableData: Hierarchical<OrgNode>[] = buildSortableData(),
        ) =>
            render(
                <HierarchicalTable
                    data={sortableData}
                    columns={sortableColumns}
                    keyExtractor={keyExtractor}
                    renderDataItem={renderDataItem}
                    hierarchyOptions={{ initialExpandedLevel: 2 }}
                    {...props}
                />,
            );

        it('leaves every level in its original order until a column is sorted', () => {
            renderSortableTable();

            expect(renderedTitles()).toEqual([
                'Engineering',
                'Frontend',
                'Backend',
                'Platform',
                'Database',
                'Sales',
            ]);
            expect(
                screen.getByRole('columnheader', { name: /Title/ }),
            ).toHaveAttribute('aria-sort', 'none');
        });

        it('sorts root nodes when a sortable header is clicked', () => {
            renderSortableTable({ hierarchyOptions: { initialExpandedLevel: 0 } });

            fireEvent.click(screen.getByRole('button', { name: /Count/ }));

            expect(renderedTitles()).toEqual(['Sales', 'Engineering']);
            expect(screen.getByRole('columnheader', { name: /Count/ })).toHaveAttribute(
                'aria-sort',
                'ascending',
            );
        });

        it('sorts siblings at every depth with the same sort state', () => {
            renderSortableTable();

            fireEvent.click(screen.getByRole('button', { name: /Title/ }));

            expect(renderedTitles()).toEqual([
                'Engineering',
                'Backend',
                'Database',
                'Platform',
                'Frontend',
                'Sales',
            ]);
        });

        it('reverses siblings at every depth on the descending step of the cycle', () => {
            renderSortableTable();
            const titleSortButton = screen.getByRole('button', { name: /Title/ });

            fireEvent.click(titleSortButton);
            fireEvent.click(titleSortButton);

            expect(renderedTitles()).toEqual([
                'Sales',
                'Engineering',
                'Frontend',
                'Backend',
                'Platform',
                'Database',
            ]);

            fireEvent.click(titleSortButton);
            expect(renderedTitles()).toEqual([
                'Engineering',
                'Frontend',
                'Backend',
                'Platform',
                'Database',
                'Sales',
            ]);
        });

        it('keeps children nested under their own parent when sorting', () => {
            renderSortableTable();

            fireEvent.click(screen.getByRole('button', { name: /Title/ }));

            expect(renderedLevels()).toEqual(['0rem', '1rem', '2rem', '2rem', '1rem', '0rem']);

            const backendRow = screen.getByText('Backend').closest('tr') as HTMLElement;
            fireEvent.click(getToggleIcon(backendRow)!);
            expect(screen.queryByText('Database')).not.toBeInTheDocument();
            expect(screen.queryByText('Platform')).not.toBeInTheDocument();
            expect(renderedTitles()).toEqual([
                'Engineering',
                'Backend',
                'Frontend',
                'Sales',
            ]);
        });

        it('ignores sort state pointing at a column that is not sortable', () => {
            renderSortableTable({ defaultSort: { accessor: 'info', direction: 'asc' } });

            expect(screen.getAllByRole('button')).toHaveLength(2);
            expect(screen.getByRole('columnheader', { name: /Info/ })).not.toHaveAttribute(
                'aria-sort',
            );
            expect(renderedTitles()).toEqual([
                'Engineering',
                'Frontend',
                'Backend',
                'Platform',
                'Database',
                'Sales',
            ]);
        });

        it('orders every level from defaultSort on the first render', () => {
            renderSortableTable({ defaultSort: { accessor: 'count', direction: 'desc' } });

            expect(renderedTitles()).toEqual([
                'Engineering',
                'Backend',
                'Database',
                'Platform',
                'Frontend',
                'Sales',
            ]);
        });

        it('honours a custom sortAccessor at every depth', () => {
            renderSortableTable({
                columns: [
                    {
                        Header: 'Info',
                        accessor: 'info.code',
                        sortable: true,
                        sortAccessor: (item) => item.info?.code ?? null,
                    },
                ],
                defaultSort: { accessor: 'info.code', direction: 'asc' },
            });

            expect(renderedTitles()).toEqual([
                'Engineering',
                'Backend',
                'Platform',
                'Database',
                'Frontend',
                'Sales',
            ]);
        });

        it('reports sort changes and leaves data untouched when manualSort is set', () => {
            const handleSortChange = vi.fn();
            renderSortableTable({ manualSort: true, onSortChange: handleSortChange });

            fireEvent.click(screen.getByRole('button', { name: /Title/ }));

            expect(handleSortChange).toHaveBeenCalledWith({
                accessor: 'title',
                direction: 'asc',
            });
            expect(renderedTitles()).toEqual([
                'Engineering',
                'Frontend',
                'Backend',
                'Platform',
                'Database',
                'Sales',
            ]);
        });

        it('does not mutate the data it was given', () => {
            const sortableData = buildSortableData();
            const originalData = JSON.stringify(sortableData);

            renderSortableTable({}, sortableData);
            const titleSortButton = screen.getByRole('button', { name: /Title/ });
            fireEvent.click(titleSortButton);
            fireEvent.click(titleSortButton);

            expect(JSON.stringify(sortableData)).toBe(originalData);
        });
    });
});
