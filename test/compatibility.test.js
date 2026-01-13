/**
 * Compatibility Tests - SiteBoy Framework Vite Integration
 *
 * Tests backward compatibility of global APIs and component functionality
 * after ES module migration. Ensures legacy tools continue to work.
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Mock the DOM for testing
beforeAll(() => {
  // Create basic DOM structure
  document.body.innerHTML = `
    <div id="app-root"></div>
    <div id="test-container"></div>
  `;
});

describe('Legacy Compatibility', () => {
  it('should validate basic test setup', () => {
    // Basic test to ensure testing environment works
    expect(window).toBeDefined();
    expect(document).toBeDefined();
    expect(document.body).toBeDefined();
  });

  it('should maintain MathematicalFoundation API compatibility', async () => {
    await import('../assets/js/core/f-config.js');

    const mf = window.MathematicalFoundation;

    // Test F value
    expect(mf.F).toBe(14);
    expect(mf.DERIVED_VALUES).toBeDefined();

    // Test derived values
    expect(mf.DERIVED_VALUES.header).toBe(14 * 2); // F * 2
    expect(mf.DERIVED_VALUES.desktopMargin).toBe(14 * 4); // F * 4
    expect(mf.DERIVED_VALUES.buttonWidth).toBe(14 * 8); // F * 8

    // Test legacy calculateDimensions method
    const buttonDims = mf.calculateDimensions('button');
    expect(buttonDims).toBeDefined();
    expect(buttonDims.width).toBeDefined();
    expect(buttonDims.height).toBeDefined();
  });

  it('should maintain Config API compatibility', async () => {
    await import('../assets/js/core/config.js');

    const config = window.Config;

    // Test that Config object exists
    expect(config).toBeDefined();
    expect(typeof config.F).toBe('number');
    expect(config.F).toBeGreaterThan(0);

    // Test margin calculations
    expect(config.margin).toBeDefined();
    expect(config.marginMode).toBeDefined();
    expect(['B', 'S']).toContain(config.marginMode);
  });

  it('should maintain Router API compatibility', async () => {
    await import('../assets/js/core/router.js');

    const router = window.Router;

    // Test router structure
    expect(router).toBeDefined();
    expect(router.version).toBeDefined();
    expect(router.sections).toBeDefined();
    expect(typeof router.sections).toBe('object');

    // Test section definitions
    expect(router.sections.home).toBe('HomeSection');
    expect(router.sections.tools).toBe('ToolsSection');
    expect(router.sections.blog).toBe('BlogSection');
  });

  it('should maintain BaseComponent API compatibility', async () => {
    await import('../assets/js/shared/foundation.js');

    const BaseComponent = window.BaseComponent;

    // Test BaseComponent exists
    expect(BaseComponent).toBeDefined();
    expect(typeof BaseComponent).toBe('function');

    // Test component instantiation (without mounting)
    const component = new BaseComponent({ test: true });
    expect(component).toBeDefined();
    expect(component.options).toBeDefined();
    expect(component.options.test).toBe(true);
  });

  it('should support component cleanup lifecycle', async () => {
    await import('../assets/js/shared/foundation.js');

    const BaseComponent = window.BaseComponent;

    // Create component
    const component = new BaseComponent();

    // Test destroy method exists
    expect(typeof component.destroy).toBe('function');

    // Test cleanup (should not throw)
    expect(() => component.destroy()).not.toThrow();
  });

  it('should maintain ToolBase global availability', async () => {
    // Mock ComponentLibrary for ToolBase initialization
    window.ComponentLibrary = {
      BaseComponent: window.BaseComponent,
      Tool: {
        NumericInput: class MockNumericInput extends window.BaseComponent {},
        TextInput: class MockTextInput extends window.BaseComponent {},
        Button: class MockButton extends window.BaseComponent {}
      }
    };

    await import('../assets/js/tools/tool-base.js');

    // ToolBase should be globally available after ComponentLibrary loads
    expect(window.ToolBase).toBeDefined();
    expect(typeof window.ToolBase).toBe('function');
  });

  it('should support tool instantiation with legacy API', async () => {
    await import('../assets/js/tools/tool-base.js');

    const ToolBase = window.ToolBase;

    // Test tool configuration structure
    const config = {
      title: 'Test Tool',
      sidebar: [
        ['Test Tab', [
          ['Test Block', [
            ['slider', 'Test Slider', 0, 100, 1]
          ]]
        ]]
      ],
      canvas: { width: 400, height: 400 }
    };

    // Should not throw during instantiation
    expect(() => new ToolBase(config)).not.toThrow();
  });
});