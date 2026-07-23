import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { globSync } from 'tinyglobby';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

const root = dirname(fileURLToPath(import.meta.url));

// Aggregate every per-component stylesheet into a single `dist/styles.css`.
const bundleStyles = (): Plugin => ({
    name: 'ra-bundle-styles',
    generateBundle(_options, bundle) {
        const css = Object.keys(bundle)
            .filter((fileName) => fileName.endsWith('.css'))
            .sort()
            .map((fileName) => {
                const asset = bundle[fileName];
                if (asset.type !== 'asset') return '';
                return typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source);
            })
            .join('\n');
        if (css) {
            this.emitFile({ type: 'asset', fileName: 'styles.css', source: css });
        }
    },
});

// Every public source file becomes its own entry so the built `dist/` mirrors
// the source tree and consumers keep importing by subpath
// (e.g. `@nepware/react-arsenal/components/Button`).
const entries = globSync(
    ['auth/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}', 'services/**/*.{ts,tsx}', 'utils/**/*.{ts,tsx}', 'cs.ts'],
    { cwd: root, ignore: ['**/*.d.ts', '**/*.{test,spec}.*'] },
).map((file) => resolve(root, file));

// Bare specifiers (react, react-dom, prop-types, react-icons, …) stay external
// so deps and peers are not bundled into the library.
const isExternal = (id: string) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith(root);

export default defineConfig({
    plugins: [
        react(),
        libInjectCss(),
        bundleStyles(),
        dts({
            tsconfigPath: 'tsconfig.build.json',
            include: ['auth', 'components', 'hooks', 'services', 'utils', 'cs.ts', 'scss.d.ts'],
            exclude: ['__tests__', '**/*.{test,spec}.*', 'vite.config.ts', 'vitest.config.ts'],
        }),
    ],
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: true,
        minify: false,
        sourcemap: true,
        target: 'es2020',
        modulePreload: false,
        lib: {
            entry: entries,
            formats: ['es'],
        },
        rollupOptions: {
            external: isExternal,
            output: {
                preserveModules: true,
                preserveModulesRoot: root,
                entryFileNames: '[name].js',
                // Drop `.module` so consumer bundlers do not re-scope pre-compiled styles.
                assetFileNames: (info) => {
                    const name = info.name ?? '';
                    if (name.endsWith('.css')) {
                        return `assets/${name.replace(/\.module\.css$/, '.css')}`;
                    }
                    return 'assets/[name][extname]';
                },
            },
        },
    },
});
