// vite.config.js
import { defineConfig } from "file:///C:/Users/Einod/Documents/GitHub/SiteBoy/node_modules/vite/dist/node/index.js";
import legacy from "file:///C:/Users/Einod/Documents/GitHub/SiteBoy/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import { visualizer } from "file:///C:/Users/Einod/Documents/GitHub/SiteBoy/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var vite_config_default = defineConfig(({ mode }) => ({
  // Root directory (current directory)
  root: ".",
  // Explicitly set entry point to avoid scanning all HTML files
  build: {
    minify: "esbuild",
    // Fast minification
    sourcemap: true,
    // Source maps for debugging
    rollupOptions: {
      input: {
        main: "index.html"
      },
      output: {
        // Preserve SiteBoy's architectural separation
        manualChunks: (id) => {
          if (id.includes("assets/js/core/") || id.includes("assets/js/shared/foundation.js") || id.includes("assets/js/shared/layout.js") || id.includes("assets/js/core/f-config.js")) {
            return "core";
          }
          if (id.includes("assets/js/shared/algorithms/physics/")) {
            return "physics-algorithms";
          }
          if (id.includes("assets/js/shared/algorithms/geometry/")) {
            return "geometry-algorithms";
          }
          if (id.includes("assets/js/shared/algorithms/noise/")) {
            return "noise-algorithms";
          }
          if (id.includes("assets/js/shared/algorithms/")) {
            return "algorithms";
          }
          if (id.includes("assets/js/shared/component-library.js") || id.includes("assets/js/shared/components/")) {
            return "components";
          }
          if (id.includes("assets/js/tools/")) {
            return "tools";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        }
      }
    }
  },
  // Development server with modern features
  server: {
    host: true,
    port: 3e3,
    hmr: {
      overlay: true
      // Error overlay for better debugging
    },
    cors: true,
    // CORS support for development
    proxy: {
      // Proxy for API endpoints if needed
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  // Legacy browser support (progressive enhancement) + bundle analysis
  plugins: [
    legacy({
      targets: ["defaults", "not IE 11"]
    }),
    // Bundle analyzer (only in analyze mode)
    ...mode === "analyze" ? [visualizer({
      filename: "dist/bundle-analysis.html",
      open: true,
      gzipSize: true,
      brotliSize: true
    })] : []
  ],
  // Path resolution with modern aliases
  resolve: {
    alias: {
      "@": "/src",
      "@shared": "/assets/js/shared",
      "@core": "/assets/js/core",
      "@tools": "/assets/js/tools",
      "@algorithms": "/assets/js/shared/algorithms",
      "@sections": "/assets/js/sections",
      "@projects": "/projects"
    }
  },
  // CSS processing with modern features
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: "camelCase"
    }
  },
  // Handle different file types
  optimizeDeps: {
    // Pre-bundle critical dependencies (CDN-loaded libraries excluded)
    include: []
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxFaW5vZFxcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXFNpdGVCb3lcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEVpbm9kXFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcU2l0ZUJveVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvRWlub2QvRG9jdW1lbnRzL0dpdEh1Yi9TaXRlQm95L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IGxlZ2FjeSBmcm9tICdAdml0ZWpzL3BsdWdpbi1sZWdhY3knXHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIC8vIFJvb3QgZGlyZWN0b3J5IChjdXJyZW50IGRpcmVjdG9yeSlcclxuICByb290OiAnLicsXHJcblxyXG4gIC8vIEV4cGxpY2l0bHkgc2V0IGVudHJ5IHBvaW50IHRvIGF2b2lkIHNjYW5uaW5nIGFsbCBIVE1MIGZpbGVzXHJcbiAgYnVpbGQ6IHtcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLCAvLyBGYXN0IG1pbmlmaWNhdGlvblxyXG4gICAgc291cmNlbWFwOiB0cnVlLCAvLyBTb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgbWFpbjogJ2luZGV4Lmh0bWwnXHJcbiAgICAgIH0sXHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIC8vIFByZXNlcnZlIFNpdGVCb3kncyBhcmNoaXRlY3R1cmFsIHNlcGFyYXRpb25cclxuICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xyXG4gICAgICAgICAgLy8gQ29yZSBjaHVuayAtIGFsd2F5cyBsb2FkZWQgKFNpdGVCb3kgZm91bmRhdGlvbilcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnYXNzZXRzL2pzL2NvcmUvJykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnYXNzZXRzL2pzL3NoYXJlZC9mb3VuZGF0aW9uLmpzJykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnYXNzZXRzL2pzL3NoYXJlZC9sYXlvdXQuanMnKSB8fFxyXG4gICAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdhc3NldHMvanMvY29yZS9mLWNvbmZpZy5qcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnY29yZSc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gQWxnb3JpdGhtIGNodW5rcyAtIGxvYWRlZCBvbiBkZW1hbmQgKDIwMjUgYmVzdCBwcmFjdGljZSlcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnYXNzZXRzL2pzL3NoYXJlZC9hbGdvcml0aG1zL3BoeXNpY3MvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdwaHlzaWNzLWFsZ29yaXRobXMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdhc3NldHMvanMvc2hhcmVkL2FsZ29yaXRobXMvZ2VvbWV0cnkvJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdnZW9tZXRyeS1hbGdvcml0aG1zJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnYXNzZXRzL2pzL3NoYXJlZC9hbGdvcml0aG1zL25vaXNlLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnbm9pc2UtYWxnb3JpdGhtcyc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2Fzc2V0cy9qcy9zaGFyZWQvYWxnb3JpdGhtcy8nKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ2FsZ29yaXRobXMnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENvbXBvbmVudCBjaHVuayAtIGxvYWRlZCB3aGVuIG5lZWRlZFxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdhc3NldHMvanMvc2hhcmVkL2NvbXBvbmVudC1saWJyYXJ5LmpzJykgfHxcclxuICAgICAgICAgICAgICBpZC5pbmNsdWRlcygnYXNzZXRzL2pzL3NoYXJlZC9jb21wb25lbnRzLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnY29tcG9uZW50cyc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVG9vbCBjaHVua3MgLSBpbmRpdmlkdWFsIGxvYWRpbmcgKDIwMjUgYmVzdCBwcmFjdGljZSlcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnYXNzZXRzL2pzL3Rvb2xzLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndG9vbHMnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFZlbmRvciBjaHVuayBmb3IgZXh0ZXJuYWwgZGVwZW5kZW5jaWVzXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgd2l0aCBtb2Rlcm4gZmVhdHVyZXNcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IHRydWUsXHJcbiAgICBwb3J0OiAzMDAwLFxyXG4gICAgaG1yOiB7XHJcbiAgICAgIG92ZXJsYXk6IHRydWUgLy8gRXJyb3Igb3ZlcmxheSBmb3IgYmV0dGVyIGRlYnVnZ2luZ1xyXG4gICAgfSxcclxuICAgIGNvcnM6IHRydWUsIC8vIENPUlMgc3VwcG9ydCBmb3IgZGV2ZWxvcG1lbnRcclxuICAgIHByb3h5OiB7XHJcbiAgICAgIC8vIFByb3h5IGZvciBBUEkgZW5kcG9pbnRzIGlmIG5lZWRlZFxyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gTGVnYWN5IGJyb3dzZXIgc3VwcG9ydCAocHJvZ3Jlc3NpdmUgZW5oYW5jZW1lbnQpICsgYnVuZGxlIGFuYWx5c2lzXHJcbiAgcGx1Z2luczogW1xyXG4gICAgbGVnYWN5KHtcclxuICAgICAgdGFyZ2V0czogWydkZWZhdWx0cycsICdub3QgSUUgMTEnXVxyXG4gICAgfSksXHJcbiAgICAvLyBCdW5kbGUgYW5hbHl6ZXIgKG9ubHkgaW4gYW5hbHl6ZSBtb2RlKVxyXG4gICAgLi4uKG1vZGUgPT09ICdhbmFseXplJyA/IFt2aXN1YWxpemVyKHtcclxuICAgICAgZmlsZW5hbWU6ICdkaXN0L2J1bmRsZS1hbmFseXNpcy5odG1sJyxcclxuICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgZ3ppcFNpemU6IHRydWUsXHJcbiAgICAgIGJyb3RsaVNpemU6IHRydWVcclxuICAgIH0pXSA6IFtdKVxyXG4gIF0sXHJcblxyXG4gIC8vIFBhdGggcmVzb2x1dGlvbiB3aXRoIG1vZGVybiBhbGlhc2VzXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiAnL3NyYycsXHJcbiAgICAgICdAc2hhcmVkJzogJy9hc3NldHMvanMvc2hhcmVkJyxcclxuICAgICAgJ0Bjb3JlJzogJy9hc3NldHMvanMvY29yZScsXHJcbiAgICAgICdAdG9vbHMnOiAnL2Fzc2V0cy9qcy90b29scycsXHJcbiAgICAgICdAYWxnb3JpdGhtcyc6ICcvYXNzZXRzL2pzL3NoYXJlZC9hbGdvcml0aG1zJyxcclxuICAgICAgJ0BzZWN0aW9ucyc6ICcvYXNzZXRzL2pzL3NlY3Rpb25zJyxcclxuICAgICAgJ0Bwcm9qZWN0cyc6ICcvcHJvamVjdHMnXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy8gQ1NTIHByb2Nlc3Npbmcgd2l0aCBtb2Rlcm4gZmVhdHVyZXNcclxuICBjc3M6IHtcclxuICAgIGRldlNvdXJjZW1hcDogdHJ1ZSxcclxuICAgIG1vZHVsZXM6IHtcclxuICAgICAgbG9jYWxzQ29udmVudGlvbjogJ2NhbWVsQ2FzZSdcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyBIYW5kbGUgZGlmZmVyZW50IGZpbGUgdHlwZXNcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIC8vIFByZS1idW5kbGUgY3JpdGljYWwgZGVwZW5kZW5jaWVzIChDRE4tbG9hZGVkIGxpYnJhcmllcyBleGNsdWRlZClcclxuICAgIGluY2x1ZGU6IFtdXHJcbiAgfVxyXG59KSlcclxuXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVQsU0FBUyxvQkFBb0I7QUFDaFYsT0FBTyxZQUFZO0FBQ25CLFNBQVMsa0JBQWtCO0FBRTNCLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUE7QUFBQSxFQUV6QyxNQUFNO0FBQUE7QUFBQSxFQUdOLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQTtBQUFBLElBQ1IsV0FBVztBQUFBO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsUUFBUTtBQUFBO0FBQUEsUUFFTixjQUFjLENBQUMsT0FBTztBQUVwQixjQUFJLEdBQUcsU0FBUyxpQkFBaUIsS0FDN0IsR0FBRyxTQUFTLGdDQUFnQyxLQUM1QyxHQUFHLFNBQVMsNEJBQTRCLEtBQ3hDLEdBQUcsU0FBUyw0QkFBNEIsR0FBRztBQUM3QyxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyxzQ0FBc0MsR0FBRztBQUN2RCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyx1Q0FBdUMsR0FBRztBQUN4RCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyxvQ0FBb0MsR0FBRztBQUNyRCxtQkFBTztBQUFBLFVBQ1Q7QUFDQSxjQUFJLEdBQUcsU0FBUyw4QkFBOEIsR0FBRztBQUMvQyxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyx1Q0FBdUMsS0FDbkQsR0FBRyxTQUFTLDhCQUE4QixHQUFHO0FBQy9DLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLGtCQUFrQixHQUFHO0FBQ25DLG1CQUFPO0FBQUEsVUFDVDtBQUdBLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQTtBQUFBLElBQ1g7QUFBQSxJQUNBLE1BQU07QUFBQTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxTQUFTLENBQUMsWUFBWSxXQUFXO0FBQUEsSUFDbkMsQ0FBQztBQUFBO0FBQUEsSUFFRCxHQUFJLFNBQVMsWUFBWSxDQUFDLFdBQVc7QUFBQSxNQUNuQyxVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsSUFDZCxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQUEsRUFDVDtBQUFBO0FBQUEsRUFHQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLO0FBQUEsTUFDTCxXQUFXO0FBQUEsTUFDWCxTQUFTO0FBQUEsTUFDVCxVQUFVO0FBQUEsTUFDVixlQUFlO0FBQUEsTUFDZixhQUFhO0FBQUEsTUFDYixhQUFhO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsS0FBSztBQUFBLElBQ0gsY0FBYztBQUFBLElBQ2QsU0FBUztBQUFBLE1BQ1Asa0JBQWtCO0FBQUEsSUFDcEI7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLGNBQWM7QUFBQTtBQUFBLElBRVosU0FBUyxDQUFDO0FBQUEsRUFDWjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
