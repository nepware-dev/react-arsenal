import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import CheckboxInput from '@ra/components/Form/CheckboxInput';

export const Story: StoryFn<typeof CheckboxInput> = () => (
    <CheckboxInput onChange={action('changed')} />
);

Story.storyName = 'CheckBox';

export default {
    title: 'Form/CheckBox',
    component: CheckboxInput,
} satisfies Meta<typeof CheckboxInput>;
