import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tests': fileURLToPath(new URL('/tests', import.meta.url)),
      'boot': fileURLToPath(new URL('./src/boot', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@orders': fileURLToPath(new URL('./src/modules/orders', import.meta.url)),
      '@auth': fileURLToPath(new URL('./src/modules/auth', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'cobertura'], 
      reportsDirectory: './coverage',
      include: ['src/modules/orders/**', 'src/modules/auth/**'],
      exclude: [
        'postcss.config.js',
        'quasar.config.js',
        'vite.config.js',
        'eslint.config.js',
        '**/*.mjs',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/tests/**',
        '**/boot/**',
        '**/router/**',
        '**/layouts/**',
        '**/pages/**',
        '**/main.js',
        '**/App.vue',
        '**/src/components/**' 
      ]
    }
  }
})
