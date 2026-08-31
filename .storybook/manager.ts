import { addons } from 'storybook/manager-api';
import { STORY_RENDERED } from 'storybook/internal/core-events';

import theme from './theme';

addons.setConfig({
    theme,
});

addons.register('TitleAddon', (api) => {
    api.on(STORY_RENDERED, () => {
        const storyData = api.getCurrentStoryData();
        document.title = `${storyData.name}`;
    });
});
