# Page Compliance Audit — Rule Reference

Index of every rule the audit enforces, mapped to its source guide. The skill never restates rule content; this file only points at it.

## Ownership map (authoritative)

Source: `.cursor/rules/rules.mdc` and `.cursorrules` File Ownership sections.

| Concern | Owner |
| --- | --- |
| Layout math | `assets/js/core/config.js`, `assets/js/shared/layout.js`, `assets/js/core/app.js` (split per rules.mdc) |
| Base OO | `assets/js/shared/foundation.js` (rules.mdc) / `assets/js/core/base-component.js` (.cursorrules) |
| Animation | `assets/js/core/animation-foundation.js` |
| GPU compute | `assets/js/core/gpu-foundation.js` |
| Routing/nav | `assets/js/core/router.js` |
| Bootstrap/init | `assets/js/core/app.js` |
| UI components | `assets/js/shared/component-library.js` |
| Specialised widgets | `assets/js/shared/specialized-components.js` |
| Sections | `assets/js/sections/*.js` |
| Styling | `assets/css/styles.css` |
| Distort GPU dispatch | `assets/js/tools/processors/distort/core/GPURenderPath.js` |
| Distort node shaders | `assets/js/tools/processors/distort/shaders/*.shader.js` |
| Generator UI tab layout | `assets/js/tools/generators/core/parameter-builder.js` |
| Generator schema + validation | `assets/js/tools/generators/core/script-types.js` |
| Modulation engine | `assets/js/tools/generators/core/modulation-engine.js` |
| Driver registry | `assets/js/tools/generators/core/driver-registry.js` |
| Expression context | `assets/js/tools/generators/core/expression-context.js` |

A page may not implement an owned concern. It may only consume it.

## Absolute prohibitions (sweep rule IDs → guide section)

| Rule ID | Description | Guide §|
| --- | --- | --- |
| `DOM-OUTSIDE-BC` | `document.*`, `window.*`, `innerHTML`, `createElement`, `appendChild`, etc. outside `BaseComponent` / `component-library.js` internals | `.cursorrules` Architecture Rules; `design-law.md §10` |
| `RAF-FOR-ANIM` | `requestAnimationFrame` / `cancelAnimationFrame` for animation | `.cursorrules`; `checklists/animation-foundation.md` |
| `TIMER-FOR-ANIM` | `setInterval` / `setTimeout` / `clearInterval` for animation | same |
| `RAW-GPU` | `navigator.gpu`, `getContext('webgl2')`, `GPUDevice`, `WebGLTexture` outside `gpu-foundation.js` | `rules.mdc` Architecture Rules |
| `CONSOLE-LOG` | `console.log(` (must be `window.debugLog(CATEGORY, …)`) | `.cursorrules` Debug Logging System |
| `RAW-COLOUR` | Hex / rgb / rgba / hsl / hsla / named colours in UI styling | `design-law.md §6.1`; `checklists/color-system.md` |
| `NON-F-PIXEL` | Pixel literals other than `1px` border in layout logic | `design-law.md §4`; `checklists/f-system.md` |
| `BANNED-VISUAL` | `border-radius`, `box-shadow`, `text-shadow`, `gradient` | `design-law.md §10` |
| `ROUTING-OUTSIDE-ROUTER` | `pushState`, `popstate`, `location.hash` outside `router.js` | `rules.mdc` Minimal Checks |
| `BASECOMPONENT-DUP` | `class BaseComponent` declared outside its owner | `rules.mdc` Minimal Checks |
| `INLINE-STYLE-CSSTEXT` | `element.style.cssText = ...` or `element.style.<prop> = ...` in tool/section files | `.cursorrules` Inline Styles |

## Checklist files

Source: `blog/docs/guides/checklists/`.

| File | Purpose |
| --- | --- |
| `process-P0.md`–`process-P6.md` | Phase gates per `phases/` |
| `ui-bijection.md` | Param↔control bijection + Distort gates |
| `f-system.md` | Dimension token compliance |
| `color-system.md` | Colour token compliance |
| `duplication-guard.md` | Reuse of shared utilities/algorithms |
| `animation-foundation.md` | AnimationFoundation usage |
| `lazy-loading.md` | AssetLoader registration |
| `export-rules.md` | Export ownership and on-demand loading |
| `component-development.md` | Component nomenclature, exports, docs |
| `algorithms.md` | Source citations and I/O fit |
| `unified-algorithm.md` | Single pipeline architecture |
| `p5-generator.md` | p5 generator constraints |
| `gallery-assets.md` | Gallery asset pipeline |

## Standards files

Source: `blog/docs/guides/standards/`.

| File | Owns |
| --- | --- |
| `coding-standards.md` | Coding rules, AnimationFoundation, AssetLoader, DOM, layout, colour, font sizes, nomenclature |
| `design-law.md` | Visual + geometric law, prohibited patterns, label/state/signifier law, overlay law, toolbar law |
| `border-system.md` | Every border decision (concrete CSS) |
| `semiotics.md` | Every glyph/symbol and DOM structure |
| `text-treatment.md` | Case, size, alignment, padding per context |
| `component-patterns.md` | Component selection, space division, build recipes, density law |
| `tool-standards.md` | Minimum-functionality by output type, composition, registration |
| `p5-generator-standards.md` | p5 script structure, callbacks, frame purity, forbidden patterns |
| `gpu-compute.md` | GPU compute decisions |
| `compute-scheduler.md` | Worker tiering, adaptive resolution |
| `system-map-authoring.md` | System map docs |

## Site files (consulted, not standards)

| File | Purpose |
| --- | --- |
| `blog/docs/site/ui-interface-overview.md` | Standard tool layout, page archetypes, lifecycle |
| `blog/docs/components/COMPONENT-REFERENCE.md` | Component API for selection in §2 of component-patterns |
| `blog/docs/components/index.md` | Component catalog |
| `blog/docs/algorithms/index.md` | Algorithm catalog |

## Hard gates (failing any single item = page-level FAIL)

- Any prohibition in `design-law.md §10`.
- Any "must be N" or "must be YES" answer flipped in any checklist.
- Any DOM/RAF/timer/raw-GPU violation outside its owner.
- Any non-VGA hex / non-`var(--c-*)` colour in UI surfaces (canvas pixel output exempt per `design-law.md §6.2`).
- Any pixel literal in layout logic that is not `1px` border or F-derived.
- Any guide rule contradicted by a user instruction on a specific element overrides the categorical default for that element only (per `design-law.md §13.4` and `§19.2.6`); record as PASS with note.

## Soft items (warnings)

None. Every check is binary. If a check cannot be evaluated, mark N/A and state why.
