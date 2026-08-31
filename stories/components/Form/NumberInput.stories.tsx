import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import NumberInput from '@ra/components/Form/NumberInput';

export const Story: StoryFn<typeof NumberInput> = () => (
    <NumberInput onChange={action('changed')} />
);

Story.storyName = 'Number Input';

export default {
    title: 'Form/Number Input',
    component: NumberInput,
} satisfies Meta<typeof NumberInput>;
