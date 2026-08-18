import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const config: StorybookConfig = {
    stories: [
        '../stories/**/*.mdx',
        '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-a11y',
        '@storybook/addon-docs',
    ],
    framework: '@storybook/react-vite',
    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },
    viteFinal: async (viteConfig) => {
        viteConfig.resolve ??= {};
        const raAlias = { find: '@ra', replacement: root };
        viteConfig.resolve.alias = Array.isArray(viteConfig.resolve.alias)
            ? [...viteConfig.resolve.alias, raAlias]
            : { ...viteConfig.resolve.alias, '@ra': root };
        return viteConfig;
    },
};
export default config;
