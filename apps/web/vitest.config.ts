import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    exclude: ['**/*.spec.ts', '**/*.e2e.ts', '**/node_modules/**'], // Exclude Playwright E2E tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/*.config.*', '**/node_modules/**'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@btrme/ui': path.resolve(__dirname, '../../packages/ui'),
    },
  },
  esbuild: {
    // Skip tsconfig resolution to avoid errors
    tsconfigRaw: {
      compilerOptions: {
        jsx: 'react-jsx',
        target: 'esnext',
        module: 'esnext',
        moduleResolution: 'bundler',
        paths: {
          '@/*': ['./*'],
          '@btrme/ui': ['../../packages/ui'],
        },
      },
    },
  },
})
