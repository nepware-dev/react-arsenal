import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import TextInput from '@ra/components/Form/TextInput';

export const Story: StoryFn<typeof TextInput> = () => (
    <TextInput onChange={action('changed')} />
);

Story.storyName = 'Text Input';

export default {
    title: 'Form/Text Input',
    component: TextInput,
} satisfies Meta<typeof TextInput>;
