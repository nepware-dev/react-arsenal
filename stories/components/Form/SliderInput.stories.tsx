import type { Meta, StoryFn } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import SliderInput from '@ra/components/Form/SliderInput';

export const Story: StoryFn<typeof SliderInput> = (storyArgs) => {
    return (
        <SliderInput
            onChange={action('changed')}
            containerStyle={{ width: '50%', height: 250 }}
            {...storyArgs}
        />
    );
};

Story.storyName = 'Slider Input';

Story.args = {
    disabled: false,
    axis: 'x',
    step: 0.1,
};

export default {
    title: 'Form/Slider Input',
    component: SliderInput,
    argTypes: {
        isRangeInput: {
            disabled: true,
        },
        disabled: {
            control: {},
        },
        step: {
            control: { type: 'number' },
        },
    },
} satisfies Meta<typeof SliderInput>;
