# Defecated — Migration Log

## Status

**Not implemented** in generator system. Live script is a placeholder stub. Full implementation exists as `defecated-tool.js` (ToolBase, iframe-based P5 WebGL). Three architectural host extensions are required before migration is possible.

## Source of Truth for Intended Behaviour

- `assets/js/tools/generators/defecated-tool.js` — complete implementation reference
- TOOL_CONFIG contains all parameter definitions, timing, and shader logic

## Architectural Prerequisites (must complete before migration)

1. **[BLOCKER] Add `context: 'webgl'` support to generative-tool-host** — host must create a WebGL canvas and pass `gl` context (or a P5 WebGL instance) to the draw function. Current 2D and P5 2D contexts are insufficient.
2. **[BLOCKER] Add `text` input type to SCRIPT_CONFIG parameter system** — free-text inputs required for `line1`, `line2`, `line3`. Alternatively, expose a set of preset strings via `dropdown`.
3. **[BLOCKER] Resolve non-determinism** — decide whether to accept infinite/non-deterministic output (no pre-render, no export beyond PNG) or redesign font selection as seeded/parameterised.

## Migration Steps (after prerequisites)

1. Port GLSL shader from template string in `defecated-tool.js` to a `draw` function using the WebGL context.
2. Port `calculateSizes`, `drawTextToGraphics` to the generator context.
3. Port font queue management (shuffle, advance, swap buffers).
4. Define SCRIPT_CONFIG parameters: text lines, layout sliders, timing sliders.
5. Decide on font set: embedded subset vs external CDN (offline viability).
6. Remove iframe/ToolBase architecture.
7. Add `export: { png: true }` — static snapshot only; GIF/WebM not viable without pre-render.
8. Test with host P5 WebGL or raw WebGL context.

## Open Items

1. **[BLOCKER] Host WebGL context** — see prerequisites.
2. **[BLOCKER] Text input type** — see prerequisites.
3. **[HIGH] Decide font delivery** — CDN vs bundled subset vs CSS-variable-selected system fonts.
4. **[MEDIUM] Offline-first design** — replace Google Fonts CDN dependency.
5. **[LOW] Deterministic font sequence** — optional; use param-seeded shuffle for reproducibility.
