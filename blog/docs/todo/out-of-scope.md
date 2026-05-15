# Out of Scope

Explicit non-goals. Logged here to stop re-discussion. Move a row out only with an ADR in `blog/docs/site/`.

| Item | Reason |
| --- | --- |
| CJK / Arabic scripts in Cursive Glyph Builder | Not in MVP per `pages/tools/utilities/cursive-glyph-builder.md §12` |
| Bezier / anchor editing UI in Cursive Glyph Builder | Not in MVP per spec §12 |
| Multi-library management in Cursive Glyph Builder | Not in MVP per spec §12 |
| Variable-font axis controls | Default instance only per spec Q8 |
| Custom RAF / setInterval in any tool | Forbidden by `.cursorrules` Architecture Rules |
| Raw GPU acquisition outside `gpu-foundation.js` | Forbidden by `.cursor/rules/rules.mdc` Architecture Rules |
| Any markdown file at repo root | Workspace user-rule |
| More than one md file per task without explicit request | Workspace user-rule |
