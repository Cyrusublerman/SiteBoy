# Coding Standards (SiteBoy)

- **Ownership:** Use SSoT map: BaseComponent/tool UI only in core/shared tools; algorithms only in `assets/js/shared/algorithms/`; styling in `assets/css/styles.css`.
- **Animation:** AnimationFoundation only; destroy animators; no RAF/setInterval for animations.
- **Loading:** AssetLoader for tools/deps/exports; no direct script tags; exports via ToolBase.
- **DOM:** No document/window DOM ops outside BaseComponent internals; no inline styles; ComponentLibrary only.
- **Layout:** F-system only for dimensions; sidebar 30F; control height 2F; gaps F or F/2.
- **Color:** UI uses `var(--c-*)`; canvas uses VGA palette only.
- **Nomenclature:** Tabs UPPERCASE; blocks Title Case; keys camelCase; files kebab-case; classes PascalCase.
- **Modules:** Reuse shared-utilities/algorithms before writing new helpers; no duplicate functions.
- **Comments:** Only for non-obvious logic; ASCII only.
- **Exports:** Use ToolBase animation/export config; no ad-hoc JSZip/RecordRTC loading.

