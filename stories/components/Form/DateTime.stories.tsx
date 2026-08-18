import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import DateTimeInput from '@ra/components/Form/DateTimeInput';

export const Story: StoryFn<typeof DateTimeInput> = () => (
    <DateTimeInput onChange={action('changed')} />
);

Story.storyName = 'DateTime Input';

export default {
    title: 'Form/DateTime Input',
    component: DateTimeInput,
} satisfies Meta<typeof DateTimeInput>;
