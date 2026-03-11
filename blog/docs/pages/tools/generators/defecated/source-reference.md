# Defecated — Source Reference

## Current Owners

- live script: `assets/js/tools/generators/scripts/other/defecated.gen.js` (stub)
- legacy tool: `assets/js/tools/generators/defecated-tool.js` (full ToolBase implementation)
- registry: `assets/js/tools/generators/core/script-registry.js`
- host: `assets/js/tools/generators/core/generative-tool-host.js`

## Archive

- `reference/generators/defecated/source/defecated.gen.js` — identical to live stub

## Legacy Docs

None under `reference/generators/defecated/legacy-docs/`.

## Classification

- live gen script: `stub/placeholder` — fills black; `param` slider is inert
- archive gen script: `stub/placeholder` — identical to live
- `defecated-tool.js`: `functional source` — complete ToolBase implementation with WebGL shader, Google Fonts, and iframe rendering

## Implementation Status

**Not implemented** in the generator system. The full implementation exists only as a legacy ToolBase tool (`defecated-tool.js`). Migration from ToolBase iframe architecture to the standard SCRIPT_CONFIG/generative-tool-host system has not been performed. The comment in the stub reads: "TODO: Extract from defecated-tool.js".
