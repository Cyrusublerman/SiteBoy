The design law is a document of absolute authority. If any subordinate standard document conflicts with it, the law wins. It governs aesthetic doctrine, geometric law, scale law, typography, colour, state signalling, and prohibited patterns.

### First principles

**Root Rectangle.** The page is one bounded rectangle that is recursively subdivided. Every visible element must be legible as a partition of its parent rectangle.

**Shared Boundary.** A border exists because two regions meet — not because one region wants a frame. Borders are shared boundaries between adjacent partitions, not private outlines around isolated objects.

**Deterministic Scale.** All size and spacing derive from `F = 14px`. A compliant interface can be rescaled coherently by changing `F` once. No ad-hoc pixel values for layout logic.

**Floating Prohibition.** Elements that read as placed on top of the sheet rather than cut from it are prohibited unless explicitly required by the brief. No card panels, no detached action buttons, no modals when inline partitioning is possible.

**Informative Minimalism.** If an element neither exposes content, signals state, nor enables action, it must not exist.

**Functional Hierarchy.** Hierarchy is communicated by partition depth, adjacency, case, inversion, and boundary. Decoration is not a hierarchy mechanism.

### Scale law

`F = 14px`. All compliant dimensions derive from `F`, `F/2`, or an integer multiple of `F`, plus `1px` shared boundaries.

| Token | Value | Default use |
|---|---|---|
| Control height | `2F` = 28px | All toolbar cells, sidebar controls |
| Sidebar width | `30F` = 420px | Fixed for all tool pages |
| Body font | `F × 0.75` = 10.5px | All buttons, inputs, labels |
| Heading font | `F` = 14px | Block titles, section headers |

No other font size multiplier is authorised. Visual distinction is achieved by weight, case, or colour — not by a non-standard size.

### Prohibited patterns

The following are prohibited without explicit authorisation:

- floating cards
- detached bordered buttons in open space
- unshared outlines between adjacent regions
- gradient, shadow, glow, blur-chrome, rounded corners
- raw `hex`, `rgb`, `hsl`, or named colours in UI styling
- local one-off spacing conventions outside the `F` system
- controls overlaid on the Primary Content Surface when they can exist as partitions around it
- tool-specific aesthetic rules that override site law

### Component validity test

A component is valid only if all are true:
1. It reads as a partition, not an object.
2. Its borders are structurally justified.
3. Its size derives from `F`.
4. Its typography follows the common law.
5. Its state signalling is consistent with the rest of the site.
6. Its behaviour does not create a local exception without authority.
7. No equivalent element already exists elsewhere in the system.

Any failure blocks adoption.
