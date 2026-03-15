# 08 — Process Gate Analysis

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "this page was built following the guides and that there were clear violations with the intention of the guides and thus the process must be improved"
> (The volume and variety of violations across the complaint, taken together, constitute evidence that the build process — not individual builder decisions — is the proximate cause.)

---

## 1. The Central Argument

The Distort tool was built following the SiteBoy guide process. The guides existed. The Implementation Gate (`design-law.md §12`) was available. The F-system, design-law, ui-interface-overview, and tool-standards were all present and referenced. The architecture — BaseComponent, AnimationFoundation, ComponentLibrary — was correctly employed.

Despite this, the tool contains:
- 5 partition/boundary violations
- 5 redundancy violations
- 5 naming/labelling violations
- 4 missing state treatments
- 4 responsive failures
- 3 overlay/dropdown structural violations
- 3 signifier misuses

These are not edge cases. They are not obscure corner conditions of the design system. They are central violations of the most fundamental principles: partition law, informative minimalism, systemic inheritance, F-system compliance.

The conclusion is unavoidable: correct principle knowledge, correctly applied at the level the current guides require, is not sufficient to produce a compliant build. The guides are correct; the process that applies them is broken.

---

## 2. How the Current Process Works

The current build process (as evidenced by the guide structure) is:

1. Read the relevant standards (`design-law.md`, `tool-standards.md`, `ui-interface-overview.md`)
2. Design the tool layout and components
3. Apply the Implementation Gate (`design-law.md §12`) — answer 6 questions before each UI element
4. Build
5. Review (informal — no documented review process exists)

The Implementation Gate questions are:

1. What parent rectangle does this belong to?
2. What shared boundaries justify it?
3. What F-derived rule sizes it?
4. What existing element class is it analogous to?
5. Why is it not floating?
6. Why is its state signalling consistent with the rest of the site?

These are necessary questions. They are also insufficiently precise to catch the violations that occurred.

---

## 3. Why the Gate Failed

### 3.1 Question 1: "What parent rectangle does this belong to?"

A builder placing the EffectStack add button can truthfully answer: "it belongs to the EffectStack container." This is correct. The button is a child of the stack element. The question is satisfied.

But the button has a private four-sided border. The question did not ask "does this element have a private border?" or "is this element sharing its edges with its siblings?" The question about parent membership is answered correctly; the border structure violation is not caught.

**Gap:** The question must be extended to: "Which specific edges of this element are shared with named adjacent elements? Are any of its edges private (not shared)? If yes, why?"

### 3.2 Question 2: "What shared boundaries justify it?"

The export dropdown can be answered: "its top edge is at the toolbar's bottom edge." This is technically true — the dropdown's `top: 100%` positions it at the toolbar's bottom. The builder has identified a shared boundary.

But the dropdown has a private four-sided border, its width is independent of its parent cell, its left and right edges align with nothing, and its bottom edge is unbounded. The question was answered with the one true shared boundary; the three false ones were not audited.

**Gap:** The question must require ALL four edges to be accounted for, not just one.

### 3.3 Question 4: "What existing element class is it analogous to?"

The CategoryPicker search input was labelled `FILTER MODULES`. If the builder asked "what existing element is this analogous to?", they might have identified "a search input" or "a filter input" — but with no documented distinction between these two types, and no signifier catalogue to consult, the builder may have reached for the wrong term without any guide-level signal that they were doing so.

**Gap:** The analogy question cannot be answered meaningfully without a catalogue of existing patterns to compare against. The question requires that the pattern library be complete enough to serve as a reference.

### 3.4 Question 5: "Why is it not floating?"

The export dropdown is floating. A builder following the process must answer question 5 for it. Two possible answers:
- "It is floating because I used `position: absolute`" — the builder recognises it is floating but has no alternative
- "It is not floating because it is in the DOM as a child of the toolbar cell" — the builder confuses DOM membership with visual partition membership

In either case, the question's intent (reject floating elements) is not achieved. A builder who knows the element is floating but has no documented alternative pattern will either proceed anyway (prioritising functionality over compliance) or invent a local solution (which is exactly what happened). A builder who misidentifies the element as non-floating because it is in the DOM will pass the question without detecting the violation.

**Gap:** The question needs a binary test, not a justification: "Does this element have `position: absolute` or `position: fixed`? If yes, it is floating. Floating is prohibited. An authorised non-floating alternative must be used. If no authorised alternative exists, document the gap before proceeding."

### 3.5 Question 6: "Why is its state signalling consistent with the rest of the site?"

The DriverPicker error state (`SYNTAX ERROR`) and idle state (`—`) both use `var(--c-border)` colour. A builder asked question 6 might answer: "the border colour is used for muted/secondary states throughout the site, so using it here is consistent." This is true — border colour is used for muted content. The violation is that both states use the same treatment, making them visually identical.

The question as asked cannot catch this. The question asks whether the state signalling mechanism is consistent with the site — not whether all states of the component are visually distinct from each other.

**Gap:** The question must be extended to: "Does each distinct state of this component have a visually distinct signal? Are any two states currently identical in appearance?"

---

## 4. The Six Structural Process Gaps

Based on the analysis above, six structural gaps exist in the build process. These are gaps that would exist even if the builder correctly answered every current guide question.

### Gap 1: No Pre-Implementation Element Justification

No step requires the builder to demonstrate, in writing, that each new element satisfies `§2.8` (content / state / action) and that no existing element already satisfies the same condition.

The result: redundant elements are added because they feel necessary, not because they are proven necessary.

**Required addition:** Before each element is implemented, a two-question audit: (1) which of the three conditions does it satisfy? (2) does any existing element already satisfy the same condition with the same datum?

### Gap 2: No Boundary Completeness Requirement

No step requires the builder to account for all four edges of each element. The Implementation Gate asks about shared boundaries but accepts a partial answer.

The result: elements with three unshared edges and one shared edge pass the gate. Floating panels, incomplete border sets, and double borders accumulate.

**Required addition:** A four-edge boundary audit for every visible element. Each edge must be identified as either (a) shared with a named adjacent element or (b) justified by the brief. An element with any unjustified edge fails.

### Gap 3: No Analogy-First Requirement

No step requires the builder to document the analogous existing element before designing a new one. The gate asks "what is analogous?" but does not require that the new element's implementation be derived from the analogous one.

The result: builders identify analogues but do not inherit from them. Collapsible sections, list items, and toolbar cells each have precedents in the system that the distort build diverged from.

**Required addition:** Before designing a new element, identify the closest analogous element in the existing system. Document: (a) what the analogous element does, (b) how the new element differs, and (c) whether the difference is justified by the brief or by an extension of the general law. If the difference is a local exception without authority, it must be resolved before proceeding.

### Gap 4: No State Completeness Audit

No step requires the builder to enumerate all states of each interactive component and verify that each state has a distinct visual treatment.

The result: states that were not explicitly considered during design are unhandled. Empty canvas state, DriverPicker error state, and portrait rendering failure are all unhandled states.

**Required addition:** For each interactive component, enumerate all states: uninitiated, loading, active, hover, active-selected, disabled, error. For each state, specify the visual treatment. Verify that no two states have identical visual treatment.

### Gap 5: No Label Semantics Review

No step requires the builder to verify that each label's content is semantically correct and user-decodable. The typography law covers form (case, family, size); no standard covers semantic content.

The result: labels with wrong names (FILTER), opaque modes (PREVIEW), and false signifiers (`▾`) pass the build without detection.

**Required addition:** A label review step that applies (once documented) the labelling standard — verifying that action labels describe consequences, state labels describe operative differences, and signifiers match interaction types.

### Gap 6: No Responsive Verification Requirement

No step in the build process requires the builder to verify portrait mode rendering before the tool is considered complete.

The result: portrait mode breaks and the failure is only detected in post-build review, not during development.

**Required addition:** A mandatory responsive check at three viewport sizes (desktop, tablet portrait, mobile portrait) before any tool is marked ready. All sections must render; all Tier 1 controls must be accessible; all text must be legible.

---

## 5. The Documentation Coverage Gaps

In addition to the six process gaps above, the following concerns have no owning document at all. Violations in these areas cannot be prevented by improving process gates because there is no standard for the gates to check against.

| Concern | Currently undocumented |
|---------|----------------------|
| Signifier conventions | Which glyphs mean what; where they go |
| State taxonomy | Which states must be handled; what each requires |
| Responsive/adaptive standards | Breakpoints, priority tiers, simplification patterns |
| Overlay/dropdown patterns | How temporal surfaces are structured |
| Label semantics | What labels must communicate; vocabulary constraints |
| Collapsible component standard | Default state, visual treatment |
| Contextual information at interaction point | Hover descriptions, annotations |
| Empty/uninitiated state treatment | What components show when unpopulated |
| Toolbar cell division logic | How to divide a toolbar when cells have heterogeneous functions |
| Status-plus-action cell format | `[LABEL: | VALUE or ACTION]` pattern |

Each of these represents a class of decision that builders currently make locally, without reference to a system standard. Each produces local conventions that diverge from each other over time.

---

## 6. The Principle vs Process Distinction

The SiteBoy design system has correct principles. The partition model, informative minimalism, systemic inheritance, F-system scaling, and colour law are well-stated and correctly applied at the level of abstraction at which they are stated.

The system lacks a process that operationalises those principles at the level of implementation detail. Principles describe what the system should be. Process describes how to build it correctly. A system with strong principles and weak process produces correct-looking implementations that contain undetected violations — exactly what the distort build is.

The distort build is not evidence that the principles are wrong. It is evidence that the distance between the principles and their implementation is too large to cross without additional structure.

The required additional structure is:
1. More precise gate questions (boundary completeness, state enumeration, label semantics)
2. An analogy-first step with a documented pattern library
3. A mandatory responsive verification step
4. New standards for the undocumented concerns above

These additions do not change the principles. They give builders the tools to apply the principles correctly without relying on judgement at every step.
