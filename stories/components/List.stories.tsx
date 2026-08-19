import { useRef } from 'react';
import type { Meta, StoryFn } from '@storybook/react-vite';

import List from '@ra/components/List';
import type { ListRefHandle } from '@ra/components/List';

import styles from './styles.module.scss';

interface Item {
    id: number;
    label: string;
}

const data: Item[] = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    label: `Item ${index + 1}`,
}));

export const Story: StoryFn<typeof List> = () => {
    const listRef = useRef<ListRefHandle<Item>>(null);

    return (
        <div>
            <List<Item>
                containerRef={listRef}
                className={styles.list}
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <div className={styles.listItem}>{item.label}</div>
                )}
            />
        </div>
    );
};

Story.storyName = 'List';

export default {
    title: 'Components/List',
    component: List,
} satisfies Meta<typeof List>;
