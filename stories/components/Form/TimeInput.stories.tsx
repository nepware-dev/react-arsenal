import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import TimeInput from '@ra/components/Form/TimeInput';

export const Story: StoryFn<typeof TimeInput> = () => (
    <TimeInput onChange={action('changed')} />
);

Story.storyName = 'Time Input';

export default {
    title: 'Form/Time Input',
    component: TimeInput,
} satisfies Meta<typeof TimeInput>;
