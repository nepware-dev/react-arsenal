import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import SecureTextInput from '@ra/components/Form/SecureTextInput';

export const Story: StoryFn<typeof SecureTextInput> = () => (
    <SecureTextInput onChange={action('changed')} />
);

Story.storyName = 'SecureText Input';

export default {
    title: 'Form/SecureText Input',
    component: SecureTextInput,
} satisfies Meta<typeof SecureTextInput>;
