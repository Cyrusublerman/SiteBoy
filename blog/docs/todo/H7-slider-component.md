# H7 — Standalone Slider primitive; replace raw range inputs

**Status**: WIP
**Priority**: P2
**Owner file(s)**: `assets/js/shared/components/input/Slider.js` (new); CSS in `assets/css/components.css`; consumers `NumericInput.js`, `TransportStrip.js`, `ModulatorPanel.js (AnimateParamControl deleted)`
**Blockers**: none
**Blocks**: —
**Last touched**: 2026-06-03

## Goal

One reusable monochrome `Slider` component (`componentType: 'slider'`) owns all `<input type="range">` markup and styling. Track/thumb styling lives in `components.css` only (not inline, not dead `styles.css`). All other components compose it instead of re-rolling raw range inputs.

## Done when

No source file outside `Slider.js` constructs `<input type="range">` for a UI slider, and `ComponentLibrary.create('slider', ...)` returns a working monochrome full-height slider. (`rg "type\s*=\s*'range'|type=\"range\"" assets/js/` resolves only to `Slider.js`, p5 integration excepted.)

## Sub-tasks

- [x] `Slider.js` — `BaseComponent` subclass; F-driven track/thumb via `--slider-track-h` / `--slider-thumb-w`.
- [x] `.slider` pseudo-element rules → `components.css` (`var(--c-*)`, `var(--f)`, no radius).
- [x] Register in `component-library.js` (map + assignment + assertion) and `components/input/index.js`.
- [x] Canonical table row in `component-patterns.md` §2.
- [x] `NumericInput` composes `Slider` (keep `sliderEl` ref for external callers).
- [x] `TransportStrip` fps slider → `Slider`.
- [x] `AnimateParamControl` deleted (superseded by ModulatorPanel; no runtime refs).
- [x] Per-edge border control on `Slider` (`borders` option → `--slider-bd-*`) to avoid double borders when nested.
- [x] Thumb vertical-alignment fix: thumb height = track interior (`--slider-thumb-h`), border carried on input element.
- [x] `NumericInput` reordered to `[ − | field | + ]`; added `embedded` mode (border-left dividers only).
- [x] `ExpressionParam` recomposed: one bordered box = toggle + `Slider` + `NumericInput(embedded, field)`; single-line divisions, no gaps; expression mode swaps to one text cell; toggle state by inversion.
- [x] Title integrated as an attached bordered div above the control box (left+right always; top via `topBorder` option + `setTopBorder()`, per vertical-stack rule §3); shared divider with control box, label row `1.5F`.
- [x] Flush stacking wired: `_blockContentStyle` honours `flush` (gap 0); `parameter-builder` sets `flush: true` on param-group blocks and `topBorder: false` on every expression-param after the first; tool-base forwards `topBorder`.
- [x] Composite pattern formalised in `composite-components.md` and cross-referenced from `rules.mdc` (pre-decision table), `ai-routing-map.md` (§8 + §10), `component-patterns.md`, `border-system.md` §6, `tool-standards.md` §2, both tool-build guides, and `guides/index.md`.
- [x] Mixed param groups (expression-param + toggle/dropdown) flush-stack against non-border-aware components — `CONTRACT_AWARE` extended to `dropdown`/`select`/`color`/`easing-curve`; `tool-base` forwards `topBorder`/`embedded`.
- [x] `ToggleGroup` recomposed as one bordered Partition (Composite worked example B): `gap:0` in list/row/grid; list dividers via `border-top`, row/grid via `border-left`; item rows `2F` / `0 F` / UPPERCASE `F×0.75` left; state by full-row inversion (custom-box glyph removed); attached title div (left+right always, top via `topBorder`/`setTopBorder()`, no bottom); `embedded` per-edge suppression; `getValue`/`setValue`/`onChange` unchanged.
- [x] `parameter-builder` sets `topBorder:false` on every contract-aware component (expression-param + toggle) after the first in a group; `tool-base._parseComponentOptions` forwards `topBorder`/`embedded` for toggle/radio/checkbox.
- [x] Generator composite audit — read-only; findings in `blog/docs/temp/composite-components-audit.md` (2026-06-03).
- [x] `NumericInput` standalone Composite compliance — remove outer `gap:F2`, drop slider `marginRight`, add `topBorder`/`setTopBorder()`, title div + partition box for generator Size/Post use.
- [x] `Dropdown` Composite compliance — one partition (title + trigger), menu §9 borders, `topBorder`/`embedded`, labels `F×0.75`, item rows `2F`, no disabled opacity.
- [x] `ColorInput` Composite compliance — partition picker+hex, `gap:0`, `topBorder`, title div, remove swatch margin.
- [x] `EasingCurveInput` Composite compliance — flush header cells, attached title, `topBorder`, replace nested bordered native select.
- [x] `PaletteRow` Composite compliance — horizontal cell stack (I3), `2F` controls, mod chip inversion or document accent exception, `topBorder` for table flush.
- [x] `ModulatorPanel` Composite compliance (dormant) — `gap:0` rows, compose `Slider` not raw range, remove marginLeft, `topBorder`; wire when modulation returns to generators.
- [x] `ModulatorChip` primitive compliance (dormant) — `2F` height, inversion/accent law, remove letter-spacing.
- [x] `AnimateParamControl` compliance (dormant/unregistered) — remove margin-bottom, `gap:0` detail, title pattern; decide register vs delete.
- [x] `GradientStops` Composite compliance (dormant) — `gap:0`, compose `Slider`, remove CSS gradient preview or relocate to canvas; wire when colour modulators ship.
- [x] PC1 `PresetToolbar` Composite — Presets block: dropdown + Randomise + Reset as one horizontal partition.
- [x] PC2 `CanvasSizePair` Composite or flush NumericInput pair — Size block width×height.
- [x] PC3 `PostEffectRow` Composite — Post block per-effect toggle + strength as one partition.
- [x] PC5 `PaletteTable` Composite — Palette block: outer partition, rows with `border-top` dividers, flush stack.
- [x] Verify on `#tools/generators` + transport strip render (Vite build passes; manual flush-stack visual check recommended).

## Notes / decisions

- Pre-existing transport slider styling was orphaned in dead legacy `styles.css`; not in live modular CSS. H7 re-homes it.
- Border colour normalised to `var(--c-border)` (transport one-off used `var(--c-text)`).
- Box composition border model (border-system §4): container draws full box; every inner cell uses `border-left` only as the divider; no cell draws top/bottom/right when embedded.
- `NumericInput` `both` mode now renders the slider as a bordered box with an `F/2` gap before the stepper group (was a native accent slider) — site-wide visual change to numeric params.
- Composite audit (2026-06-03): `ExpressionParam`, `ToggleGroup`, `Slider` PASS; 8 pipeline/dormant components FAIL; 5 promotion candidates (PresetToolbar, CanvasSizePair, PostEffectRow, Contract extension, PaletteTable). Full rubric + evidence: `blog/docs/temp/composite-components-audit.md`.

## References

- `blog/docs/guides/standards/component-patterns.md` §1–2
- `blog/docs/guides/standards/border-system.md` §2
- `.cursor/rules/rules.mdc` CSS routing
