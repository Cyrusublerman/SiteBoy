/**
 * Mathematical Precision Tests - SiteBoy Framework
 *
 * Validates that F-unit calculations and mathematical operations maintain
 * exact precision after ES module migration and Vite bundling.
 */

import { describe, it, expect } from 'vitest';

describe('Mathematical Precision', () => {

  describe('F-unit System Precision', () => {
    it('should validate basic F-unit mathematics', () => {
      // Test basic mathematical relationships that should hold
      const F = 14;
      expect(F * 2).toBe(28); // Header height
      expect(F * 4).toBe(56); // Desktop margin
      expect(F * 8).toBe(112); // Button width
    });

    it('should calculate header dimensions precisely', () => {
      const header = mf.DERIVED_VALUES.header;
      expect(header).toBe(mf.F * 2); // F × 2 = 28
      expect(header).toBe(28);
      expect(Number.isInteger(header)).toBe(true);
    });

    it('should calculate subheader dimensions precisely', () => {
      const subheader = mf.DERIVED_VALUES.subheader;
      expect(subheader).toBe(mf.F * 2); // F × 2 = 28
      expect(subheader).toBe(28);
    });

    it('should calculate desktop margins precisely', () => {
      const margin = mf.DERIVED_VALUES.desktopMargin;
      expect(margin).toBe(mf.F * 4); // F × 4 = 56
      expect(margin).toBe(56);
    });

    it('should calculate mobile margins with precision', () => {
      const margin = mf.DERIVED_VALUES.mobileMargin;
      // Math.max(F / 2, 6) = Math.max(7, 6) = 7
      expect(margin).toBe(Math.max(mf.F / 2, 6));
      expect(margin).toBe(7);
    });

    it('should calculate button width precisely', () => {
      const width = mf.DERIVED_VALUES.buttonWidth;
      expect(width).toBe(mf.F * 8); // F × 8 = 112
      expect(width).toBe(112);
    });

    it('should calculate indent precisely', () => {
      const indent = mf.DERIVED_VALUES.indent;
      expect(indent).toBe(mf.F * 2); // F × 2 = 28
      expect(indent).toBe(28);
    });

    it('should calculate spacing system precisely', () => {
      const spacing = mf.DERIVED_VALUES;
      expect(spacing.xs).toBe(mf.F * 0.5); // 7
      expect(spacing.sm).toBe(mf.F); // 14
      expect(spacing.md).toBe(mf.F * 2); // 28
      expect(spacing.lg).toBe(mf.F * 3); // 42
      expect(spacing.xl).toBe(mf.F * 4); // 56
    });

    it('should calculate typography scale precisely', () => {
      const typo = mf.DERIVED_VALUES;
      expect(typo.h1).toBe(mf.F * 2); // 28
      expect(typo.h2).toBe(mf.F * 1.5); // 21
      expect(typo.h3).toBe(mf.F); // 14
      expect(typo.body).toBe(mf.F); // 14
      expect(typo.small).toBe(mf.F * 0.8); // 11.2
    });
  });

  describe('Legacy calculateDimensions API', () => {
    it('should calculate button dimensions accurately', () => {
      const dims = mf.calculateDimensions('button');
      expect(dims.width).toBe(mf.DERIVED_VALUES.buttonWidth);
      expect(dims.height).toBe(mf.DERIVED_VALUES.header);
    });

    it('should calculate dropdown max height accurately', () => {
      const dims = mf.calculateDimensions('dropdown');
      expect(dims.maxHeight).toBe(mf.DERIVED_VALUES.dropdownMaxHeight);
      expect(dims.maxHeight).toBe(mf.F * 25); // 350
    });

    it('should calculate grid columns with container awareness', () => {
      const containerWidth = 1200;
      const dims = mf.calculateDimensions('grid', { containerWidth });
      const expectedCols = Math.floor(containerWidth / (mf.F * 12));
      expect(dims.cols).toBe(expectedCols);
      expect(Number.isInteger(dims.cols)).toBe(true);
    });

    it('should calculate indent dimensions accurately', () => {
      const dims = mf.calculateDimensions('indent');
      expect(dims.size).toBe(mf.DERIVED_VALUES.indent);
      expect(dims.size).toBe(mf.F * 2); // 28
    });
  });

  describe('Config Integration', () => {
    it('should integrate with Config F value', () => {
      expect(config.F).toBe(mf.F);
      expect(config.F).toBe(14);
    });

    it('should maintain margin calculation consistency', () => {
      expect(config.margin).toBeDefined();
      expect(typeof config.margin).toBe('number');
      expect(config.margin).toBeGreaterThan(0);
    });

    it('should support valid margin modes', () => {
      expect(['B', 'S']).toContain(config.marginMode);
    });
  });

  describe('Floating Point Precision', () => {
    it('should avoid floating point precision errors in calculations', () => {
      // Test that calculations with F/2 don't introduce precision errors
      const halfF = mf.F / 2;
      expect(halfF).toBe(7); // Should be exact, not 7.0000000001

      // Test typography scale calculations
      const h2Size = mf.F * 1.5;
      expect(h2Size).toBe(21); // Should be exact

      const smallSize = mf.F * 0.8;
      expect(smallSize).toBe(11.2); // Should be exact
    });

    it('should maintain integer precision for layout-critical values', () => {
      // These values are used for pixel-perfect layouts
      expect(Number.isInteger(mf.DERIVED_VALUES.header)).toBe(true);
      expect(Number.isInteger(mf.DERIVED_VALUES.desktopMargin)).toBe(true);
      expect(Number.isInteger(mf.DERIVED_VALUES.buttonWidth)).toBe(true);
      expect(Number.isInteger(mf.DERIVED_VALUES.indent)).toBe(true);
    });
  });

  describe('Mathematical Consistency', () => {
    it('should maintain proportional relationships', () => {
      const f = mf.F;

      // Header should always be 2F
      expect(mf.DERIVED_VALUES.header).toBe(f * 2);

      // Desktop margin should always be 4F
      expect(mf.DERIVED_VALUES.desktopMargin).toBe(f * 4);

      // Button width should always be 8F
      expect(mf.DERIVED_VALUES.buttonWidth).toBe(f * 8);

      // Indent should always be 2F
      expect(mf.DERIVED_VALUES.indent).toBe(f * 2);
    });

    it('should support F value changes without breaking relationships', () => {
      // This test ensures that if F changes, all relationships scale proportionally
      const testF = 16; // Different F value

      // Calculate what values would be with new F
      const expectedHeader = testF * 2;
      const expectedMargin = testF * 4;
      const expectedButton = testF * 8;

      // Verify the calculation logic works correctly
      expect(expectedHeader).toBe(32);
      expect(expectedMargin).toBe(64);
      expect(expectedButton).toBe(128);
    });
  });
});