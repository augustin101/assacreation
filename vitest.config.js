import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Default environment is node.
    // Tests that need a DOM declare: // @vitest-environment jsdom
  },
});
