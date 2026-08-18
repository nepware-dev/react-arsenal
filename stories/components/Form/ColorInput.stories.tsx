import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import ColorInput from '@ra/components/Form/ColorInput';

export const Story: StoryFn<typeof ColorInput> = () => (
    <ColorInput onChange={action('changed')} />
);

Story.storyName = 'Color Input';

export default {
    title: 'Form/Color Input',
    component: ColorInput,
} satisfies Meta<typeof ColorInput>;
