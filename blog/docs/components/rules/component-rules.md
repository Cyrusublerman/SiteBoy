# Component Rules

Compliance summary for component authors.

Authority:
- `blog/docs/guides/standards/design-law.md` — absolute design law
- `blog/docs/components/COMPONENT-REFERENCE.md` — component API

Rules:
- Extend `BaseComponent`; do not perform raw DOM work in tools or sections.
- A component must read as a partition of its parent region, not a floating object.
- Use `F`-system sizing only; no ad-hoc layout pixels.
- Use shared boundaries where possible; avoid private outlines between adjacent regions.
- UI styling uses `var(--c-*)` tokens only.
- No shadows, gradients, rounded corners, glow, or decorative chrome.
- Use the approved animation foundation only.
- Destroy must clean listeners, children, and animators.
- Reuse an existing component or utility before adding a new one.
- If a component needs a local visual exception, update the governing law first or redesign it.

