# Component Rules

- Extend BaseComponent only; no DOM ops in tools/sections.
- F-system sizing only; no ad-hoc px; control height 2F; gaps F/F2.
- Colors: UI uses `var(--c-*)`; no hex/rgb/hsl; no shadows/rounded corners/gradients.
- No external loads; no RAF/setInterval for animation; AnimationFoundation only.
- Destroy cleans listeners/children; no leaks.
- Reuse before add; check existing components and shared utilities.

