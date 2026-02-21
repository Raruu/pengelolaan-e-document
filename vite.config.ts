import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Only the two root providers — loaded at startup, must stay small
                    if (
                        id.includes('@heroui/system') ||
                        id.includes('@heroui/toast')
                    ) {
                        return 'vendor-heroui-core';
                    }
                    if (
                        id.includes('@heroui/theme') ||
                        id.includes('@heroui/react-utils') ||
                        id.includes('@heroui/shared-utils')
                    ) {
                        return 'vendor-heroui-utils';
                    }
                },
            },
        },
    },
});
