import type { Preview } from '@storybook/react-vite';

import '../styles/_base.scss';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
            expanded: true,
        },

        a11y: {
            test: 'todo',
        },
    },
    tags: ['autodocs'],
};

export default preview;
