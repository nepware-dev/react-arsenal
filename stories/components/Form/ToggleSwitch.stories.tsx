import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import ToggleSwitch from '@ra/components/Form/ToggleSwitch';

export const Story: StoryFn<typeof ToggleSwitch> = (storyArgs) => {
    return <ToggleSwitch onChange={action('changed')} {...storyArgs} />;
};

Story.storyName = 'Toggle Switch';

Story.args = {
    size: 32,
    disabled: false,
};

export default {
    title: 'Form/Toggle Switch',
    component: ToggleSwitch,
    argTypes: {
        size: {
            control: { type: 'number' },
        },
        disabled: {
            control: {},
        },
    },
} satisfies Meta<typeof ToggleSwitch>;
