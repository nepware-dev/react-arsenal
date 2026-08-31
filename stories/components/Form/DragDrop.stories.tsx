import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import DragDropFileInput from '@ra/components/Form/DragDropFileInput';

export const Story: StoryFn<typeof DragDropFileInput> = () => (
    <DragDropFileInput
        multiple
        maxFiles={2}
        name="drag-and-drop-input"
        accept="application/pdf"
        onChange={action('changed')}
    />
);

Story.storyName = 'DragDrop File';

export default {
    title: 'Form/DragDrop File',
    component: DragDropFileInput,
} satisfies Meta<typeof DragDropFileInput>;
