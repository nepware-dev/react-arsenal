import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import TimePickerInput from '@ra/components/Form/TimePickerInput';

export const Story: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Default (list) mode: a stepped 12-hour time list. onChange emits
            "HH:MM" (24-hour).
        </p>
        <TimePickerInput name="time" onChange={action('changed')} />
    </div>
);

Story.storyName = 'Default (list)';

export const NativeStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Native mode uses the browser time input instead of the stepped
            list.
        </p>
        <TimePickerInput name="nativeTime" timeMode="native" onChange={action('changed')} />
    </div>
);

NativeStory.storyName = 'Native time mode';

export const TwentyFourHourStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            24-hour display, still emitting "HH:MM".
        </p>
        <TimePickerInput name="24hTime" is24HourFormat onChange={action('changed')} />
    </div>
);

TwentyFourHourStory.storyName = '24-hour format';

export const NepaliStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Nepali language mode: digits and labels render in Devanagari
            (always 24-hour), but onChange still emits "HH:MM".
        </p>
        <TimePickerInput name="npTime" language="ne" onChange={action('changed')} />
    </div>
);

NepaliStory.storyName = 'Nepali';

export const BoundedStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Bounded between 09:00 and 17:00; out-of-window options are greyed
            out and rejected.
        </p>
        <TimePickerInput
            name="boundedTime"
            minimumTime="09:00"
            maximumTime="17:00"
            onChange={action('changed')}
        />
    </div>
);

BoundedStory.storyName = 'Bounded (min/max)';

export const ExcludeTimesStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            Specific times are excluded from selection (12:00, 12:30, 13:00)
            and rendered as greyed-out, disabled options.
        </p>
        <TimePickerInput
            name="excludeTimes"
            excludeTimes={['12:00', '12:30', '13:00']}
            onChange={action('changed')}
        />
    </div>
);

ExcludeTimesStory.storyName = 'Exclude times';

export const SteppedStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <p style={{ marginTop: 0, fontSize: 13, color: '#666' }}>
            15-minute step list instead of the default 30 minutes.
        </p>
        <TimePickerInput name="steppedTime" timeStepMinutes={15} onChange={action('changed')} />
    </div>
);

SteppedStory.storyName = 'Custom step';

export const DisabledStory: StoryFn<typeof TimePickerInput> = () => (
    <div style={{ maxWidth: 260 }}>
        <TimePickerInput
            name="disabledTime"
            disabled
            defaultValue="14:30"
            onChange={action('changed')}
        />
    </div>
);

DisabledStory.storyName = 'Disabled';

export default {
    title: 'Form/Time Picker Input',
    component: TimePickerInput,
} satisfies Meta<typeof TimePickerInput>;
