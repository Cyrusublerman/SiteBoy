# Composite Components Audit — Generators

Date: 2026-06-03. Scope: read-only. Authority: `composite-components.md`, `border-system.md`, `text-treatment.md`, `design-law.md`.

Pipeline source: [parameter-builder.js](../../assets/js/tools/generators/core/parameter-builder.js) → ToolBase blocks. Modulation components registered in [tool-base.js](../../assets/js/tools/core/tool-base.js) but not emitted by parameter-builder v4.

---

## Rubric (§8 checklist mapped)

Each target scored against composite-components §8:

| # | Check | Source |
| --- | --- | --- |
| A | One outer Partition; `gap: 0` inside | I1 |
| B | Internal lines `1px`, single owner; no `2px` joins | I2, I6; border-system §6 |
| C | Horizontal dividers `border-left`; vertical `border-top` (one convention) | I3, I4 |
| D | Embedded primitives suppress container/neighbour edges | C1 |
| E | Stack edge toggleable; default ON; flush sets OFF after first | §5, C1 |
| F | F-derived sizes; interactive rows `2F`; outer height includes borders | I7 |
| G | State by inversion; error by accent on one owned edge | I8; design-law §14 |
| H | Cross-cell sync via `setValue(v, false)`; no feedback loop | C3 |
| I | No margin for spacing | I9, C5 |
| J | Title div (if label): `1.5F`, `padding 0 F/2`, UPPERCASE `F×0.75`, topBorder | §4 step 7 |
| K | Parameter labels / cells: UPPERCASE `F×0.75`, `padding 0 F`, left, `2F` height | text-treatment §2, §8 |

Verdict: **PASS** | **FAIL** | **N/A** (primitive, not multi-cell Composite).

---

## Part 1 — Existing composites

### ExpressionParam (reference A)

File: [ExpressionParam.js](../../assets/js/shared/components/input/ExpressionParam.js). Class: **Composite**. Generator: PARAMS tab (`slider`/`number` params).

- A PASS — title + control box; `gap: 0` (L150–154, L197–204).
- B PASS — toggle first cell no border; Slider `borders.left` only; NumericInput `embedded` (L261, L282).
- C PASS — horizontal stack in control box (§4).
- D PASS — Slider/NumericInput suppress outer edges when nested.
- E PASS — `topBorder` + `setTopBorder()` (L123, L431–435); parameter-builder sets `false` after first.
- F PASS — control box `height: 2F+2px` (L202); title `1.5F` (L164).
- G PASS — toggle/expression mode by inversion (L377–378); expr error accent on `border-left` (L347).
- H PASS — `_onStaticChange` uses `setValue(v, false)` on siblings (L298–299).
- I PASS — no margin on outer element.
- J PASS — title `padding: 0 F2` (L165); label UPPERCASE `F×0.75` (L173–176).
- K N/A — no item rows; subcomponents own cell typography.

**Overall: PASS** (reference implementation).

---

### ToggleGroup (reference B)

File: [ToggleGroup.js](../../assets/js/shared/components/input/ToggleGroup.js). Class: **Composite**. Generator: PARAMS (`toggle`/`radio`), POST (`toggle` on/off).

- A PASS — items container bordered partition; `gap: 0` (L58–61, L100–108).
- B PASS — list `border-top` on index>0; row/grid `border-left`; container owns outer box (L218–234).
- C PASS — layout-specific divider ownership (L218–234).
- D PASS — `embedded` suppresses outer box, keeps `border-left` (L198–206).
- E PASS — `topBorder` + `setTopBorder()` (L39, L259–268); forwarded by tool-base; parameter-builder flush wiring.
- F PASS — item cells `height: 2F` (L124).
- G PASS — selection/hover by full-row inversion (L243–246); no custom-box glyph.
- H PASS — `getValue`/`setValue`/`onChange`; exclusive + multi-select preserved.
- I PASS — no margin.
- J PASS — title `1.5F`, `padding 0 F2`, UPPERCASE `F×0.75` (L73–82).
- K PASS — items `padding 0 F`, UPPERCASE `F×0.75`, left (L125–131).

**Overall: PASS**.

---

### Slider (embeddable primitive)

File: [Slider.js](../../assets/js/shared/components/input/Slider.js). Class: **Embeddable primitive** (not Composite). Generator: composed inside ExpressionParam, NumericInput, AnimateParamControl.

- A N/A — single `<input type="range">`.
- D PASS — `borders` option → `--slider-bd-*` (L45, L76–79).
- E N/A — per-edge `borders`, not `topBorder` (container owns stack edge).
- F PASS — `--slider-track-h`, `--slider-thumb-w/h` F-derived (L65–75).
- H PASS — `setValue(val, triggerChange=false)` (L97–100).
- C3 PASS — `getValue`, `onInput`, `onChange`.

**Overall: PASS** (primitive contract).

---

### NumericInput

File: [NumericInput.js](../../assets/js/shared/components/input/NumericInput.js). Class: **Composite** (standalone + embedded). Generator: OUTPUT Size block (`number` → field-only); POST Strength (`slider` → both); embedded inside ExpressionParam.

Standalone / generator use:

- A **FAIL** — outer `gap: F2` between label and control row (L97).
- B **FAIL** — `both` mode: slider `marginRight: F2` (L148) separates slider from stepper group instead of shared boundary.
- C **FAIL** — standalone stepper group: each cell four-sided border via `_cellBorderCss`, not horizontal stack with container-owned outer box (L258–272).
- D PASS — `embedded: true` drops outer box, `border-left` dividers only (L258–265).
- E **FAIL** — no `topBorder`/`setTopBorder()`; cannot flush-stack in Size/Post blocks.
- F **FAIL** — label row not `2F`; label `font-size: F` not `F×0.75` (L109).
- G PARTIAL — stepper hover inverts (L242–248); no error-edge pattern.
- H PASS — `setValue(val, triggerChange)` (L387–396).
- I **FAIL** — slider `marginRight: F2` (L148).
- J **FAIL** — label not attached title div; plain span at `F`, not UPPERCASE `F×0.75` (L102–114).
- K **FAIL** — field `text-align: right` ok for numeric; stepper/field `font-size F×0.75` ok; but standalone layout breaks partition law.

**Overall: FAIL** (embedded mode PASS; standalone generator use FAIL).

---

### Dropdown

File: [Dropdown.js](../../assets/js/shared/components/input/Dropdown.js). Class: **Composite** (trigger + portal menu). Generator: Presets block, legacy Palette background, any `dropdown`/`select` param.

- A **FAIL** — `gap: F2` between label and trigger (L70); label and trigger are loose siblings, not one partition.
- B PARTIAL — menu uses `border-top: none` when anchored (L148) per §9; items use `border-bottom` with last removed (L202–214) — inverted from §3 `border-top` convention.
- C N/A — menu is overlay (§9); trigger is single cell.
- D N/A — not designed for nesting.
- E **FAIL** — no `topBorder`/`embedded`; breaks flush column when mixed with ExpressionParam/ToggleGroup in same block.
- F **FAIL** — menu items `height: F×2−1` (L172, L199); trigger/menu `font-size: F` (L99, L208).
- G **FAIL** — disabled trigger uses `opacity: 0.5` (L107), not inversion/accent-edge (text-treatment §6).
- H PARTIAL — `setValueSilent` exists (L425) but no `triggerChange` param on `setValue`.
- I PASS — no margin on outer.
- J **FAIL** — label separate, `font-size: F`, not UPPERCASE `F×0.75` (L78–82).
- K **FAIL** — trigger `font-size: F`; should be `F×0.75` (L99).

**Overall: FAIL**.

---

### ColorInput

File: [ColorInput.js](../../assets/js/shared/components/input/ColorInput.js). Class: **Composite** (picker + hex [+ swatches]). Generator: any `color` param.

- A **FAIL** — column `gap: F2` (L33); row `gap: F2` between picker and hex (L52); swatch row `gap: F2` + `margin-top: F2` (L118–119).
- B **FAIL** — picker and hex each four-sided `border`; no shared partition (L63, L86).
- E **FAIL** — no `topBorder`/`embedded`.
- F PARTIAL — cells `2F` height (L61, L84); label not `1.5F` title row.
- G N/A — no hover inversion on row.
- H PASS — `getValue`/`setValue` (L146–154); no `triggerChange`.
- I **FAIL** — swatch row `margin-top: F2` (L119).
- J **FAIL** — label `font-size: F`, not UPPERCASE `F×0.75` (L39–43).
- K **FAIL** — hex `font-size: F` (L90).

**Overall: FAIL**.

---

### EasingCurveInput

File: [EasingCurveInput.js](../../assets/js/shared/components/input/EasingCurveInput.js). Class: **Composite** (header + expandable editor). Generator: `easing-curve` params (if declared).

- A PARTIAL — outer `border: 1px` (L132) but header `gap: F2` (L140); editor `gap: F2`, `padding: F` (L205–206).
- B PARTIAL — header `border-bottom` + outer border; native `<select>` inside header has own four-sided border (L161) — nested box, not flush cell.
- E **FAIL** — no `topBorder`/`setTopBorder()`.
- F **FAIL** — label/select `font-size: F` (L151, L165); header padding `F2 F` not `0 F` cell template.
- G N/A — expand via chevron, not inversion on header click.
- H PASS — `getValue`/`setValue` (L366–377).
- I PASS — no margin on outer.
- J **FAIL** — label inline in header at `F`, not attached title div at `F×0.75`.
- K **FAIL** — native select not UPPERCASE `F×0.75` row template.

**Overall: FAIL**.

---

### PaletteRow

File: [PaletteRow.js](../../assets/js/shared/components/input/PaletteRow.js). Class: **Composite** (5-column grid). Generator: OUTPUT Palette block (one row per colourway layer).

- A **FAIL** — grid has no outer partition border; only `border-bottom` per row (L48); columns separated by individual four-sided borders on each input (L73, L95, L134, L163), not `border-left` stack.
- B **FAIL** — each cell draws full box → double visual weight vs shared-boundary model.
- E **FAIL** — no `topBorder`; rows in Palette block not flush-stacked.
- F **FAIL** — row `2F` but inner controls `1.5F` (L71–72, L93); label `font-size: F` (L56).
- G **FAIL** — mod chip enabled state uses `var(--c-accent)` text/border, not inversion (L163–165).
- H PARTIAL — no `getValue`/`setValue`; emits `onChange(layerId, patch)` only.
- I PASS — no margin.
- J N/A — label is in-grid column, not title div.
- K **FAIL** — label `font-size: F`; hex/width `font-size: F`; padding `F×0.5`, `F×0.25` (L59, L94, L133).

**Overall: FAIL**.

---

### ModulatorPanel

File: [ModulatorPanel.js](../../assets/js/shared/components/input/ModulatorPanel.js). Class: **Composite** (multi-section panel). **Wiring: registered in tool-base; NOT emitted by parameter-builder v4** (ANIMATE tab removed).

- A **FAIL** — section rows `gap: F×0.5`, `padding: F×0.25 F` (L299–301); not `gap: 0` cells.
- B PARTIAL — sections use `border-top` (L279); header row `border-bottom` (L85) — mostly consistent.
- E **FAIL** — no `topBorder`/`embedded`.
- F **FAIL** — labels `_label()` at `font-size: F` (L311); section headers ok at `F×0.75` (L287).
- G **FAIL** — checkbox enable state, no row inversion.
- H PASS — `_emit()` on change; `setModulator` re-renders.
- I **FAIL** — `marginLeft` on labels/checkboxes (L94, L203, L208, L248).
- J N/A — no attached title div pattern.
- K **FAIL** — row internals loose flex, not `2F` bordered cells.

Additional: `_slider()` builds raw `<input type="range">` (L343–349) — violates H7 Slider primitive ownership.

**Overall: FAIL**. **Wiring: dormant** (no generator sidebar emission).

---

### ModulatorChip

File: [ModulatorChip.js](../../assets/js/shared/components/input/ModulatorChip.js). Class: **Primitive chip** (single button, not multi-cell Composite). **Wiring: dormant**.

- A N/A — single cell.
- F **FAIL** — height `1.5F` not `2F` (L57, L69).
- G **FAIL** — enabled mod uses accent colour (L116–117); panel-open uses `var(--c-border)` bg (L121), not inversion.
- I PASS.
- Prohibited: `letter-spacing: 0.05em` (L77).

**Overall: FAIL** (chip primitive, not full Composite). **Wiring: dormant**.

---

### AnimateParamControl

File: [AnimateParamControl.js](../../assets/js/shared/components/input/AnimateParamControl.js). Class: **Composite** (collapsible header + detail). **Wiring: NOT in tool-base COMPONENT_MAP; superseded by ModulatorPanel per comment; dormant**.

- A **FAIL** — detail panel `gap: F2` (L130); row internals `gap: F`/`F2` (L151, L197).
- E **FAIL** — no `topBorder`.
- F **FAIL** — labels `font-size: F` (L99, L157, L177).
- G **FAIL** — enable via checkbox glyph, not inversion.
- H PARTIAL — `setState` syncs UI; no `getValue`.
- I **FAIL** — `margin-bottom: F2` on outer (L68).
- J **FAIL** — label in header at `F`, checkbox not row-inversion pattern.

Uses Slider primitive in detail rows — PASS for slider composition.

**Overall: FAIL**. **Wiring: unregistered / dormant**.

---

### GradientStops

File: [GradientStops.js](../../assets/js/shared/components/input/GradientStops.js). Class: **Composite** (preview + stop list + add). **Wiring: registered; NOT emitted by parameter-builder**.

- A **FAIL** — outer `gap: F×0.5`, list `gap: F×0.25`, stop rows `gap: F×0.5` (L40–41, L52, L94).
- E **FAIL** — no `topBorder`.
- F PARTIAL — add button `2F`; stop row controls `1.5F`.
- G N/A.
- H PASS — `setStops`; emits `onChange`.
- I PASS.
- Additional violations: preview uses CSS `linear-gradient` (L176) — design-law gradient prohibition; raw `<input type="range">` per stop (L99–106) — not Slider primitive.

**Overall: FAIL**. **Wiring: dormant**.

---

## Part 2 — UI grouping survey (implicit composites)

Block rendering: non-`flush` blocks use `gap: F2` + padding `F` ([tool-base.js](../../assets/js/tools/core/tool-base.js) L1104–1118). Param groups use `flush: true` (parameter-builder L74–76).

### P1 — Presets block (Presets / Controls)

**Logical unit:** preset selector + randomise + reset.  
**Current:** three siblings — `Dropdown` + two `Button`s — in non-flush block → `F2` gap, block padding `F`, each control owns its own border.  
**Verdict:** **Promote** — `PresetToolbar` Composite: horizontal partition `[ dropdown | RANDOMISE | RESET ]` with `border-left` dividers, `gap: 0`, or vertical stack with shared boundaries matching Presets UX intent.

### P2 — Size block (OUTPUT)

**Logical unit:** canvas width × height pair.  
**Current:** two standalone `NumericInput` (field-only) with `F2` gap.  
**Verdict:** **Promote or flush-stack** — either `CanvasSizePair` Composite (one partition, two cells) or make NumericInput Contract-compliant and set `topBorder: false` on second + `flush: true` on block.

### P3 — Post block (OUTPUT, opt-in)

**Logical unit:** per effect — on/off toggle + strength slider.  
**Current:** `ToggleGroup` (composite) + `NumericInput`/`slider` both per effect; block not flush; `F2` gap between toggle and strength.  
**Verdict:** **Promote** — `PostEffectRow` Composite: `[ ON | OFF | ───o─── | field ]` or toggle row + embedded NumericInput flush below with `topBorder` wiring.

### P4 — Mixed param groups (PARAMS)

**Logical unit:** heterogeneous params in one collapsible group.  
**Current:** `flush: true` but only `expression-param`/`toggle`/`radio`/`checkbox` get `topBorder: false` after first. `dropdown`, `color`, `easing-curve` are **not** Contract-aware → they insert `F2` visual breaks and independent borders in an otherwise continuous column.  
**Verdict:** **Extend Contract** to non-compliant types OR wrap each in a flush-capable Composite before mixed stacking. Already flagged in H7 sub-task; audit confirms gap.

### P5 — Palette block (OUTPUT)

**Logical unit:** colourway layer table.  
**Current:** N × `PaletteRow`; each row `border-bottom` only; block non-flush → `F2` between rows.  
**Verdict:** **Promote** — `PaletteTable` Composite: outer partition, rows as cells with `border-top` dividers, `topBorder` on first row only; refactor PaletteRow cells to horizontal stack (I3).

### P6 — Controls block (no presets)

**Logical unit:** reset only.  
**Current:** single `Button`.  
**Verdict:** **No promotion** — discrete action, correctly standalone.

---

## Summary — FAILs by severity

**P0 (breaks generator flush column)**
- Mixed PARAMS groups: `Dropdown`, `ColorInput`, `EasingCurveInput` not Contract-aware in flush blocks (Part 2 P4).

**P1 (pipeline composites, user-visible)**
- `NumericInput` standalone — Size + Post blocks.
- `Dropdown` — Presets + select params.
- `ColorInput` — color params.
- `PaletteRow` — Palette tab.

**P2 (pipeline, less common)**
- `EasingCurveInput` — easing params (if used).

**P3 (dormant / future modulation)**
- `ModulatorPanel`, `ModulatorChip`, `AnimateParamControl`, `GradientStops` — not in generator sidebar v4; multiple violations; ModulatorPanel uses raw range inputs.

**PASS**
- `ExpressionParam`, `ToggleGroup`, `Slider` (primitive).

---

## Promotion candidates (Part 2)

| ID | Name | Block | Priority |
| --- | --- | --- | --- |
| PC1 | PresetToolbar | Presets | P1 |
| PC2 | CanvasSizePair | Size | P1 |
| PC3 | PostEffectRow | Post | P2 |
| PC4 | Contract extension | dropdown/color/easing | P0 |
| PC5 | PaletteTable | Palette | P1 |
