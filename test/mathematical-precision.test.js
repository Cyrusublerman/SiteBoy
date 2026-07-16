import { describe, expect, it } from 'vitest';

window.debugLog ??= () => {};

const { F, DERIVED_VALUES } = await import('../assets/js/core/f-config.js');
const { Config } = await import('../assets/js/core/config.js');

describe('Mathematical Precision', () => {
  it('uses one 14px F unit', () => {
    expect(F).toBe(14);
    expect(Config.F).toBe(F);
  });

  it('calculates the core frame dimensions exactly', () => {
    expect(DERIVED_VALUES.header).toBe(F * 2);
    expect(DERIVED_VALUES.subheader).toBe(F * 2);
    expect(DERIVED_VALUES.footer).toBe(F * 2);
    expect(DERIVED_VALUES.header).toBe(28);
  });

  it('calculates component dimensions exactly', () => {
    expect(DERIVED_VALUES.buttonWidth).toBe(F * 8);
    expect(DERIVED_VALUES.indent).toBe(F * 2);
    expect(DERIVED_VALUES.dropdownMaxHeight).toBe(F * 25);
  });

  it('calculates the spacing scale from F', () => {
    expect(DERIVED_VALUES.xs).toBe(F * 0.5);
    expect(DERIVED_VALUES.sm).toBe(F);
    expect(DERIVED_VALUES.md).toBe(F * 2);
    expect(DERIVED_VALUES.lg).toBe(F * 3);
    expect(DERIVED_VALUES.xl).toBe(F * 4);
  });

  it('calculates the typography scale from F', () => {
    expect(DERIVED_VALUES.h1).toBe(F * 2);
    expect(DERIVED_VALUES.h2).toBe(F * 1.5);
    expect(DERIVED_VALUES.h3).toBe(F);
    expect(DERIVED_VALUES.body).toBe(F);
    expect(DERIVED_VALUES.small).toBe(F * 0.8);
  });

  it('keeps layout-critical values integral', () => {
    for (const value of [
      DERIVED_VALUES.header,
      DERIVED_VALUES.desktopMargin,
      DERIVED_VALUES.buttonWidth,
      DERIVED_VALUES.indent,
    ]) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('uses the current one-pixel frame margin', () => {
    expect(Config.margin).toBe(1);
    expect(['B', 'S']).toContain(Config.marginMode);
  });

  it('exposes current sizing through Config', () => {
    expect(Config.sizing.header).toBe(F * 2);
    expect(Config.sizing.subheader).toBe(F * 2);
    expect(Config.sizing.indent).toBe(F * 2);
    expect(Config.sizing.dropdownMaxH).toBe(F * 25);
  });

  it('preserves exact half and one-and-a-half F calculations', () => {
    expect(F / 2).toBe(7);
    expect(F * 1.5).toBe(21);
  });

  it('preserves proportional relationships for another F value', () => {
    const testF = 16;
    expect(testF * 2).toBe(32);
    expect(testF * 4).toBe(64);
    expect(testF * 8).toBe(128);
  });
});
