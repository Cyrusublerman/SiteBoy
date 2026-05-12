### State taxonomy

Every interactive element must define behaviour for all applicable states:

| State | Definition |
|---|---|
| Uninitiated | Element exists, no user action has occurred, no data present |
| Loading | Computation or IO in progress |
| Active | Normal operation with data present |
| Hover | Pointer over element |
| Active-selected | Active and currently selected or toggled on |
| Disabled | Cannot be activated in current context |
| Error | Operation failed or invalid state reached |
| Context-broken | Cannot function because a dependency is missing |

Undefined states are incomplete implementations. A component with no uninitiated state (a blank viewport, a silent empty list) violates the standard.

### Uninitiated state rule

Every container that accepts user-provided content must show an explicit uninitiated state when empty:
1. The uninitiated state includes an affordance for the next action.
2. The affordance uses an action label, not a passive description.
3. A blank void is not an uninitiated state.

Example: a viewport with no source image displays `UPLOAD IMAGE +` — interactive, not merely descriptive.

### State signalling

State is shown by:
- **Inversion** — background and text colours swap (active-selected tabs, active buttons)
- **Shared boundary** — a new border appears between regions when a state change creates a new partition
- **Positional change** — an element moves (collapsible section expands, dropdown appears below trigger)
- **Explicit value change** — text content changes to reflect new state (`RENDERING...`, `PAUSED`)

State is not shown by decorative colour ramps, glow, shadow, or soft emphasis.

### Loading state

Loading state presents a deterministic text signal (e.g. `RENDERING...`). Spinners and indeterminate animations are prohibited. The loading signal is positioned within the element it represents, not detached.

### Error state

Error state is visually distinct from idle/active state. The border colour changes — `var(--c-accent)` is used if no dedicated error token exists. Error state must not share the same border colour as the idle border.

### Label rules

**Action labels.** Must describe the consequence, not the mechanism. `EXPORT PNG` not `SAVE FILE`. A label that describes no consequence is opaque and must be replaced.

**State labels.** Must be immediately legible without prior knowledge of the system. Opaque state names requiring learning are prohibited. A cyclic toggle displays the current state, not the state that will be entered.

**Context minimalism.** Strip any qualifier that is redundant given the surrounding context. Inside a module picker, "Module" in an item label is known from context — remove it.

**Vocabulary consistency:**

| Correct | Incorrect | Reason |
|---|---|---|
| SEARCH | FILTER | "Filter" reduces an existing set; "search" matches against a query |
| ADD EFFECT | ADD MODULE | The user creates an effect in the stack, not a module |

### Fix verification protocol

When implementing fixes for reported issues:
1. Read the complaint in full. Identify every discrete clause (one sentence = one clause).
2. Each clause maps to one or more specific code changes.
3. No clause may be skipped in favour of easier clauses.
4. After all changes: re-read the original complaint sentence by sentence. For each clause, confirm a code change (file + method + value) exists.
5. User-specified glyphs, labels, or behaviours on specific elements override the guide's categorical defaults.
