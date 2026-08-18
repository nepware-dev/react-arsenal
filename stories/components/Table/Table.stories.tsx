import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import Table from '@ra/components/Table';
import type {
    Column,
    SortState,
    TableRenderDataItem,
} from '@ra/components/Table';
import HierarchicalTable, {
    Hierarchical,
} from '@ra/components/Table/Hierarchical';
import Pagination from '@ra/components/Pagination';
import SelectInput from '@ra/components/Form/SelectInput';

import styles from './styles.module.scss';

interface AnimalRow {
    name: string;
    place: string;
    animal: string;
    thing: string;
}

const columns: Column<AnimalRow>[] = [
    {
        Header: 'Name',
        accessor: 'name',
    },
    {
        Header: 'Place',
        accessor: 'place',
    },
    {
        Header: 'Animal',
        accessor: 'animal',
    },
    {
        Header: 'Thing',
        accessor: 'thing',
    },
];

const data: AnimalRow[] = [
    {
        name: 'Alice',
        place: 'Wonderland',
        animal: 'Cheshire Cat',
        thing: 'Magic',
    },
    { name: 'Bob', place: 'Builderland', animal: 'Dog', thing: 'Tools' },
    {
        name: 'Charlie',
        place: 'Chocolate Factory',
        animal: 'Oompa Loompa',
        thing: 'Chocolate',
    },
    {
        name: 'Dora',
        place: 'Explorerland',
        animal: 'Monkey',
        thing: 'Backpack',
    },
    { name: 'Eve', place: 'Eden', animal: 'Snake', thing: 'Apple' },
    { name: 'Frodo', place: 'Shire', animal: 'Hobbit', thing: 'Ring' },
    { name: 'Gandalf', place: 'Middle-earth', animal: 'Eagle', thing: 'Staff' },
    { name: 'Harry', place: 'Hogwarts', animal: 'Owl', thing: 'Wand' },
    { name: 'Indiana', place: 'Adventureland', animal: 'Snake', thing: 'Whip' },
    { name: 'Jack', place: 'Pirate Cove', animal: 'Parrot', thing: 'Compass' },
    {
        name: 'Katniss',
        place: 'District 12',
        animal: 'Mockingjay',
        thing: 'Bow',
    },
    { name: 'Legolas', place: 'Mirkwood', animal: 'Horse', thing: 'Bow' },
    { name: 'Mickey', place: 'Disneyland', animal: 'Mouse', thing: 'Ears' },
    {
        name: 'Nemo',
        place: 'Coral Reef',
        animal: 'Clownfish',
        thing: 'Sea Anemone',
    },
    {
        name: 'Olaf',
        place: 'Arendelle',
        animal: 'Snowman',
        thing: 'Carrot Nose',
    },
    { name: 'Peter', place: 'Neverland', animal: 'Fairy', thing: 'Pixie Dust' },
    {
        name: 'Quasimodo',
        place: 'Notre Dame',
        animal: 'Bell',
        thing: 'Hunchback',
    },
    { name: 'Rapunzel', place: 'Tower', animal: 'Chameleon', thing: 'Hair' },
    { name: 'Simba', place: 'Pride Rock', animal: 'Lion', thing: 'Crown' },
    { name: 'Tiana', place: 'New Orleans', animal: 'Frog', thing: 'Lily Pad' },
];

const nameExtractor = (item: AnimalRow) => item.name;

export const Story: StoryFn<{ selectable?: boolean }> = (storyArgs) => {
    const [page, setPage] = useState(1);
    const [maxRows, setMaxRows] = useState(10);
    const [selectedItems, setSelectedItems] = useState<AnimalRow[]>([]);

    const handleChangePage = useCallback(
        ({ currentPage }: { currentPage: number }) => {
            setPage(currentPage);
        },
        [],
    );

    const handleMaxRowsChange = useCallback(
        ({ option }: { option: number | null }) => {
            if (option) {
                setMaxRows(option);
                setPage(1);
            } else {
                setMaxRows(10);
            }
        },
        [],
    );

    const handleSelectedItemsChange = useCallback((items: AnimalRow[]) => {
        action('Selected Items')(items.map(nameExtractor));
        setSelectedItems(items);
    }, []);

    return (
        <div className={styles.container}>
            <Table
                className={styles.table}
                columns={columns}
                data={data}
                page={page}
                maxRows={maxRows}
                keyExtractor={nameExtractor}
                selectedItems={selectedItems}
                dataClassName={styles.tableData}
                headerItemClassName={styles.tableHeaderItem}
                onSelectedItemsChange={handleSelectedItemsChange}
                {...storyArgs}
            />
            <div className={styles.tableControls}>
                <div className={styles.rowsInfo}>
                    Show
                    <SelectInput
                        options={[10, 20, 50]}
                        keyExtractor={(item) => item}
                        valueExtractor={(item) => String(item)}
                        onChange={handleMaxRowsChange}
                        value={maxRows}
                        clearable={false}
                        searchable={false}
                    />
                    rows
                </div>
                <Pagination
                    pageLimit={maxRows}
                    pageNeighbours={1}
                    totalRecords={data.length}
                    onChange={handleChangePage}
                />
            </div>
        </div>
    );
};

Story.args = {
    selectable: false,
};

Story.argTypes = {
    selectable: {
        description: 'Whether rows are selectable',
        control: 'boolean',
        defaultValue: false,
    },
};

Story.storyName = 'Table';

interface Employee {
    id: string;
    name: string;
    score: number;
    department: { title: string };
    priority: string;
    priorityRank: number;
}

const employees: Employee[] = [
    {
        id: 'employee-1',
        name: 'Rajesh Shrestha',
        score: 82,
        department: { title: 'Engineering' },
        priority: 'Medium',
        priorityRank: 2,
    },
    {
        id: 'employee-2',
        name: 'anita gurung',
        score: 91,
        department: { title: 'Design' },
        priority: 'Low',
        priorityRank: 1,
    },
    {
        id: 'employee-3',
        name: 'Bibek Thapa',
        score: 7,
        department: { title: 'Operations' },
        priority: 'Critical',
        priorityRank: 4,
    },
    {
        id: 'employee-4',
        name: 'Chandra Adhikari',
        score: 64,
        department: { title: 'Engineering' },
        priority: 'High',
        priorityRank: 3,
    },
    {
        id: 'employee-5',
        name: 'Deepa Karki',
        score: 100,
        department: { title: 'Research' },
        priority: 'Low',
        priorityRank: 1,
    },
    {
        id: 'employee-6',
        name: 'Elina Maharjan',
        score: 45,
        department: { title: 'Design' },
        priority: 'Critical',
        priorityRank: 4,
    },
];

const idExtractor = (item: { id: string }) => item.id;

const sortableColumns: Column<Employee>[] = [
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Score', accessor: 'score', sortable: true },
    { Header: 'Priority', accessor: 'priority' },
];

const deepFieldColumns: Column<Employee>[] = [
    { Header: 'Name', accessor: 'name', sortable: true },
    {
        Header: 'Department',
        accessor: 'department.title',
        sortable: true,
        sortAccessor: (item) => item.department.title,
    },
    {
        Header: 'Priority',
        accessor: 'priority',
        sortable: true,
        sortComparator: (firstItem, secondItem) =>
            firstItem.priorityRank - secondItem.priorityRank,
    },
];

const renderDeepFieldDataItem = ({
    item,
    column,
}: {
    item: Employee;
    column: Column<Employee>;
}) => {
    if (column.accessor === 'department.title') {
        return item.department.title;
    }
    return item[column.accessor as keyof Employee] as ReactNode;
};

interface EmployeeTableProps {
    columns: Column<Employee>[];
    sort?: SortState | null;
    defaultSort?: SortState | null;
    manualSort?: boolean;
    onSortChange?: (sort: SortState | null) => void;
    renderDataItem?: typeof renderDeepFieldDataItem;
}

const EmployeeTable = (tableProps: EmployeeTableProps) => (
    <div className={styles.container}>
        <Table
            className={styles.table}
            data={employees}
            keyExtractor={idExtractor}
            dataClassName={styles.tableData}
            headerItemClassName={styles.tableHeaderItem}
            {...tableProps}
        />
    </div>
);

export const SortableColumnsStory = () => (
    <EmployeeTable
        columns={sortableColumns}
        onSortChange={action('sort changed')}
    />
);

SortableColumnsStory.storyName = 'Sortable Columns (Priority Left Unsorted)';

export const DefaultSortStory = () => (
    <EmployeeTable
        columns={sortableColumns}
        defaultSort={{ accessor: 'score', direction: 'desc' }}
        onSortChange={action('sort changed')}
    />
);

DefaultSortStory.storyName = 'Default Sort (Score Descending)';

export const ControlledSortStory = () => {
    const [sort, setSort] = useState<SortState | null>({
        accessor: 'name',
        direction: 'asc',
    });

    const handleSortChange = useCallback((nextSort: SortState | null) => {
        action('sort changed')(nextSort);
        setSort(nextSort);
    }, []);

    return (
        <div>
            <p className={styles.note}>
                The story owns the sort state:{' '}
                {sort ? `${sort.accessor} ${sort.direction}` : 'unsorted'}
            </p>
            <EmployeeTable
                columns={sortableColumns}
                sort={sort}
                onSortChange={handleSortChange}
            />
        </div>
    );
};

ControlledSortStory.storyName = 'Controlled Sort';

export const ManualSortStory = () => {
    const [sort, setSort] = useState<SortState | null>(null);

    const handleSortChange = useCallback((nextSort: SortState | null) => {
        action('sort requested')(nextSort);
        setSort(nextSort);
    }, []);

    return (
        <div>
            <p className={styles.note}>
                With manualSort the server owns the order, so rows keep their
                original position while the indicator and onSortChange still
                report the requested sort.
            </p>
            <EmployeeTable
                manualSort
                columns={sortableColumns}
                sort={sort}
                onSortChange={handleSortChange}
            />
        </div>
    );
};

ManualSortStory.storyName = 'Manual Sort (Indicator Only)';

export const CustomSortStory = () => (
    <EmployeeTable
        columns={deepFieldColumns}
        renderDataItem={renderDeepFieldDataItem}
        onSortChange={action('sort changed')}
    />
);

CustomSortStory.storyName = 'Custom sortAccessor and sortComparator';

interface OrgNode {
    id: string;
    name: string;
    score: number;
    level: number;
    children: OrgNode[];
}

const orgTree: OrgNode[] = [
    {
        id: 'eng',
        name: 'Engineering',
        score: 75,
        level: 0,
        children: [
            {
                id: 'eng-backend',
                name: 'Backend Team',
                score: 60,
                level: 1,
                children: [
                    {
                        id: 'eng-backend-zara',
                        name: 'Zara Sharma',
                        score: 88,
                        level: 2,
                        children: [],
                    },
                    {
                        id: 'eng-backend-amit',
                        name: 'Amit Rai',
                        score: 45,
                        level: 2,
                        children: [],
                    },
                ],
            },
            {
                id: 'eng-frontend',
                name: 'Frontend Team',
                score: 95,
                level: 1,
                children: [
                    {
                        id: 'eng-frontend-priya',
                        name: 'Priya Basnet',
                        score: 67,
                        level: 2,
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        id: 'design',
        name: 'Design',
        score: 90,
        level: 0,
        children: [
            {
                id: 'design-ux',
                name: 'UX Team',
                score: 80,
                level: 1,
                children: [
                    {
                        id: 'design-ux-nikhil',
                        name: 'Nikhil Gurung',
                        score: 70,
                        level: 2,
                        children: [],
                    },
                    {
                        id: 'design-ux-bikash',
                        name: 'Bikash Karki',
                        score: 40,
                        level: 2,
                        children: [],
                    },
                ],
            },
            {
                id: 'design-product',
                name: 'Product Team',
                score: 55,
                level: 1,
                children: [
                    {
                        id: 'design-product-sita',
                        name: 'Sita Poudel',
                        score: 99,
                        level: 2,
                        children: [],
                    },
                ],
            },
        ],
    },
];

const orgTreeColumns: Column<OrgNode>[] = [
    { Header: 'Name', accessor: 'name', sortable: true },
    { Header: 'Score', accessor: 'score', sortable: true },
];

const renderOrgTreeDataItem: TableRenderDataItem<Hierarchical<OrgNode>> = ({
    item,
    column,
}) => item[column.accessor as keyof OrgNode] as ReactNode;

export const HierarchicalSortStory = () => (
    <div className={styles.container}>
        <p className={styles.note}>
            Sorting is hierarchy-aware: clicking a header reorders siblings at
            every depth (the two departments, the teams within a department, the
            members within a team) while each node stays under its own parent.
        </p>
        <HierarchicalTable
            className={styles.table}
            columns={orgTreeColumns}
            data={orgTree}
            keyExtractor={idExtractor}
            hierarchyOptions={{ initialExpandedLevel: 2 }}
            renderDataItem={renderOrgTreeDataItem}
            dataClassName={styles.tableData}
            headerItemClassName={styles.tableHeaderItem}
            onSortChange={action('sort changed')}
        />
    </div>
);

HierarchicalSortStory.storyName =
    'Hierarchical Sort (Siblings Reordered Per Level)';

export default {
    title: 'Components/Table',
    component: Table,
} satisfies Meta<typeof Table>;
