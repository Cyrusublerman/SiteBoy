# Assessment Summary — 12 March 2026

Source: [complaint-distort_build-120326.md](../complaint-distort_build-120326.md)
All issues in this assessment are traceable to that document.

Assessment files:
- [01 — Partition and Boundary](./01-partition-and-boundary.md)
- [02 — Minimalism and Redundancy](./02-minimalism-and-redundancy.md)
- [03 — Naming and Labelling](./03-naming-and-labelling.md)
- [04 — State Representation](./04-state-representation.md)
- [05 — Responsive and Adaptive Layout](./05-responsive-and-adaptive.md)
- [06 — Overlay and Dropdown Patterns](./06-overlay-and-dropdown-patterns.md)
- [07 — Signifier Placement](./07-signifier-placement.md)
- [08 — Process Gate Analysis](./08-process-gate-analysis.md)

Issue log: [distort-tool-build-issues.md](../distort-tool-build-issues.md)

---

## I. What Happened

The Distort tool was built following the SiteBoy guide process. It contains 25+ identified violations of the design system's core principles. These violations span partition law, minimalism, labelling, state representation, responsive behaviour, overlay structure, and signifier convention.

This assessment was commissioned because the violations exist despite guide compliance. The central question: if the builder followed the process correctly, why did violations occur? The answer is the subject of this document.

---

## II. The System's Core Ideology

Before analysing failure, the system's ideology must be understood precisely. SiteBoy's design system is built on four interlocking principles:

### 1. The Page as a Single Subdivided Rectangle

The page is one rectangle. Every visible region is a partition of that rectangle. Partitions are created by subdivision — by dividing a parent into children that together exhaust the parent. Nothing is placed; everything is cut. This is not a visual preference but an epistemological commitment: it means the position, size, and boundary of every element is derivable from first principles. A page built this way is self-explaining.

### 2. Informative Minimalism

Every element earns its existence by satisfying exactly one of three conditions: it exposes content, it signals state, or it enables action. No element exists for aesthetic, atmospheric, or habitual reasons. This principle enforces a discipline of justification: before anything is built, its reason for existence must be provable.

### 3. Systemic Inheritance

No element invents its own visual logic. All new work inherits from analogous existing work. The system is coherent because every new element is derived from existing law — not from the builder's local preferences. This means the system's visual logic compounds rather than fragments over time.

### 4. F-System Determinism

All dimensions derive from F (14px), F/2 (7px), or integer multiples of F. The system is rescalable by changing one constant. An element whose dimensions cannot be expressed in F-terms is not compliant.

These four principles are mutually reinforcing. Partition law gives geometry. Informative minimalism gives content policy. Systemic inheritance gives consistency. F-system determinism gives scale. Together they constitute a visual logic that is coherent, predictable, and derivable — the opposite of the accumulation of local decisions that produces typical UI inconsistency.

---

## III. Are the Principles Expressed Adequately in the Documentation?

The principles above are correctly stated in the guides. `design-law.md` covers all four. The F-system document provides the implementation detail for determinism. The ui-interface-overview applies the principles to common layout patterns.

**The principles are adequate. The operational translation of principles into implementation behaviour is not.**

The gap is not at the level of principle — it is at the level of process. The guides state what the system is; they do not provide sufficient procedure for building it correctly. Specifically:

| Principle | Guide coverage | Process coverage |
|-----------|---------------|-----------------|
| Partition law | Well stated in §2–§3 | Gate asks 2 of the 4 necessary boundary questions |
| Informative minimalism | Stated in §2.8 | Gate does not require active justification; no redundancy audit |
| Systemic inheritance | Stated in §2.5, §8.1 | Gate asks for analogy but no pattern library to reference |
| F-system determinism | Well stated | F-law is clear; percentage-based widths pass without detection |

The Implementation Gate (`design-law.md §12`) is the bridge between principle and process. It asks six questions. As shown in `08-process-gate-analysis.md`, each question can be answered correctly at a level of abstraction that does not detect the violation occurring at the implementation level.

---

## IV. The Violation Taxonomy

The 25+ violations identified in the distort build fall into seven categories. Each category maps to a principle gap and a process gap.

### Category A: Partition Violations (6 violations)

EffectStack add button private border; double border under the button; export dropdown floating panel; export dropdown mismatched width; toolbar unclaimed gap; CategoryPicker incomplete border set.

**Principle:** Partition law and shared boundary law are well-stated.  
**Process gap:** Gate question 2 accepts a partial boundary answer. No four-edge audit is required.  
**Documentation gap:** None for the principle. Gap in process precision.

### Category B: Redundancy Violations (5 violations)

Dual source information; stack placeholder text; two close buttons; "module" in module names; PREVIEW label opacity without consequence disclosure.

**Principle:** §2.8 informative minimalism is well-stated.  
**Process gap:** Gate does not require active proof of §2.8 compliance before each element is implemented.  
**Documentation gap:** No pre-implementation redundancy audit step exists.

### Category C: Naming and Labelling Violations (5 violations)

FILTER vs SEARCH; PREVIEW/FULL opacity; `▾` on file picker; SOURCE cell format; `+` placement.

**Principle:** §5.3 states typography must expose structure and state — correct in intent.  
**Process gap:** No gate step audits label semantic content. No labelling standard exists.  
**Documentation gap:** Label semantics standard does not exist.

### Category D: State Representation Failures (4 violations)

Empty canvas state (no affordance); PREVIEW mode (opaque state signal); portrait rendering failure (unhandled layout state); DriverPicker error state indistinguishable from idle.

**Principle:** §6.3 defines state signalling mechanisms but not required states.  
**Process gap:** No gate step enumerates states and requires each to have distinct treatment.  
**Documentation gap:** State taxonomy does not exist. Empty state, error state, and loading state are undocumented.

### Category E: Responsive Failures (4 violations)

Tab visibility inconsistency across orientations; toolbar unreadable on mobile; no cyclic button for constrained toolbar; portrait rendering broken.

**Principle:** §5 of ui-interface-overview states portrait is a reordering, not a redesign.  
**Process gap:** No responsive verification step. No control priority ordering.  
**Documentation gap:** Responsive standard is one paragraph. No breakpoints, no simplification patterns, no priority tiers, no touch sizing.

### Category F: Overlay and Dropdown Violations (3 violations)

Export dropdown floating panel (overlaps with A); CategoryPicker altering sidebar layout; incomplete border set on CategoryPicker (overlaps with A).

**Principle:** §3.3 prohibits floating. §8.4 prefers inline. Correct principles.  
**Process gap:** No authorised temporal surface pattern exists to use instead of floating.  
**Documentation gap:** No overlay/dropdown pattern standard. No collapsible component standard.

### Category G: Signifier Violations (3 violations)

`+` on left of label; `▾` on file picker; (centring convention in CategoryPicker).

**Principle:** Not explicitly covered by any existing guide.  
**Process gap:** No signifier catalogue to reference.  
**Documentation gap:** Signifier standard does not exist.

---

## V. The Two Layers of Failure

The violations exist because of two distinct failure layers that compound each other.

### Layer 1: Documentation Coverage Gaps

Ten concerns have no owning document. Violations in these areas are unpreventable by any process because there is no standard to enforce:

1. Signifier conventions
2. State taxonomy (all states, all required treatments)
3. Responsive/adaptive standards (breakpoints, priority, simplification)
4. Overlay and dropdown patterns
5. Label semantics (what labels must communicate)
6. Collapsible component standard
7. Contextual information at interaction point (hover descriptions)
8. Empty/uninitiated state treatment
9. Toolbar cell division logic (heterogeneous function types)
10. Status-plus-action cell format

These are not minor gaps. Items 2 (state taxonomy) and 5 (label semantics) are foundational — they affect every interactive element in the system. Items 3 (responsive) and 4 (overlays) affect every tool page. Item 1 (signifiers) affects every control.

### Layer 2: Process Gate Insufficiency

Six process gates are either absent or insufficiently precise:

1. No pre-implementation element justification (§2.8 active audit)
2. No four-edge boundary completeness check
3. No analogy-first requirement with a pattern library
4. No state enumeration and completeness audit
5. No label semantics review
6. No responsive verification requirement

These gaps mean that a compliant-feeling build can contain violations that would be caught by more precise gates. The current gates are too coarse: they ask the right questions at too high a level of abstraction.

---

## VI. The Trend: Principles Without Operationalisation

The consistent thread across all eight assessment topics is this: the SiteBoy design system states its principles clearly and correctly at an abstract level, then provides insufficient operational detail for those principles to be implemented without error.

This is the most important finding of the assessment.

Consider the parallel in other disciplines:

- A legal system that states "act in good faith" without defining what good faith requires in specific contract situations is not actionable. Courts fill the gap, but inconsistently.
- A manufacturing process that states "maintain tolerances" without specifying the tolerance for each dimension produces inconsistent parts.
- A building code that states "structural integrity is required" without specifying load calculations for different materials does not prevent structural failures.

The SiteBoy design system is in the same position. Its principles are sound. Its operational specifications are incomplete. Builders fill the gaps with local judgement — and local judgement, however well-intentioned, produces local conventions that diverge from each other and from the system's intent.

The distort build is evidence of this. Not a single violation was committed in ignorance of the principles. The builder knew about partition law, minimalism, F-system, and systemic inheritance. The violations occurred in the gap between principle and implementation — in the ten decisions per component that the builder made without a standard to consult.

---

## VII. Trends Visible Across the Violations

### Trend 1: Empty Space Anxiety

Multiple violations (placeholder text, sidebar source readout) exist because the builder was uncomfortable with empty space and filled it with content. The partition model does not prohibit emptiness — an empty partition is a partition. The minimalism principle explicitly requires that redundant content not exist. The tendency to fill empty space is a learned habit from other systems that does not transfer correctly to this one.

This trend suggests a needed cultural shift in addition to documentation: builders must learn to be comfortable with empty partitions. Emptiness in this system is not absence — it is structure.

### Trend 2: Convention Import

The export dropdown (floating, absolutely positioned) and the CategoryPicker's `× CLOSE` button (panels have close buttons) are both patterns imported from other UI systems. They are correct patterns in those systems. They are violations in this one. The builder applied familiar solutions without first asking whether those solutions are authorised within the SiteBoy partition model.

`design-law.md §2.5` prohibits this — but the prohibition is stated as "no element may invent its own local visual logic." Convention import is not exactly inventing local logic; it is importing external logic. The rule should be extended: "no element may apply a pattern from another system without first verifying that the pattern is compliant with or explicitly authorised by SiteBoy law."

### Trend 3: Analogy Without Verification

Multiple violations involve the builder identifying an analogy but not verifying that the new element matches the analogous one. The CategoryPicker collapsibles are analogous to other collapsibles — but the builder did not check the default state or visual treatment of the existing collapsibles. The gate asks "what is it analogous to?" but not "have you verified that your implementation matches the analogue?"

The analogy-first principle (§8.1) is correct in intent. Its process expression is currently passive (ask the question) rather than active (verify against the standard).

### Trend 4: Local Exception Accumulation

The `F × 0.85` font size used in three components (NodePanel name, EffectStack add button, CategoryPicker items) is not in the F-system. Neither is the `F × 1.5` label height in VariationGrid. These are small local exceptions, each made for a plausible reason (emphasis, breathing room), that collectively add a third font size tier to a system that defines only two.

The law prohibits local exceptions (`§10`: "local one-off spacing conventions"). But the prohibition is general; the F-system document does not enumerate which sizes are permitted and which are not, beyond stating the standard tokens. A builder who invents `F × 0.85` for "slightly larger" has no guide telling them what the correct non-standard-size alternative is, or that no non-standard size is permitted.

### Trend 5: The Process Ends at Build

The current process guides describe how to design and build. They do not describe how to verify. There is no review protocol, no test checklist against which a completed build is evaluated before shipping. The distort build's violations were caught only by a post-hoc human review, not by any process step.

A mature build process ends with verification, not with implementation. The distort violations would have been caught — and corrected before shipping — if the process included a structured post-implementation audit against the standards.

---

## VIII. Recommended Actions

The following are informational recommendations, not immediate directives. Each represents a documentation or process improvement that would prevent the class of violations identified in this assessment.

**Priority 1 — Extend the Implementation Gate:**
Add the following to `design-law.md §12`:
- Q7: Name all four edges of this element and identify which adjacent element each is shared with.
- Q8: List every state this element can be in. Does each state have a distinct visual signal?
- Q9: State which of the three §2.8 conditions this element satisfies. Does any existing element already satisfy the same condition with the same datum?
- Q10: What is the closest analogous element? Has your implementation been verified against it?
- Q11: What label or signifier does this element carry? Does the label correctly describe consequence (for actions) or operative difference (for states)?

**Priority 2 — Create a State Taxonomy Standard:**
Define all required states for every component type. Specify the visual treatment for each. Make empty state, error state, and loading state required (not optional) for components that can be in those states.

**Priority 3 — Create a Labelling Standard:**
Define label type taxonomy (structural, state, action, compound). Require action labels to describe consequences. Require state labels to describe operative differences. Define signifier-type matching rules.

**Priority 4 — Create a Signifier Catalogue:**
Document every glyph in use, its meaning in this system, the interaction type it implies, and its permitted position relative to the label.

**Priority 5 — Create an Overlay and Dropdown Pattern Standard:**
Define the three categories of temporal surface (inline substitution, anchored expansion, bounded overlay). Define border, width, and edge-registration requirements for each. Define the collapsible component standard.

**Priority 6 — Create a Responsive Standard:**
Define breakpoints. Define control priority tiers. Define permitted simplification patterns (cyclic button, label truncation, group collapse). Add responsive verification as a mandatory build step.

**Priority 7 — Add a Post-Build Verification Protocol:**
Define a structured checklist that is applied after implementation but before a tool is considered complete. The checklist should cover: partition compliance, state completeness, label correctness, responsive rendering, and redundancy audit.

---

## IX. Conclusion

The SiteBoy design system has a coherent and correct ideology. Its principles, taken together, constitute a rigorous visual and structural logic that is more disciplined than most design systems in common use. The partition model in particular is a powerful constraint — when applied correctly, it makes inconsistency structurally impossible.

The distort build demonstrates that the system's principles are not self-enforcing. Correct principles, known to the builder, applied at the level the current guides require, produced 25+ violations. The violations are not the result of ignorance or negligence. They are the result of a gap between abstract principles and implementation procedure.

Closing that gap requires two parallel efforts:
1. Completing the documentation coverage — filling the ten areas that have no owning document
2. Strengthening the process gates — making the Implementation Gate precise enough to catch violations at build time, not in post-build review

Neither effort requires changing the principles. Both efforts are about operationalising principles that are already correct.

The distort build is a useful baseline. Its violations are now documented, categorised, and cross-referenced against both existing guides and missing standards. This documentation serves as the foundation for the guide improvements needed — and as a concrete record of what happens when a strong-principle, weak-process system is used to build a complex tool.
