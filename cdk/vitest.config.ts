import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['lambda/__tests__/**/*.test.ts'],
  },
});
