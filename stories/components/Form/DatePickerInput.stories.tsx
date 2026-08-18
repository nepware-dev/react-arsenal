import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import DatePickerInput from '@ra/components/Form/DatePickerInput';

export const Story: StoryFn<typeof DatePickerInput> = () => (
    <div style={{ maxWidth: 320 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Default (AD) mode: a Gregorian date picker. onChange emits an ISO
            value (yyyy-mm-dd).
        </p>
        <DatePickerInput name="adDate" onChange={action('changed')} />
    </div>
);

Story.storyName = 'Default (AD)';

export const NepaliStory: StoryFn<typeof DatePickerInput> = () => (
    <div style={{ maxWidth: 320 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Nepali (BS) mode: the user sees and enters Bikram Sambat, but
            onChange still emits the ISO (AD) value. Try language="ne" for
            Nepali script and digits.
        </p>
        <DatePickerInput
            name="bsDate"
            mode="nepali"
            language="ne"
            onChange={action('changed')}
        />
    </div>
);

NepaliStory.storyName = 'Nepali (BS)';

export const ToggleStory: StoryFn<typeof DatePickerInput> = () => (
    <div style={{ maxWidth: 320 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Toggle mode: an AD/BS switcher sits on the input row (always
            visible), so the user can flip the displayed calendar system without
            opening the picker. The emitted value stays ISO/AD regardless of
            display.
        </p>
        <DatePickerInput
            name="toggleDate"
            mode="toggle"
            language="ne"
            onChange={action('changed')}
        />
    </div>
);

ToggleStory.storyName = 'Toggle (AD/BS)';

export const BoundedStory: StoryFn<typeof DatePickerInput> = () => (
    <div style={{ maxWidth: 320 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Bounds are ISO too. Bounded between 2024-04-13 and 2024-07-15;
            out-of-range dates are disabled, and this works in AD or BS display.
        </p>
        <DatePickerInput
            name="boundedDate"
            mode="toggle"
            minimumDate="2024-04-13"
            maximumDate="2024-07-15"
            onChange={action('changed')}
        />
    </div>
);

BoundedStory.storyName = 'Bounded (ISO min/max)';

export const CalendarDropdownsStory: StoryFn<typeof DatePickerInput> = () => (
    <div style={{ maxWidth: 320 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Year and month quick-jump dropdowns forwarded through calendarProps.
        </p>
        <DatePickerInput
            name="dropdownDate"
            mode="toggle"
            calendarProps={{
                enableYearDropdown: true,
                enableMonthDropdown: true,
            }}
            onChange={action('changed')}
        />
    </div>
);

CalendarDropdownsStory.storyName = 'Forwarded calendar dropdowns';

export const DisabledStory: StoryFn<typeof DatePickerInput> = () => (
    <div style={{ maxWidth: 320 }}>
        <DatePickerInput
            name="disabledDate"
            disabled
            defaultValue="2024-04-13"
            onChange={action('changed')}
        />
    </div>
);

DisabledStory.storyName = 'Disabled';

export default {
    title: 'Form/Date Picker Input',
    component: DatePickerInput,
} satisfies Meta<typeof DatePickerInput>;
