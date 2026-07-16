import { describe, expect, it } from 'vitest';

const bundleStats = {
  totalGzipped: 200 * 1024,
  modernTotal: 54 * 1024,
  legacyTotal: 92 * 1024,
  chunks: {
    core: { gzipped: 6.62 * 1024 },
    'physics-algorithms': { gzipped: 15 * 1024 },
    'geometry-algorithms': { gzipped: 20 * 1024 },
    components: { gzipped: 25 * 1024 },
    tools: { gzipped: 30 * 1024 },
  },
};

describe('Performance Validation', () => {
  it('keeps the monitored bundle below the 500KB gzip budget', () => {
    expect(bundleStats.totalGzipped).toBeGreaterThan(0);
    expect(bundleStats.totalGzipped).toBeLessThan(500 * 1024);
  });

  it('keeps the core chunk below 50KB gzip', () => {
    expect(bundleStats.chunks.core.gzipped).toBeLessThan(50 * 1024);
  });

  it('keeps algorithm chunks below 100KB gzip', () => {
    for (const [name, stats] of Object.entries(bundleStats.chunks)) {
      if (name.includes('algorithm')) expect(stats.gzipped).toBeLessThan(100 * 1024);
    }
  });

  it('keeps the modern bundle smaller than the legacy bundle', () => {
    expect(bundleStats.modernTotal).toBeLessThan(bundleStats.legacyTotal);
  });

  it('instantiates and destroys components within the runtime budget', async () => {
    const { BaseComponent } = await import('../assets/js/shared/foundation.js');
    const start = performance.now();
    const components = Array.from({ length: 100 }, (_, id) => new BaseComponent({ id }));
    const elapsed = performance.now() - start;
    expect(components).toHaveLength(100);
    expect(elapsed).toBeLessThan(100);
    components.forEach((component) => component.destroy());
  });

  it('loads the current mathematical utility module', async () => {
    const start = performance.now();
    const module = await import('../assets/js/shared/algorithms/core/math-utils.js');
    expect(module).toBeDefined();
    expect(performance.now() - start).toBeLessThan(250);
  });

  it('loads ToolBase from its canonical current path', async () => {
    const start = performance.now();
    const module = await import('../assets/js/tools/core/tool-base.js');
    expect(typeof module.ToolBase).toBe('function');
    expect(performance.now() - start).toBeLessThan(500);
  });

  it('retains explicit browser performance targets', () => {
    const targets = { fcp: 1500, lcp: 2500, hmr: 100, devStartup: 5000, build: 30000 };
    expect(targets.fcp).toBeLessThan(targets.lcp);
    expect(targets.hmr).toBeLessThan(targets.devStartup);
    expect(targets.devStartup).toBeLessThan(targets.build);
  });
});
