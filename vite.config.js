import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => {
  return {
    // Root directory (current directory)
    root: '.',

    // ES Module bundling with proper chunking
    build: {
      bundlerOptions: {
        input: {
          main: 'src/main.js'  // Use our new entry point
        },
        output: {
          // Proper chunking for ES modules
          manualChunks: (id) => {
            // Core chunk - foundation modules
            if (id.includes('assets/js/core/') ||
                id.includes('assets/js/shared/foundation.js') ||
                id.includes('assets/js/shared/layout.js') ||
                id.includes('assets/js/core/f-config.js')) {
              return 'core';
            }

            // Component library chunk
            if (id.includes('assets/js/shared/component-library.js') ||
                id.includes('assets/js/shared/components/')) {
              return 'components';
            }

            // ToolBase chunk - shared by all tools
            if (id.includes('assets/js/tools/tool-base.js')) {
              return 'toolbase';
            }

            // Algorithm chunks - loaded on demand
            if (id.includes('assets/js/shared/algorithms/physics/')) {
              return 'physics-algorithms';
            }
            if (id.includes('assets/js/shared/algorithms/geometry/')) {
              return 'geometry-algorithms';
            }
            if (id.includes('assets/js/shared/algorithms/noise/')) {
              return 'noise-algorithms';
            }
            if (id.includes('assets/js/shared/algorithms/')) {
              return 'algorithms';
            }

            // Individual tool chunks - each tool gets its own chunk
            if (id.includes('assets/js/tools/') && !id.includes('tool-base.js')) {
              // Extract tool name from path for better chunk naming
              const toolMatch = id.match(/assets\/js\/tools\/([^/]+)\.js/);
              if (toolMatch) {
                return `tool-${toolMatch[1]}`;
              }
              return 'tools';
            }

            // Vendor chunk for external dependencies
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      }
    },

    // Development server with modern features
    server: {
      host: true,
      port: 3000,
      hmr: {
        overlay: true // Error overlay for better debugging
      },
      cors: true, // CORS support for development
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        },
        // Proxy R2 manifest fetches to avoid CORS in dev
        '/r2': {
          target: 'https://media.einoder.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/r2/, ''),
        }
      }
    },

    // Legacy browser support (progressive enhancement) + bundle analysis
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11']
      }),
      // Bundle analyzer (only in analyze mode)
      ...(mode === 'analyze' ? [visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })] : [])
    ],

    // Path resolution with modern aliases
    resolve: {
      alias: {
        '@': '/src',
        '@shared': '/assets/js/shared',
        '@core': '/assets/js/core',
        '@tools': '/assets/js/tools',
        '@algorithms': '/assets/js/shared/algorithms',
        '@sections': '/assets/js/sections',
        '@projects': '/projects'
      }
    },

    // CSS processing with modern features
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase'
      }
    },

    // Handle different file types
    optimizeDeps: {
      // Pre-bundle critical dependencies (CDN-loaded libraries excluded)
      include: []
    }
  };
});