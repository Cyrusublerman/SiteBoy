# Coding Standards (SiteBoy)

**Authority:** `design-law.md` (visual law), `ui-interface-overview.md` (layout), `.cursor/rules/rules.mdc` (file ownership).

- **Ownership:** Use SSoT map in `rules.mdc`: BaseComponent/tool UI only in core/shared tools; algorithms only in `assets/js/shared/algorithms/`; styling in `assets/css/styles.css`.
- **Animation:** AnimationFoundation only; destroy animators; no RAF/setInterval for animations.
- **Loading:** AssetLoader for tools/deps/exports; no direct script tags; exports via ToolBase.
- **DOM:** No document/window DOM ops outside BaseComponent internals; no inline styles; ComponentLibrary only.
- **Layout:** F-system only for dimensions (`design-law.md §4`); sidebar 30F; control height 2F; gaps F or F/2.
- **Colour:** UI uses `var(--c-*)` only (`design-law.md §6`); canvas uses VGA palette only.
- **Font sizes:** Only `F × 0.75` (controls) and `F` (headings) are authorised (`design-law.md §13.7`).
- **Nomenclature:** Tabs UPPERCASE; blocks Title Case; keys camelCase; files kebab-case; classes PascalCase (`design-law.md §5.2`).
- **Modules:** Reuse shared-utilities/algorithms before writing new helpers; no duplicate functions.
- **Comments:** Only for non-obvious logic; ASCII only.
- **Exports:** Use ToolBase animation/export config; no ad-hoc JSZip/RecordRTC loading.

