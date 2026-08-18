import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import DateInput from '@ra/components/Form/DateInput';

export const Story: StoryFn<typeof DateInput> = () => (
    <DateInput onChange={action('changed')} />
);

Story.storyName = 'Date Input';

export default {
    title: 'Form/Date Input',
    component: DateInput,
} satisfies Meta<typeof DateInput>;
