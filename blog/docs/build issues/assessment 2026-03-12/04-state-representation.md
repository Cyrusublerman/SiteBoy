# 04 — State Representation

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "if no source is loaded yet there should be text in the canvas area that is the same size as the standard text in a perfectly square box that says 'upload image'. you should be able to drag a file onto this or click to open."
> "what does 'preview' actually do?"
> "if I shrink the window to move into portrait mode the sidebar shits itself and nothing shows in the sections"

---

## 1. The State Problem in This System

A UI component exists in multiple states throughout its lifecycle. The visual treatment of a component at any given moment communicates which state it is in — it tells the user what has happened, what is available, and what is expected of them next. If the visual treatment fails to communicate the current state clearly and distinctly, the user is left to infer — or to guess — what they should do.

`design-law.md §6.3` defines how state is communicated:

> "State is shown by: inversion, shared boundary, positional change, explicit value change."

This is a list of *visual mechanisms* for state signalling. It is not a list of *states that must be handled*. The law defines how to signal state, but never defines which states must be signalled. This is the fundamental gap.

A complete state model for any interactive element requires:

| State | Definition |
|-------|------------|
| **Uninitiated / empty** | Component exists but has not yet received meaningful input |
| **Loading / processing** | Component is working; output is not yet available |
| **Active / populated** | Component has input and is displaying output |
| **Hover** | Pointer is over the element; an interaction is available |
| **Active (selected/on)** | Element is in a chosen state from a set of options |
| **Disabled** | Element exists but its action is not currently available |
| **Error** | Component has received input but cannot process it correctly |
| **Destroyed / removed** | Component no longer exists in the layout |

The current guides cover: **Active** (inversion), **Disabled** (border-colour text), **Hover** (inversion), and partially **Loading** (the ViewportCanvas loading overlay). They do not define or require treatment for: **Uninitiated/empty**, **Error**, or the transitions between states.

---

## 2. State Failures in the Distort Build

### 2.1 Empty Canvas State — No Affordance for Uninitiated State

When `ViewportCanvas` has no source loaded (`!this._result`), the `_draw()` method fills the canvas with `--vga-black` and returns. Nothing else is drawn. The canvas region is visually indistinguishable from a rendered black image.

The user in this state has no affordance:
- No text indicating that the canvas is inactive
- No instruction for how to proceed
- No drag-and-drop target
- No visual difference between "canvas is empty because no source was loaded" and "canvas rendered a black image"

The user's specified correct behaviour is precise:

> "text in the canvas area that is the same size as the standard text in a perfectly square box that says 'upload image'. you should be able to drag a file onto this or click to open."

This defines a specific empty-state affordance:
- A bounded square region (not the full canvas — a specific sub-region)
- Containing the text "UPLOAD IMAGE" at standard text size (F or F×0.75)
- Clickable (opens file picker)
- Drag-and-drop capable (accepts file drop)

This is an entirely reasonable and well-specified requirement. The guides do not require it, so it was not built.

**Guide:** `tool-standards.md §1.5` — file input is required; drag-and-drop is listed as "optional". The empty state itself is not mentioned anywhere.

**[NO GUIDE]:** No standard defines what any component should display in an uninitiated or empty state. This is the most consequential gap in the state documentation.

### 2.2 PREVIEW/FULL — Opaque State Signal

The PREVIEW/FULL toggle signals that the tool is in one of two quality modes. The label changes between these states (explicit value change — one of the permitted mechanisms). The mechanism is correct; the content of the signal is not.

The user's state signal tells them: "you are in PREVIEW mode" or "you are in FULL mode". It does not tell them:
- What PREVIEW mode does differently from FULL mode
- What they are trading off by staying in PREVIEW
- Whether the current render on screen was produced in PREVIEW or FULL mode

A state signal that names a state without describing its consequence is a partial signal. The user knows which state they are in but does not know what being in that state means. This is an error state for the labelling system: the state is technically signalled but functionally undisclosed.

**Guide:** `design-law.md §6.3` — state signalling mechanisms are defined. No requirement exists for the signal to be semantically complete.

**[NO GUIDE]:** No standard requires that the consequence of a state be communicated alongside the state's name. No standard defines the required information density of a state label.

### 2.3 Portrait Mode — Broken Rendering State

When the viewport narrows to portrait threshold, "the sidebar shits itself and nothing shows in the sections." This is an unhandled rendering failure state. The component exists, the state has changed (viewport width), but the component has not adapted correctly. The user sees a component that is neither in its normal state nor in a clearly broken/error state — it is in an intermediate state with no visual signal.

This is an implementation bug but it points to a documentation gap: no standard defines what a component must do when its rendering context changes in a way that would normally be handled by responsive adaptation. There is no "rendering failure" or "context change" state in the guides, and no requirement that components degrade gracefully when their layout assumptions are violated.

**Guide:** `ui-interface-overview.md §5` — portrait mode is a reordering, same F-law. No guidance on what should happen if the reordering fails.

**[NO GUIDE]:** No standard defines a graceful degradation requirement for responsive state changes. No standard defines what a component should render when its layout is broken.

### 2.4 DriverPicker — Error State Indistinguishable from Idle

From the aesthetic review (`distort-ui-aesthetic-review.md`): the `DriverPicker` shows `—` (idle, no expression) and `SYNTAX ERROR: [message]` (invalid expression) both in `var(--c-border)` colour. The two states are visually identical in colour. Only the text content differs.

This is an error state that is presented with the same visual treatment as a null/idle state. A user who has typed an invalid expression receives feedback that looks the same as if they had typed nothing. The signal fails to communicate severity.

**Guide:** `design-law.md §6.3` — state is shown by inversion, shared boundary, positional change, explicit value change. Only the text changes between idle and error — no structural signal distinguishes them.

**[NO GUIDE]:** No standard defines a required visual treatment for error states. No colour, inversion, or boundary pattern is specified for communicating that something is wrong.

---

## 3. Analysis: The Absent State Taxonomy

The design-law covers state signalling mechanisms. It does not enumerate states. This means:

- Builders know how to signal a state they have identified
- Builders have no systematic way to ensure they have identified all states
- No state is required by the guides unless it is mentioned in a specific context (e.g. file input requires clear/reset, implying an "uploaded" state, but not explicitly defining what the "not uploaded" state should look like)

The consequence: states that were not explicitly thought about during build are not handled. The empty canvas state was not thought about because the guides say nothing about it. The error state in DriverPicker was not designed because the guides do not require error states to be visually distinct.

This is a structural documentation gap, not a builder error. The builder correctly implemented the states that the guides and the feature specification required. States that were not required were not implemented.

---

## 4. A Complete State Taxonomy

The following states must be defined for every interactive component in the system. For each state, the guides must specify:
1. Whether the state is required (must be handled) or optional
2. The visual mechanism by which the state is signalled
3. Any required affordances (actions the user must be able to take from this state)

| State | Required? | Current Guide Coverage | Gap |
|-------|-----------|----------------------|-----|
| Uninitiated / empty | Must be defined for any component that can be empty | None | Full gap: no treatment required |
| Loading / processing | Must be defined for async components | ViewportCanvas loading overlay (partial precedent, not documented as a standard) | Partially implemented, not standardised |
| Active / populated | Covered | §6.3 explicit value change | None |
| Hover | Covered | §6.3, inversion pattern | None |
| Active-selected (toggle on) | Covered | Inversion | None |
| Disabled | Partially covered | Border-colour text in aesthetic review | Not formally documented as a required pattern |
| Error | No coverage | None | Full gap: no visual treatment required |
| Context-broken (responsive failure) | No coverage | None | Full gap: graceful degradation not required |

### Empty State Requirements (to be standardised)

For any component that can be in an uninitiated or empty state:

1. The component must visually distinguish its empty state from its populated state
2. If the empty state has a path to a populated state (i.e. the user must do something to provide input), an affordance for that action must be visible within the empty state
3. The empty state affordance must follow the partition model (it must be a structural element of the component, not a floating label or tooltip)
4. If the component is a PCS (canvas), the empty state affordance must be a defined sub-partition of the PCS, sized by F-system rules

### Error State Requirements (to be standardised)

For any component that can receive invalid or unprocessable input:

1. The error state must be visually distinct from the idle/empty state by at least one structural mechanism (not just text content)
2. The error signal must not use the same colour as the idle state
3. Permitted additional mechanisms: inversion of the error region, a persistent border-colour change, or a positional indicator (e.g. a left-border accent)

### Loading State Requirements (to be standardised)

For any component that performs asynchronous processing:

1. The loading state must be visually distinct from the populated state
2. The loading state must not show stale content as if it were current
3. A loading indicator (text or positional) must be present
4. The indicator must use only permitted colours (`var(--c-bg)`, `var(--c-text)`, `var(--c-border)`)
