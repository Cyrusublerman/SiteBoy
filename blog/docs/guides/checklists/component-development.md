# Checklist: Component Development

- Reuse checked in docs/catalog/code exports? Y/N
- Extends BaseComponent? Y/N
- F-system sizing only; `var(--c-*)` for UI colors? Y/N
- No external loads; no RAF/setInterval for animation? Y/N
- render/destroy implemented; listeners/children cleaned? Y/N
- Export chain wired: category index → components/index.js → component-library.js? Y/N
- Nomenclature matches patterns (PascalCase class, kebab componentType, camelCase keys)? Y/N
- Docs added/updated in `components/<category>/<Name>.md`? Y/N

