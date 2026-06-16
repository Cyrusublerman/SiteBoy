# Tool Page Standards

Minimum functional requirements for SiteBoy tools.

Authority:
- `blog/docs/guides/standards/design-law.md` — visual and geometric law
- `blog/docs/site/ui-interface-overview.md` — page structure and standard tool organisation

This file defines feature minimums only. It does not own spacing, typography, border, or colour law.

---

## 1. Minimum Functionality by Output Type

### 1.1 Canvas or Image Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Canvas sizing | Yes | width/height controls |
| Zoom/Pan | Yes | canvas viewport config |
| Display modes | Yes | fit/fill/actual |
| Export PNG | Yes | export action |
| Export SVG | If vector | export action |
| Clear or Reset | Yes | button |
| Background colour | Optional | colour control only when output semantics require it |

Canvas integration rule:
- zoom, pan, and display mode belong to the canvas system, not custom per-tool transform code

**Exception — fillContainer canvas sizing:** Tools using `fillContainer: true` with `enableZoom` satisfy the canvas sizing requirement via viewport fill and zoom/pan rather than explicit width/height sidebar controls.

### 1.2 Animation Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Play/Pause | Yes | button or transport |
| Stop/Reset | Yes | button |
| Frame export | Yes | animation export flow |
| GIF/Video export | Yes | animation export flow |
| Frame rate | Yes | FPS control |
| Loop toggle | Yes | toggle |
| Duration display | Yes | status/value display |
| Frame scrubber | Optional | slider |
| Playback speed | Optional | slider |

Animation integration rule:
- playback must use the approved animation foundation, not custom timing loops

### 1.3 Audio Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Play/Stop | Yes | button |
| Volume | Yes | slider |
| Export audio | If applicable | export action |
| Mute toggle | Optional | toggle |
| Waveform display | Optional | output surface |

### 1.4 Data or Calculation Output

| Feature | Required | Typical Component |
| --- | --- | --- |
| Copy to clipboard | Yes | button |
| Export JSON/CSV | If applicable | export action |
| Value displays | Yes | value components |

### 1.5 File Input

| Feature | Required | Typical Component |
| --- | --- | --- |
| File picker | Yes | file input |
| Format info | Yes | label or helper surface |
| Clear/Reset | Yes | button |
| Drag and drop | Optional | file input enhancement |

---

## 2. Tool Composition Rules

1. Use the standard tab and block naming from `ui-interface-overview.md` unless a domain-specific partition is clearer.
2. Keep all controls inside the site partition system defined by `design-law.md`.
3. Do not duplicate shared logic when an existing component, utility, or foundation owns it.
4. Canvas tools draw at `(0, 0)` and let the owning canvas system handle display transforms.
5. Export actions must be explicit and discoverable.
6. A control built from several subcomponents bound into one bordered unit follows `composite-components.md` — one outer border, no gaps, single-owner `1px` dividers, stack-aware per-edge borders.

---

## 3. Reuse and Extraction

Extract shared logic when all are true:
1. It appears in three or more tools.
2. It is non-trivial.
3. It can be tested or reasoned about in isolation.
4. It has a configurable interface.

Do not extract when any are true:
1. It is highly local to one tool.
2. It is simpler inline.
3. It depends too heavily on tool-specific state.

Track candidate utilities in `blog/docs/guides/shared-utilities.md`.

---

## 4. Component Registration

Any component class referenced by a string key in `tool-base.js` `COMPONENT_TYPES` MUST be re-exported from `assets/js/shared/component-library.js`. A component that exists in a file but is not re-exported is invisible to ToolBase and produces a silent render gap (component renders nothing; no error).

Verification: `component-library.js` exports an init-time assertion. If any `COMPONENT_TYPES` entry cannot be resolved, a console error fires on startup identifying the missing key. This is lint-equivalent and blocks undetected breakage.

Rule: add the re-export to `component-library.js` in the same PR as adding the component file. The two changes are not separable.

---

## 5. Custom Code Inputs

Any surface that accepts user-typed code (expression fields, formula inputs, shader entry fields) MUST:

1. Enumerate all available variables, helpers, and constants in a **single source file**.
2. Expose that source as a **contextual cheat-sheet** visible at the input site (popover, tooltip, or adjacent panel).
3. Never document available expressions only in a markdown file; the live source must be the authority.

For generator expression drivers, that source is `assets/js/tools/generators/core/expression-context.js`. The cheat-sheet popover reads directly from its exported `EXPRESSION_CONTEXT_SCHEMA`.

---

## 6. Schema Evolution via Shim

When a script schema changes, backward compatibility is achieved via a normalisation shim inside the schema validation entry point. Per-script files must not be hand-edited for back-compat.

Procedure:
1. Identify the old field(s) and new field(s).
2. Write a migration transform in the schema owner (e.g. `_migrateScriptConfig()` in `script-types.js`).
3. Call the shim *before* validation, so validation always sees the new format.
4. Document the migration in a comment adjacent to the shim.
5. The old field(s) become ignored inputs; do not delete them from existing scripts until confirmed no script uses them.

This rule prohibits "search and replace all scripts" as a migration strategy.

---

## 7. Submission Checklist

### 7.1 Functionality

- [ ] Required features for the output type are present
- [ ] Export actions work
- [ ] Reset or clear path exists
- [ ] Output interaction model works

### 7.2 Consistency

- [ ] Tool layout follows `ui-interface-overview.md`
- [ ] Visual law follows `design-law.md`
- [ ] Standard names are used where applicable

### 7.3 Code Quality

- [ ] No duplicate logic from existing tools
- [ ] No custom zoom/pan when canvas owner already provides it
- [ ] No custom timing loop when animation owner already provides it
- [ ] Shared utilities are reused where applicable

---

End of Tool Page Standards.

