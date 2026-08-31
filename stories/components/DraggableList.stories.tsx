import { useCallback, useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import DraggableList from '@ra/components/DraggableList';
import type {
    DraggableListChangeMeta,
    DraggableListRenderItemProps,
} from '@ra/components/DraggableList';
import cs from '@ra/cs';

import styles from './styles.module.scss';

interface Fruit {
    id: string;
    name: string;
}

const fruits: Fruit[] = [
    { id: 'apple', name: 'Apple' },
    { id: 'banana', name: 'Banana' },
    { id: 'cherry', name: 'Cherry' },
    { id: 'dragonfruit', name: 'Dragonfruit' },
    { id: 'elderberry', name: 'Elderberry' },
];

const keyExtractor = (item: Fruit) => item.id;

/** 'remove' carries no destination, so `to` is only logged when there is one. */
const logChange = <T,>(label: string, name: string, meta: DraggableListChangeMeta<T>) => {
    action(label)({
        action: meta.action,
        item: name,
        from: meta.from,
        ...(meta.action === 'remove' ? {} : { to: meta.to }),
    });
};

const renderFruit = ({ item }: DraggableListRenderItemProps<Fruit>) => (
    <>
        <span className={styles.draggableListItemHandle}>⠿</span>
        {item.name}
    </>
);

interface FruitListProps {
    className?: string;
    disabled?: boolean;
}

const FruitList = ({ className, disabled }: FruitListProps) => {
    const [data, setData] = useState(fruits);

    const handleChange = useCallback((meta: DraggableListChangeMeta<Fruit>) => {
        logChange('changed', meta.item.name, meta);
        setData(meta.data);
    }, []);

    return (
        <DraggableList
            data={data}
            className={className ?? styles.draggableList}
            classNameItem={cs(styles.draggableListItem, {
                [styles.draggableListItemDisabled]: !!disabled,
            })}
            keyExtractor={keyExtractor}
            renderItem={renderFruit}
            disabled={disabled}
            onChange={handleChange}
        />
    );
};

export const Story: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            Drag a row onto another to reorder. The component is controlled, so
            the story owns the order and applies the new one from onChange,
            which fires once on drop.
        </p>
        <FruitList />
    </div>
);

Story.storyName = 'Draggable List';

export const GridStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            Layout is entirely the consumer&apos;s: the same list with a CSS
            grid container className reorders across rows and columns.
        </p>
        <FruitList className={styles.draggableListGrid} />
    </div>
);

GridStory.storyName = 'Grid Layout';

export const DisabledStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            With disabled, rows are not draggable and onChange never fires.
        </p>
        <FruitList disabled />
    </div>
);

DisabledStory.storyName = 'Disabled';

interface GroupedFruit extends Fruit {
    group: string;
    isHeader?: boolean;
}

const groupedFruits: GroupedFruit[] = [
    { id: 'citrus', name: 'Citrus', group: 'citrus', isHeader: true },
    { id: 'orange', name: 'Orange', group: 'citrus' },
    { id: 'lemon', name: 'Lemon', group: 'citrus' },
    { id: 'grapefruit', name: 'Grapefruit', group: 'citrus' },
    { id: 'berries', name: 'Berries', group: 'berries', isHeader: true },
    { id: 'strawberry', name: 'Strawberry', group: 'berries' },
    { id: 'blueberry', name: 'Blueberry', group: 'berries' },
    { id: 'raspberry', name: 'Raspberry', group: 'berries' },
];

const isFruitDraggable = (item: GroupedFruit) => !item.isHeader;

const fruitSection = (item: GroupedFruit) => item.group;

const renderGroupedFruit = ({ item, isDraggable }: DraggableListRenderItemProps<GroupedFruit>) => {
    if (!isDraggable) {
        return <span className={styles.draggableListSectionHeader}>{item.name}</span>;
    }

    return (
        <>
            <span className={styles.draggableListItemHandle}>⠿</span>
            {item.name}
        </>
    );
};

const GroupedFruitList = () => {
    const [data, setData] = useState(groupedFruits);

    const handleChange = useCallback((meta: DraggableListChangeMeta<GroupedFruit>) => {
        logChange('changed', meta.item.name, meta);
        setData(meta.data);
    }, []);

    return (
        <DraggableList
            data={data}
            className={styles.draggableList}
            classNameItem={styles.draggableListItem}
            keyExtractor={keyExtractor}
            renderItem={renderGroupedFruit}
            isDraggableExtractor={isFruitDraggable}
            sectionExtractor={fruitSection}
            onChange={handleChange}
        />
    );
};

export const SectionsStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            isDraggableExtractor keeps the headers fixed: they cannot be picked
            up and are inert to drag over, and renderItem gets isDraggable to
            style them. sectionExtractor confines a fruit to its own group, so
            dragging over the other group leaves the order untouched and a drop
            there commits the last order reached within the group.
        </p>
        <GroupedFruitList />
    </div>
);

SectionsStory.storyName = 'Sections';

interface FruitGroup {
    id: string;
    title: string;
    items: Fruit[];
}

const fruitGroups: FruitGroup[] = [
    {
        id: 'citrus',
        title: 'Citrus',
        items: [
            { id: 'orange', name: 'Orange' },
            { id: 'lemon', name: 'Lemon' },
            { id: 'grapefruit', name: 'Grapefruit' },
        ],
    },
    {
        id: 'berries',
        title: 'Berries',
        items: [
            { id: 'strawberry', name: 'Strawberry' },
            { id: 'blueberry', name: 'Blueberry' },
        ],
    },
    {
        id: 'melons',
        title: 'Melons',
        items: [
            { id: 'watermelon', name: 'Watermelon' },
            { id: 'cantaloupe', name: 'Cantaloupe' },
        ],
    },
];

const NestedFruitList = () => {
    const [groups, setGroups] = useState(fruitGroups);

    const handleGroupChange = useCallback((meta: DraggableListChangeMeta<FruitGroup>) => {
        logChange('group moved', meta.item.title, meta);
        setGroups(meta.data);
    }, []);

    const handleItemChange = useCallback(
        (groupId: string, meta: DraggableListChangeMeta<Fruit>) => {
            logChange('item moved', meta.item.name, meta);
            setGroups((currentGroups) =>
                currentGroups.map((group) =>
                    group.id === groupId ? { ...group, items: meta.data } : group,
                ),
            );
        },
        [],
    );

    const renderGroup = ({ item: group }: DraggableListRenderItemProps<FruitGroup>) => (
        <>
            <div className={styles.draggableListGroupTitle}>
                <span className={styles.draggableListItemHandle}>⠿</span>
                {group.title}
            </div>
            <DraggableList
                data={group.items}
                className={styles.draggableListGroupItems}
                classNameItem={styles.draggableListItem}
                keyExtractor={keyExtractor}
                renderItem={renderFruit}
                onChange={(meta) => handleItemChange(group.id, meta)}
            />
        </>
    );

    return (
        <DraggableList
            data={groups}
            className={styles.draggableListGroups}
            classNameItem={styles.draggableListGroup}
            keyExtractor={(group: FruitGroup) => group.id}
            renderItem={renderGroup}
            onChange={handleGroupChange}
        />
    );
};

export const NestedStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            A list of lists. Groups drag by their title bar, since the browser
            starts a drag from the innermost draggable element, and items drag
            within their own group only.
        </p>
        <NestedFruitList />
    </div>
);

NestedStory.storyName = 'Nested';

interface BoardColumn {
    id: string;
    title: string;
    items: Fruit[];
}

const boardColumns: BoardColumn[] = [
    {
        id: 'favourites',
        title: 'Favourites',
        items: [
            { id: 'mango', name: 'Mango' },
            { id: 'peach', name: 'Peach' },
        ],
    },
    {
        id: 'undecided',
        title: 'Undecided',
        items: [
            { id: 'papaya', name: 'Papaya' },
            { id: 'guava', name: 'Guava' },
            { id: 'lychee', name: 'Lychee' },
        ],
    },
    {
        id: 'never',
        title: 'Never Again',
        items: [{ id: 'durian', name: 'Durian' }],
    },
];

const FruitBoard = () => {
    const [columns, setColumns] = useState(boardColumns);

    // A cross-column drop reports a remove and an add in one event, so always
    // fold into the latest state, never the state this render captured.
    const handleCardChange = useCallback(
        (columnId: string, meta: DraggableListChangeMeta<Fruit>) => {
            logChange('card change', meta.item.name, meta);
            setColumns((currentColumns) =>
                currentColumns.map((column) =>
                    column.id === columnId ? { ...column, items: meta.data } : column,
                ),
            );
        },
        [],
    );

    const handleColumnChange = useCallback((meta: DraggableListChangeMeta<BoardColumn>) => {
        logChange('column moved', meta.item.title, meta);
        setColumns(meta.data);
    }, []);

    const renderColumn = ({ item: column }: DraggableListRenderItemProps<BoardColumn>) => (
        <>
            <div className={styles.draggableListGroupTitle}>
                <span className={styles.draggableListItemHandle}>⠿</span>
                {column.title}
            </div>
            <DraggableList
                data={column.items}
                className={styles.draggableListBoardCards}
                classNameItem={styles.draggableListItem}
                keyExtractor={keyExtractor}
                renderItem={renderFruit}
                group='fruits'
                // Reorders, arrivals and departures all land here, and every
                // one of them just hands this column its next items.
                onChange={(meta) => handleCardChange(column.id, meta)}
            />
        </>
    );

    return (
        <DraggableList
            data={columns}
            className={styles.draggableListBoard}
            classNameItem={styles.draggableListBoardColumn}
            keyExtractor={(column: BoardColumn) => column.id}
            renderItem={renderColumn}
            onChange={handleColumnChange}
        />
    );
};

export const BoardStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            The group prop lets lists trade items: every column shares
            group=&quot;fruits&quot;, so a fruit reorders within its column and
            crosses to another one. One onChange per column handles all of it,
            since meta.data is always that column&apos;s next items, whether
            the action is reorder, remove or add. Columns themselves drag by
            their title bar.
        </p>
        <FruitBoard />
    </div>
);

BoardStory.storyName = 'Board';

const manyFruits: Fruit[] = Array.from({ length: 50 }, (_, index) => ({
    id: `fruit-${index + 1}`,
    name: `Fruit ${index + 1}`,
}));

const ScrollingFruitList = () => {
    const [data, setData] = useState(manyFruits);

    const handleChange = useCallback((meta: DraggableListChangeMeta<Fruit>) => {
        logChange('changed', meta.item.name, meta);
        setData(meta.data);
    }, []);

    return (
        <div className={styles.draggableListScrollArea}>
            <DraggableList
                data={data}
                className={styles.draggableList}
                classNameItem={styles.draggableListItem}
                keyExtractor={keyExtractor}
                renderItem={renderFruit}
                autoScroll
                onChange={handleChange}
            />
        </div>
    );
};

export const AutoScrollStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            With autoScroll, dragging a row towards the top or bottom edge of the
            scrolling box scrolls it, faster the closer the pointer gets, and the
            page itself once the box has no further to go. It is opt-in because
            Chrome and Edge already scroll during a drag on their own.
        </p>
        <ScrollingFruitList />
    </div>
);

AutoScrollStory.storyName = 'Auto Scroll';

export const EmptyStory: StoryFn<typeof DraggableList> = () => (
    <div>
        <p className={styles.draggableListNote}>
            An empty list renders the default empty state; pass EmptyComponent
            to replace it.
        </p>
        <DraggableList
            data={[] as Fruit[]}
            className={styles.draggableListEmpty}
            keyExtractor={keyExtractor}
            renderItem={renderFruit}
            onChange={action('changed')}
        />
    </div>
);

EmptyStory.storyName = 'Empty';

export default {
    title: 'Components/Draggable List',
    component: DraggableList,
} satisfies Meta<typeof DraggableList>;
