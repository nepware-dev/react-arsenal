import type { Meta, StoryFn } from '@storybook/react-vite';

import Dropdown from '@ra/components/Dropdown';

export const Story: StoryFn<typeof Dropdown> = () => (
    <Dropdown label="Dropdown label">
        <p>Open Window Portal</p>
    </Dropdown>
);

Story.storyName = 'Dropdown';

export default {
    title: 'Components/Dropdown',
    component: Dropdown,
} satisfies Meta<typeof Dropdown>;
