# 02 — Minimalism and Redundancy

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
Part of: [assessment 2026-03-12/](.)

---

## Complaint Passages

> "the one in side bar doesnt need to exist"
> "the descriptive text is redundant and therefore violation"
> "there are 2 close buttons which is idiotic. the smaller one should be removed"
> "some of the modules have 'module' in their name which is redundant"
> "what does 'preview' actually do?"

---

## 1. The Minimalism Principle: A Formal Statement

`design-law.md §2.8` states:

> "If an element neither exposes content, signals state, nor enables action, it should not exist."

This is the system's most direct statement of informative minimalism. It defines element existence as conditional on one of three justifications:

1. **Exposes content** — presents information the user needs that is not available elsewhere
2. **Signals state** — communicates the current status of something that can change
3. **Enables action** — allows the user to trigger a change

An element that satisfies none of these three conditions is structural noise. It occupies space, directs attention, and imposes cognitive load without return. In a system where all visual weight is earned through partition depth and boundary structure (not decoration), a redundant element is more than aesthetically unpleasant — it actively corrupts the information architecture by implying that the space it occupies carries meaning it does not carry.

The corollary: redundancy is a violation not because it is ugly but because it is deceptive. A user encountering a sidebar source readout alongside a toolbar source cell has no reason to know they carry identical information. They may spend time looking for a difference. They may form a mental model in which the two serve different purposes. The system has lied to them through structure.

---

## 2. Instances of Redundancy in the Distort Build

### 2.1 Dual Source Information

The sidebar SOURCE block contains `_sourceReadout` — a div displaying the loaded image name. The toolbar SOURCE cell also displays the image name. Both update from the same datum (`this._sourceName`). Neither element exposes unique content.

The sidebar element does not signal any state the toolbar element does not already signal. It enables no action. By §2.8, it must not exist.

The more interesting question is why it was built. The likely answer: the sidebar SOURCE block felt empty without content — the guide pattern shows `TAB → BLOCK → COMPONENT` and an empty block is structurally awkward. Rather than recognising that the source information belongs in the toolbar rail (which is where source interaction is initiated), the builder filled the block with a redundant readout.

This suggests a process gap: the guide pattern for blocks implies that every block should have components. A builder following that pattern may feel compelled to populate blocks even when the correct answer is that the information already lives elsewhere.

### 2.2 Stack Placeholder Text

When the effect stack is empty, `EffectStack` displays:

> "ADD AN EFFECT TO BUILD THE PIPELINE"

The add button immediately above reads: `+ ADD EFFECT`

The placeholder text duplicates the instruction already given by the button. It does not add clarification, contextualise the pipeline concept, or explain what happens after adding an effect. It is a longer restatement of the button's intent — which the button already communicates adequately.

By §2.8, the placeholder text exposes no content (the button already gives the instruction), signals no state (the empty state is already communicated by the absence of stack items), and enables no action. It does not exist for a functional reason; it exists because empty space felt uncomfortable.

This is a recurring anti-pattern: filling visual gaps with text that restates what a nearby element already communicates. The guide does not explicitly prohibit this pattern by name, which is why it persists.

### 2.3 Two Close Buttons

When the `CategoryPicker` is open, the user sees:
- The `EffectStack` add button, now labelled `× CLOSE` (to collapse the picker)
- The `CategoryPicker` header's own `× CLOSE` button (to close the picker)

Both perform the same action. The user has no reason to prefer one over the other. Neither carries additional context. The picker-internal close button was likely added because UI conventions often show a close button within a panel — but in this system, the add button already serves that role. The picker-internal button is redundant.

By §2.8: the picker's internal close button enables an action — but that action is already enabled by an element in view. Enabling an already-enabled action is not a sufficient justification for existence under a strict reading of the minimalism principle.

### 2.4 "Module" in Module Names

Some entries in the effect registry include "module" in their label (e.g. `MODULE FLOW LINES`, `MODULE SERPENTINE`). The CategoryPicker is a module picker — every item it displays is, by context, a module. The word "module" within a module picker is a context qualifier that the context already provides. It adds no informational value to the label.

By §2.8: the qualifier "module" in these names exposes no additional content — the picker itself already communicates that these are modules. It is structural noise within the label.

The broader principle: labels should be minimal within their context. Context disambiguates — it eliminates qualifiers that would otherwise be necessary in isolation. A label within a scoped context does not need to re-state the scope.

### 2.5 PREVIEW Button Ambiguity as a Redundancy-Adjacent Problem

The "what does 'preview' actually do?" complaint is primarily a naming and labelling issue (addressed in `03-naming-and-labelling.md`), but it also has a minimalism dimension: if the effect of the PREVIEW/FULL toggle is not self-evident from the label, the label is not exposing state. An element that purports to signal state but fails to do so is not satisfying its §2.8 justification.

This is a stricter reading: it is not enough for an element to technically signal state — it must signal state in a way the user can decode. An opaque state signal is a partially redundant one: it occupies space without delivering the informational value it implies.

---

## 3. Analysis: Is the Principle Sufficient?

The principle in §2.8 is correct. It is stated with sufficient generality to cover all the above cases. A builder who applied it rigorously before each element would not have produced these violations.

The gap is not in the principle's content — it is in when the principle is applied.

The current process applies §2.8 as a passive filter: if someone reviews the build and notices a redundant element, the principle gives grounds for removal. But the builder is not required to actively demonstrate §2.8 compliance for each element before implementing it. There is no step in the build process that says: "for this element, state which of the three conditions (content / state / action) it satisfies, and prove that no existing element already satisfies it."

Without that active demonstration requirement, redundancy can accumulate undetected. The builder knows §2.8 exists but applies it as "obviously this element is justified" without formal proof. This is exactly the failure mode: elements are built because they feel necessary, not because they are proven necessary.

---

## 4. The Redundancy Anti-Pattern Taxonomy

Based on the distort build, redundancy takes the following forms:

**Type 1 — Spatial duplication.** The same datum appears in two locations (dual source info). Cause: the builder followed a structural pattern (blocks should have components) without checking whether the datum already existed elsewhere.

**Type 2 — Instructional restatement.** Text restates an instruction already conveyed by a nearby interactive element (placeholder text duplicating button label). Cause: discomfort with visual emptiness; assumption that empty space needs to be filled with explanation.

**Type 3 — Action duplication.** Two elements trigger the same action (two close buttons). Cause: following UI conventions from other systems (panels have close buttons) without checking whether the action is already afforded in the current context.

**Type 4 — Context re-qualification.** Labels include qualifiers that the surrounding context already provides ("module" in a module picker). Cause: labels written in isolation from their context; no process step requiring label review within context.

**Type 5 — Opaque state signal.** An element signals state but the signal is not decodable (PREVIEW/FULL). Cause: mode names chosen for brevity without considering user comprehension; no labelling standard requiring consequence-disclosure.

---

## 5. What Needs to Exist

The minimalism principle needs an active process gate, not just a passive standard. Before any element is implemented, the builder must answer in writing:

1. Which of the three conditions (content / state / action) does this element satisfy?
2. Is there any existing element that already satisfies the same condition with the same datum?
3. Is the element's label or signal decodable by a user who has not read the codebase?

If question 2 yields a "yes", the element must not be implemented. If question 3 yields a "no", the label must be redesigned before implementation.

This gate is straightforward to apply and would have prevented all five redundancy instances in the distort build. Its absence is the direct cause of each violation.
