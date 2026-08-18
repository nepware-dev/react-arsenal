import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import SelectInput from '@ra/components/Form/SelectInput';

export const Story: StoryFn<typeof SelectInput> = () => (
    <SelectInput
        keyExtractor={(item) => item?.id}
        valueExtractor={(item) => item?.value}
        onChange={action('selected')}
        searchable={false}
        options={[
            { id: 1, value: 'Option 1' },
            { id: 2, value: 'Option 2' },
            { id: 3, value: 'Option 3' },
            { id: 4, value: 'Option 4' },
            { id: 5, value: 'Option 5' },
        ]}
    />
);

Story.storyName = 'Select Input';

export default {
    title: 'Form/Select Input',
    component: SelectInput,
} satisfies Meta<typeof SelectInput>;
