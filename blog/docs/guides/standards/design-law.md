# SiteBoy Design Law

Absolute authority for SiteBoy visual and interaction form.

If any subordinate document conflicts with this file, this file wins.

Related documents:
- `blog/docs/site/ui-interface-overview.md` — operational layouts and page archetypes
- `blog/docs/guides/tool-standards.md` — tool minimum functionality
- `blog/docs/components/COMPONENT-REFERENCE.md` — component API

---

## 0. Scope

This document owns:
- aesthetic doctrine
- geometric law
- scale law
- typography law
- colour law
- state signalling law
- prohibited patterns

This document does not own:
- component constructor API
- tool-specific workflows
- algorithm behaviour

---

## 1. Terms

| Term | Definition |
| --- | --- |
| Root Rectangle | The page treated as one bounded field. |
| Partition | A child rectangle created by subdividing a parent rectangle. |
| Shared Boundary | One border line jointly owned by adjacent partitions. |
| Floating Element | A visible element that reads as placed on top of the sheet rather than cut from it. |
| PCS | Primary Content Surface. The dominant region of a page. |
| F | Global geometric constant. Base unit = 14px. |
| Local Rule | A sizing, spacing, border, or behaviour rule that applies only to one element or one local case. |

---

## 2. First Principles

### 2.1 Root Rectangle

SiteBoy must read as one rectangle that is recursively subdivided.

### 2.2 Recursive Partitioning

Every visible region must be legible as a partition of its parent region. UI is built by subdivision, not placement.

### 2.3 Shared Boundary

Borders are usually shared boundaries between adjacent partitions, not private outlines around isolated objects.

### 2.4 Deterministic Scale

All size and spacing derive from `F`. A compliant interface can be rescaled coherently by changing `F` once.

### 2.5 Systemic Inheritance

No element may invent its own local visual logic if an analogous element already exists elsewhere. New work must inherit existing law.

### 2.6 PCS Primacy

Each page has exactly one PCS. Secondary regions must visually defer to it.

### 2.7 Functional Hierarchy

Hierarchy is communicated by partition depth, adjacency, case, inversion, and boundary. Decoration is not a hierarchy mechanism.

### 2.8 Informative Minimalism

If an element neither exposes content, signals state, nor enables action, it should not exist.

---

## 3. Geometric Law

### 3.1 Partition Rule

1. Every visible element must belong to a parent rectangle.
2. Every child rectangle must align to the geometry of its siblings.
3. A region that cannot be explained as a partition is invalid.

### 3.2 Boundary Rule

1. Prefer shared boundaries to isolated outlines.
2. Prefer adjacency to empty separation.
3. Use outer margin only at page or major container edges.
4. Internal separation is by shared boundary, not by floating gap.

### 3.3 Floating Prohibition

Floating elements are prohibited unless explicitly required by the brief.

Examples of prohibited float:
- card panels
- detached action buttons
- modal-like chrome when inline partitioning is possible
- sidecars that break the sheet into unrelated objects

### 3.4 Structural Consistency

If one action region is partitioned into cells, analogous action regions should use the same logic unless a stronger system rule requires otherwise.

---

## 4. Scale Law

### 4.1 Global Constant

`F = 14px`.

All compliant dimensions derive from `F`, `F/2`, or an integer multiple of `F`, plus `1px` shared boundaries where required.

### 4.2 Deterministic Ratios

1. Control height defaults to `2F`.
2. Sidebar width defaults to `30F`.
3. Padding and gaps must be expressible through the same token system.
4. No ad-hoc local pixel values for layout logic.

### 4.3 Compliance Test

If changing `F` breaks proportion, alignment, or rhythm, the affected component is non-compliant and must be redesigned.

---

## 5. Typography Law

### 5.1 Family

Use `Space Mono` only unless a future authority document explicitly defines a second family and its scope.

### 5.2 Case Roles

| Role | Case |
| --- | --- |
| Tabs, toolbar cells, node names, parameter labels, select options | UPPERCASE |
| Block titles, section titles | Title Case |
| Body prose, explanatory sentences | Sentence case |
| Status microcopy | lowercase only when intentionally quiet and secondary |

### 5.3 Function

Typography exists to expose structure and state. It must not be used as ornament, atmosphere, or branding excess.

### 5.4 Prohibitions

Prohibited:
- mixed font systems without explicit authority
- decorative weight/size exceptions
- bespoke letterforms for one component
- typographic emphasis used where partition or inversion should solve the problem

---

## 6. Colour Law

### 6.1 UI Surfaces

UI code uses only:
- `var(--c-bg)`
- `var(--c-text)`
- `var(--c-border)`
- `var(--c-accent)`

No raw `hex`, `rgb`, `rgba`, `hsl`, or named colours in UI styling.

### 6.2 Rendered Output

Rendered output may use its own palette only where the owning document allows it. For VGA-bound output, use the restricted VGA palette only.

### 6.3 State Signalling

State is shown by:
- inversion
- shared boundary
- positional change
- explicit value change

State is not shown by decorative colour ramps, glow, shadow, or soft emphasis.

---

## 7. PCS Law

1. Each page type has one PCS.
2. Secondary controls must defer to the PCS in area, contrast, and structural emphasis.
3. Tool pages are canvas-first.
4. Documentation pages are text-first.
5. Gallery pages are media-first.
6. TOC pages are list-first.

If a secondary surface competes with the PCS, the layout is wrong.

---

## 8. Behaviour Law

### 8.1 Inheritance Rule

If an element is created without considering the logic of analogous elements, it is a failure and must be remade.

### 8.2 Exception Rule

If a design need appears to require a local exception, extend the general law first. Do not special-case a component before testing whether the system itself needs a new rule.

### 8.3 Simultaneity Rule

Controls required at the same time should remain simultaneously accessible. Do not hide concurrent tasks behind avoidable tab switches or detached popups.

### 8.4 Inline Preference

Prefer inline expansion, substitution, or subdivision before modal interruption.

---

## 9. Component Validity Test

A component is valid only if all are true:

1. It reads as a partition, not an object.
2. Its borders are structurally justified.
3. Its size derives from `F`.
4. Its spacing derives from the same system as its neighbours.
5. Its typography follows the common law.
6. Its state signalling matches the rest of the site.
7. Its behaviour does not create a local exception without authority.

Any failure blocks adoption.

---

## 10. Prohibited Patterns

Prohibited unless explicitly authorised:
- floating cards
- detached bordered buttons in open space
- unshared outlines between adjacent regions
- decorative gaps that break the sheet
- raw layout pixels outside the `F` law
- multiple competing type systems
- gradient, shadow, glow, blur-chrome, rounded corners
- local one-off spacing conventions
- controls overlaid on a PCS when they can exist as partitions around it
- tool-specific aesthetic rules that override site law

---

## 11. Authority Map

| Concern | Owning Document |
| --- | --- |
| Design law | `blog/docs/guides/standards/design-law.md` |
| UI operational layouts | `blog/docs/site/ui-interface-overview.md` |
| Tool minimum functionality | `blog/docs/guides/tool-standards.md` |
| Component API | `blog/docs/components/COMPONENT-REFERENCE.md` |
| Tool-specific layout contracts | Tool-specific docs such as `blog/docs/components/distort/ui-ux.md` |

Subordinate documents may add local constraints. They may not override this law.

---

## 12. Implementation Gate

Before introducing any UI element, answer:

1. What parent rectangle does this belong to?
2. What shared boundaries justify it?
3. What `F`-derived rule sizes it?
4. What existing element class is it analogous to?
5. Why is it not floating?
6. Why is its state signalling consistent with the rest of the site?

If any answer is unclear, redesign before implementation.

---

End of Design Law.
