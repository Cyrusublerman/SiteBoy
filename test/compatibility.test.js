import { beforeAll, describe, expect, it } from 'vitest';

window.debugLog ??= () => {};

document.body.innerHTML = '<div id="app-root"></div><div id="test-container"></div>';

const { F, DERIVED_VALUES } = await import('../assets/js/core/f-config.js');
const { Config } = await import('../assets/js/core/config.js');
const { Router } = await import('../assets/js/core/router.js');
const { BaseComponent } = await import('../assets/js/shared/foundation.js');
const { ToolBase } = await import('../assets/js/tools/core/tool-base.js');

beforeAll(() => {
  document.body.innerHTML = '<div id="app-root"></div><div id="test-container"></div>';
});

describe('Current architecture compatibility', () => {
  it('provides the browser test environment', () => {
    expect(window).toBeDefined();
    expect(document.body).toBeDefined();
  });

  it('exposes the current F-unit module and legacy globals', () => {
    expect(F).toBe(14);
    expect(DERIVED_VALUES.header).toBe(28);
    expect(window.MathematicalFoundation?.F ?? F).toBe(14);
  });

  it('exposes the current Config API', () => {
    expect(Config.F).toBe(F);
    expect(Config.margin).toBe(1);
    expect(['B', 'S']).toContain(Config.marginMode);
    expect(window.Config).toBe(Config);
  });

  it('exposes hybrid public and legacy routes', () => {
    expect(Router.version).toBe('2.0.0');
    expect(Router.sections.wiki).toBe('WikiSection');
    expect(Router.sections.blog).toBe('PKLBlogSection');
    expect(Router.sections.tools).toBe('ToolsSection');
    expect(window.Router).toBe(Router);
  });

  it('supports the component cleanup lifecycle', () => {
    const component = new BaseComponent({ test: true });
    expect(component.options.test).toBe(true);
    expect(typeof component.destroy).toBe('function');
    expect(() => component.destroy()).not.toThrow();
  });

  it('exports ToolBase from its current canonical path', () => {
    expect(typeof ToolBase).toBe('function');
  });
});
