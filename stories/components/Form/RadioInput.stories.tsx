import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import RadioInput from '@ra/components/Form/RadioInput';

export const Story: StoryFn<typeof RadioInput> = () => (
    <RadioInput onChange={action('changed')} />
);

Story.storyName = 'Radio Input';

export default {
    title: 'Form/Radio Input',
    component: RadioInput,
} satisfies Meta<typeof RadioInput>;
