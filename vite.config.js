import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/index.js'),
      // Library name for UMD builds
      name: 'ComponentLibrary',
      // Output file name
      fileName: 'component-library',
      // Output formats - UMD for maximum compatibility
      formats: ['umd']
    },
    rollupOptions: {
      // No external dependencies - bundle everything
      external: [],
      output: {
        // Global variable name for UMD build
        globals: {}
      }
    },
    // Output directory
    outDir: 'dist',
    // Clear output directory before build
    emptyOutDir: true,
    // Generate source maps for debugging
    sourcemap: true
  },
  // Development server settings
  server: {
    port: 3000
  }
})

