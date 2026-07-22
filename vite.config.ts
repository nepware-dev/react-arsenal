import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { globSync } from 'tinyglobby';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

const root = dirname(fileURLToPath(import.meta.url));

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
                assetFileNames: 'assets/[name][extname]',
            },
        },
    },
});
