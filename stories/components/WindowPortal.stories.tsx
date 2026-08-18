import type { Meta, StoryFn } from '@storybook/react-vite';

import Button from '@ra/components/Button';

export const Story: StoryFn<typeof Button> = () => (
    <Button>Open Window Portal</Button>
);

Story.storyName = 'WindowPortal';

export default {
    title: 'Components/WindowPortal',
    component: Button,
} satisfies Meta<typeof Button>;
