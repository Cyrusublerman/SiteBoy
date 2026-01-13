# Vite Integration Plan - SiteBoy Framework

## Executive Summary

This document outlines a comprehensive plan to integrate Vite as the build system for SiteBoy, migrating from manual file management to modern ES module bundling while preserving the framework's vanilla JavaScript architecture and mathematical precision. The plan focuses on 2025 best practices including performance optimization, developer experience, and future-proofing.

## Current State Analysis

### Existing Build Process
- **Manual management**: Direct HTML/CSS/JS file serving
- **Global dependencies**: Reliance on `window.*` objects
- **No bundling**: Files loaded individually via `<script>` tags
- **No optimization**: No minification, tree shaking, or code splitting
- **Limited development experience**: No HMR, slow rebuilds

### Architecture Constraints
- **Mathematical foundation**: Must preserve F-unit system precision
- **Algorithm library**: Pure functional exports must remain accessible
- **Component system**: BaseComponent inheritance must work
- **Tool compatibility**: Legacy tools expect global objects
- **File ownership rules**: Clear separation of concerns must be maintained

## Phase 1: Foundation Setup (Week 1-2)

### Step 1.1: Project Structure Analysis
```bash
# Current structure
SiteBoy/
├── index.html                    # Main entry point
├── assets/
│   ├── css/styles.css           # Single CSS file
│   └── js/
│       ├── core/                # Core systems
│       ├── shared/              # Shared components/algorithms
│       └── tools/               # Individual tools
└── blog/                        # Documentation
```

**2025 Best Practice**: Analyze bundle splitting opportunities
- Core systems (mathematical foundation, base components)
- Algorithm libraries (physics, geometry, patterns)
- Tool-specific code
- Shared utilities

### Step 1.2: Vite Installation and Configuration

**Install Vite with modern tooling:**
```bash
npm init -y
npm install --save-dev vite @vitejs/plugin-legacy
npm install --save-dev rollup terser esbuild
```

**2025 Configuration Best Practices:**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  // Modern ES module output
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Preserve mathematical precision
        manualChunks: {
          'core': ['assets/js/core/app.js', 'assets/js/core/config.js'],
          'foundation': ['assets/js/shared/foundation.js', 'assets/js/shared/layout.js'],
          'algorithms': ['assets/js/shared/algorithms/index.js'],
          'components': ['assets/js/shared/component-library.js']
        }
      }
    }
  },

  // Development server with HMR
  server: {
    host: true,
    port: 3000,
    hmr: {
      overlay: true
    }
  },

  // Legacy browser support
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],

  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/assets/js/shared',
      '@core': '/assets/js/core',
      '@tools': '/assets/js/tools'
    }
  }
})
```

**Key 2025 Features:**
- **ESNext target**: Modern JavaScript with tree shaking
- **Manual chunks**: Preserve SiteBoy's architectural separation
- **Legacy plugin**: Progressive enhancement for older browsers
- **Path aliases**: Modern import patterns

### Step 1.3: Package.json Configuration

```json
{
  "name": "siteboy-framework",
  "version": "4.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:analyze": "vite build --mode analyze",
    "build:legacy": "vite build --legacy"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-legacy": "^5.0.0",
    "rollup": "^4.0.0",
    "esbuild": "^0.19.0",
    "terser": "^5.0.0"
  }
}
```

## Phase 2: Module Migration (Week 3-4)

### Step 2.1: Core Systems Migration

**Mathematical Foundation (assets/js/core/mathematical-foundation.js)**
```javascript
// Before: Global assignment
window.MathematicalFoundation = { /* ... */ }

// After: ES module export
export class MathematicalFoundation {
  constructor() {
    this.F = 14; // Base F-unit
    this.initializeCalculations();
  }

  calculateDimensions(type, props = {}) {
    // Mathematical precision preserved
    const calculations = {
      'button': { width: this.F * 8, height: this.F * 2 },
      'grid': { cols: Math.floor(props.containerWidth / (this.F * 12)) }
    };
    return calculations[type] || {};
  }
}

// Global compatibility for legacy tools
if (typeof window !== 'undefined') {
  window.MathematicalFoundation = new MathematicalFoundation();
}
```

**2025 Best Practice**: Hybrid exports for backward compatibility
- Primary: ES module exports
- Fallback: Global assignment for legacy tools

### Step 2.2: Component Library Migration

**BaseComponent (assets/js/shared/foundation.js)**
```javascript
// Modern ES module with backward compatibility
export class BaseComponent {
  constructor(options = {}, deps = {}) {
    this.options = options;
    this.deps = {
      MF: deps.MF || (typeof window !== 'undefined' ? window.MathematicalFoundation : null),
      Resize: deps.Resize || (typeof window !== 'undefined' ? window.ResizeManager : null),
      ...deps
    };
    this.validateDependencies();
  }

  // ... existing methods preserved
}

// Global registration for compatibility
if (typeof window !== 'undefined') {
  window.BaseComponent = BaseComponent;
}
```

### Step 2.3: Algorithm Library Migration

**Algorithm Index (assets/js/shared/algorithms/index.js)**
```javascript
// Tree-shakeable exports
export { MathUtils } from './core/math-utils.js';
export * as Noise from './noise/noise-functions.js';
export * as Physics from './physics/index.js';

// Dynamic imports for large modules (2025 best practice)
export const loadAdvancedAlgorithms = () => import('./advanced/index.js');

// Global compatibility
if (typeof window !== 'undefined') {
  Promise.all([
    import('./core/math-utils.js'),
    import('./physics/index.js'),
    import('./geometry/index.js')
  ]).then(([MathUtils, Physics, Geometry]) => {
    window.Algorithms = {
      MathUtils: MathUtils.MathUtils,
      Physics,
      Geometry
    };
  });
}
```

**2025 Optimization**: Dynamic imports for performance
- Core algorithms: Static imports
- Advanced algorithms: Dynamic imports on demand
- Global fallbacks: Async loading to avoid blocking

### Step 2.4: Tool Migration Strategy

**Individual Tool Migration:**
```javascript
// Before: Global tool definition
window.ToolRegistry.register('polygon-calculator', { /* ... */ });

// After: ES module with global registration
import { ToolRegistry } from '../core/tool-registry.js';

export class PolygonCalculator {
  // ... tool implementation
}

// Register globally for compatibility
if (typeof window !== 'undefined') {
  ToolRegistry.register('polygon-calculator', new PolygonCalculator());
}
```

**Lazy Loading Pattern (2025 Best Practice):**
```javascript
// Dynamic tool loading
export const loadTool = async (toolName) => {
  switch (toolName) {
    case 'polygon-calculator':
      return import('../tools/polygon-calculator.js');
    case 'wave-interference':
      return import('../tools/wave-interference-tool.js');
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};
```

## Phase 3: Build Optimization (Week 5-6)

### Step 3.1: Bundle Analysis and Optimization

**2025 Bundle Analysis:**
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Analyze bundle composition
npm run build:analyze
```

**Chunk Strategy:**
```javascript
// vite.config.js - Advanced chunking
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core chunk - always loaded
          if (id.includes('core/') || id.includes('foundation')) {
            return 'core';
          }

          // Algorithm chunks - loaded on demand
          if (id.includes('algorithms/physics')) {
            return 'physics-algorithms';
          }
          if (id.includes('algorithms/geometry')) {
            return 'geometry-algorithms';
          }

          // Tool chunks - individual loading
          if (id.includes('tools/')) {
            return 'tools';
          }

          // Vendor chunk for external dependencies
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
```

### Step 3.2: Performance Optimizations

**Preloading Strategy (2025 Best Practice):**
```html
<!-- index.html with modern preloading -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Preload critical resources -->
  <link rel="modulepreload" href="/assets/js/core/app.js">
  <link rel="modulepreload" href="/assets/js/shared/foundation.js">

  <!-- Preload based on user navigation patterns -->
  <link rel="modulepreload" href="/assets/js/shared/algorithms/index.js" crossorigin>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Service Worker for Caching (2025 Best Practice):**
```javascript
// public/sw.js
const CACHE_NAME = 'siteboy-v4.0.0';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/assets/js/core/app.js',
        '/assets/js/shared/foundation.js',
        '/assets/css/styles.css'
      ]);
    })
  );
});
```

### Step 3.3: Development Experience Enhancements

**Modern Dev Server Configuration:**
```javascript
// vite.config.js - Development optimizations
export default defineConfig({
  server: {
    // Fast HMR with overlay
    hmr: {
      overlay: true,
      port: 24678
    },

    // CORS for development
    cors: true,

    // Proxy for API endpoints (if needed)
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },

  // CSS processing
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
```

## Phase 4: Testing and Validation (Week 7-8)

### Step 4.1: Compatibility Testing

**Legacy Tool Compatibility:**
```javascript
// test/compatibility.test.js
import { describe, it, expect } from 'vitest';

describe('Legacy Compatibility', () => {
  it('should expose global objects', () => {
    expect(window.ComponentLibrary).toBeDefined();
    expect(window.MathematicalFoundation).toBeDefined();
    expect(window.Algorithms).toBeDefined();
  });

  it('should maintain component API', () => {
    const button = window.ComponentLibrary.create('button', { text: 'Test' });
    expect(button).toBeDefined();
    expect(button.element).toBeDefined();
  });
});
```

**2025 Testing Best Practices:**
```bash
# Install modern testing framework
npm install --save-dev vitest @testing-library/dom jsdom

# Test configuration
# vitest.config.js
export default {
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.js']
  }
};
```

### Step 4.2: Performance Validation

**Bundle Size Monitoring:**
```javascript
// scripts/validate-bundle.js
import { readFileSync } from 'fs';
import { gzipSize } from 'gzip-size';

const stats = JSON.parse(readFileSync('./dist/stats.json'));
const totalSize = Object.values(stats).reduce((sum, chunk) => sum + chunk.size, 0);

console.log(`Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
console.log(`Gzip size: ${(await gzipSize(readFileSync('./dist/index.html')) / 1024).toFixed(2)}KB`);
```

**2025 Performance Metrics:**
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Bundle size: < 500KB gzipped
- HMR update time: < 100ms

### Step 4.3: Mathematical Precision Validation

**Precision Testing:**
```javascript
// test/mathematical-precision.test.js
describe('Mathematical Precision', () => {
  it('should maintain F-unit accuracy', () => {
    const mf = new MathematicalFoundation();
    const dims = mf.calculateDimensions('button');

    expect(dims.width).toBe(14 * 8); // F * 8
    expect(dims.height).toBe(14 * 2); // F * 2
  });

  it('should preserve container-aware calculations', () => {
    const gridDims = mf.calculateDimensions('grid', { containerWidth: 1200 });
    expect(gridDims.cols).toBe(Math.floor(1200 / (14 * 12)));
  });
});
```

## Phase 5: Deployment and Monitoring (Week 9-10)

### Step 5.1: CI/CD Pipeline

**2025 GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy.yml
name: Deploy SiteBoy

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: siteboy
          directory: dist
```

### Step 5.2: Deployment Strategy

**Multi-Environment Setup:**
```javascript
// vite.config.js - Environment handling
export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __ENVIRONMENT__: JSON.stringify(mode)
  }
}));
```

**2025 Deployment Options:**
1. **Cloudflare Pages**: Global CDN, automatic deployments
2. **Netlify**: Preview deployments, form handling
3. **Vercel**: Edge functions, analytics integration
4. **Self-hosted**: Traditional web server with CDN

### Step 5.3: Monitoring and Analytics

**Performance Monitoring:**
```javascript
// src/analytics.js
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export const initAnalytics = () => {
  // Core Web Vitals tracking
  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
};
```

**Error Tracking (2025 Best Practice):**
```javascript
// Modern error boundary
window.addEventListener('error', (event) => {
  // Send to error tracking service
  console.error('Application Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
```

## Phase 6: Optimization and Future-Proofing (Ongoing)

### Step 6.1: Advanced Performance Features

**HTTP/2 Server Push (2025):**
```javascript
// Modern preload patterns
const preloadResources = [
  '/assets/js/core/app.js',
  '/assets/js/shared/foundation.js',
  '/assets/css/styles.css'
];

preloadResources.forEach(href => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = href.endsWith('.js') ? 'script' : 'style';
  document.head.appendChild(link);
});
```

**WebAssembly Integration (Future):**
```javascript
// For performance-critical algorithms
export const loadWasmAlgorithms = async () => {
  const { default: init, calculate_wave_interference } = await import('./algorithms.wasm');
  await init();
  return { calculate_wave_interference };
};
```

### Step 6.2: Security Enhancements

**Content Security Policy (2025):**
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self';
">
```

**Subresource Integrity:**
```html
<script src="/assets/js/core/app.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

## Migration Timeline and Milestones

### Week 1-2: Foundation
- ✅ Vite installation and basic configuration
- ✅ Package.json setup with modern scripts
- ✅ Initial build verification
- ✅ Development server testing

### Week 3-4: Core Migration
- ✅ Mathematical foundation module conversion
- ✅ BaseComponent ES module migration
- ✅ Component library modularization
- ✅ Basic algorithm exports

### Week 5-6: Optimization
- ✅ Bundle analysis and chunking
- ✅ Performance optimizations
- ✅ Development experience enhancements
- ✅ CSS processing integration

### Week 7-8: Validation
- ✅ Compatibility testing with legacy tools
- ✅ Performance benchmarking
- ✅ Mathematical precision validation
- ✅ Cross-browser testing

### Week 9-10: Deployment
- ✅ CI/CD pipeline setup
- ✅ Multi-environment configuration
- ✅ Monitoring and analytics integration
- ✅ Production deployment

### Ongoing: Optimization
- 🔄 Performance monitoring and improvements
- 🔄 Security updates and CSP implementation
- 🔄 New feature development with modern patterns
- 🔄 Community feedback integration

## Risk Mitigation

### Technical Risks
- **Module loading failures**: Comprehensive fallback system
- **Legacy tool breakage**: Parallel compatibility testing
- **Performance regression**: Detailed benchmarking before/after
- **Bundle size increase**: Strict size limits and monitoring

### Operational Risks
- **Developer learning curve**: Comprehensive documentation and training
- **Build system complexity**: Simplified configuration with good defaults
- **Deployment issues**: Staging environment testing
- **Rollback capability**: Maintain old build system during transition

## Success Metrics

### Performance Metrics
- **Build time**: < 30 seconds for full rebuild
- **Development startup**: < 5 seconds
- **HMR update**: < 100ms
- **Bundle size**: < 500KB gzipped total
- **Core Web Vitals**: All "Good" scores

### Developer Experience
- **Setup time**: < 15 minutes for new developers
- **Debugging**: Full source maps and dev tools integration
- **Testing**: 80%+ code coverage with automated tests
- **Documentation**: Comprehensive migration and usage guides

### Compatibility
- **Legacy tools**: 100% functional after migration
- **Browser support**: Modern browsers + legacy fallback
- **API compatibility**: All existing APIs preserved
- **Mathematical precision**: Zero loss of calculation accuracy

## Conclusion

This Vite integration plan provides a comprehensive, low-risk migration path that modernizes SiteBoy's build system while preserving its architectural strengths. The phased approach ensures compatibility, performance, and developer experience improvements while maintaining the framework's unique mathematical precision and tool ecosystem.

The plan incorporates 2025 best practices including ES modules, advanced bundling, performance monitoring, and modern deployment strategies, positioning SiteBoy for continued evolution while respecting its architectural foundations.

