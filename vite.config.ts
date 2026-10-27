import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so the build works from any folder, e.g. GitHub Pages.
  base: './',
  build: {
    // Phaser alone is ~1.2 MB minified; that is expected for this project.
    chunkSizeWarningLimit: 1600,
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
