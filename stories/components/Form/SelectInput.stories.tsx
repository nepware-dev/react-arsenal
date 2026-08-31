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

const yearOptions = Array.from({ length: 140 }, (_, index) => ({
    id: 1901 + index,
    value: String(1901 + index),
}));
const selectedYear = yearOptions[120];

export const TopOfListOnOpenStory: StoryFn<typeof SelectInput> = () => (
    <div style={{ maxWidth: 240 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Default behavior: opening a long list (here, 140 years) always starts
            at the top, even when a value deep in the list is already selected.
        </p>
        <SelectInput
            keyExtractor={(item) => item?.id}
            valueExtractor={(item) => item?.value}
            value={selectedYear}
            onChange={action('selected')}
            options={yearOptions}
        />
    </div>
);

TopOfListOnOpenStory.storyName = 'Long list, opens at top (default)';

export const ScrollToSelectedOnOpenStory: StoryFn<typeof SelectInput> = () => (
    <div style={{ maxWidth: 240 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            With scrollToSelectedOnOpen, the same 140-option list opens already
            scrolled to the selected year instead of starting at 1901.
        </p>
        <SelectInput
            keyExtractor={(item) => item?.id}
            valueExtractor={(item) => item?.value}
            value={selectedYear}
            onChange={action('selected')}
            options={yearOptions}
            scrollToSelectedOnOpen
        />
    </div>
);

ScrollToSelectedOnOpenStory.storyName = 'Long list, opens at selected (scrollToSelectedOnOpen)';

export default {
    title: 'Form/Select Input',
    component: SelectInput,
} satisfies Meta<typeof SelectInput>;
