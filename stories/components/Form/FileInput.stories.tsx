import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import FileInput from '@ra/components/Form/FileInput';

export const Story: StoryFn<typeof FileInput> = () => (
    <FileInput name="file" onChange={action('changed')} />
);

Story.storyName = 'File Input';

export default {
    title: 'Form/File Input',
    component: FileInput,
} satisfies Meta<typeof FileInput>;
