/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Standalone test harness for react-arsenal.
export default defineConfig({
    plugins: [react()],
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './__tests__/setup.ts',
        include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        exclude: ['**/node_modules/**', '**/dist/**'],
    },
});
