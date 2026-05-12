# Process Engineering (How the Work Is Made Legible)

This document describes the “myriad of processes and methods” used across the site as a single, auditable engineering system: a pipeline for converting vague goals into typed implementations, plus governance for ensuring that decisions remain reconstructible.

It is both:
- a method for building algorithm libraries and tool/page implementations
- a documentation discipline that keeps verification possible (especially for GPU/shader work and fabrication geometry)

## Technical Domain

Process decomposition, research-to-implementation automation, module discovery and ID taxonomy, gap analysis, documentation architecture, compliance/audit remediation, and AI workflow governance (decision records, bounded authority, attribution).

## Architecture

### 1. The 7-phase Idea → Library pipeline (structural core)
The pipeline is explicitly phase-labelled and treats “work” as transformations with declared inputs/outputs:
1. **Idea capture**: convert unstructured intent into a structured brief and a glossary of technique names.
2. **Process design**: decompose the goal into ordered steps; assign each step `TECHNIQUE NAME → FUNCTION SIGNATURE`.
3. **Research**: corpus-first source extraction; query Wikipedia REST when missing; preserve LaTeX via `<math alttext>`; isolate formulas into typed function signatures.
4. **Module discovery**: extract functions from existing tool/library code or define from research; assign module IDs using a `{CATEGORY}-{NUMBER}` scheme; track status as implemented/inline/research/missing.
5. **Gap analysis**: compare “what a page needs” vs “what exists”; categorise gaps as extraction/research/variation; prioritise by usage.
6. **Build & categorise**: implement missing modules as pure, composable functions; order by dependency (foundation → colour → geometry → specialised).
7. **Page implementation**: assemble JSON/page specs from modules; wire via the router/tool host; publish as a live URL.

This turns “many efforts” into a single executable method: the artefact of one phase becomes the input to the next.

### 2. Research-to-implementation: formula traceability as a hard requirement
Research is not “reading”; it is a conversion pipeline:
- Wikipedia REST HTML → structured Markdown
- preserve mathematics from `<math alttext>`
- convert formulas into typed function signatures (with procedure steps)

The resulting outputs are intended to be audited later. This is why “done” is not “code compiles”; it is “formula meaning is preserved and attributable”.

### 3. Process compliance: treating deviations as structural defects
The compliance audit documents a failure mode with explicit severity:
- implementing from memory instead of reading the reference docs
- omitting source citations in JSDoc
- not preserving formulas verbatim

The remediation response is similarly structured: add `@source`, `@wikipedia`, and `@formula` annotations and update the associated guides/checklists so the same process defects cannot silently reoccur.

### 4. AI workflow governance: prevent decision debt
AI governance is defined operationally:
- define what the system can do and what it cannot do
- externalise consequential decisions into decision records
- define success criteria before running
- keep actions attributable and reviewable

The underlying claim is functional: when decisions cannot be reconstructed, velocity collapses because later work is spent on “what happened” rather than forward progress.

## Methods (how to describe the work)

When writing project/process documents, each distinct complaint clause should map to a discrete change:
- “what algorithm” → named technique + module ID
- “where it came from” → reference doc + formula section
- “what it outputs” → I/O signature
- “how it composes” → pipeline step ordering and data flow
- “what breaks determinism” → quality tiers, caching/invalidation rules, export determinism
- “how it is verified” → compliance checklist and audit hooks

This yields a documentation style that is reviewable rather than rhetorical.

## Mapping the pipeline to concrete implementations

### 1. DISTORT tool (GPU shader + node modules)
DISTORT is a direct beneficiary of the pipeline:
- research and module discovery generate the effect-module catalogue with stable IDs and parametrised behaviours
- formula traceability matters because GPU shader code is both non-trivial and expensive to verify after the fact
- compliance auditing prevents “shader correctness by memory” and forces source citation/meaning preservation in module packs

In practical terms, the DISTORT tool shows how:
- named methods become module stacks
- module stacks become recipes
- recipes become exported reproducible artefacts (PNG/SVG/sequence)

### 2. Generative art pieces (frame-addressable deterministic render)
Generative pieces implement deterministic frame logic:
- parameter space is declared
- frames are advanced through the host (AnimationFoundation)
- render stages separate update/simulation from viewport display transforms

Describing generative work therefore becomes:
- declare coordinate families and sampling rules
- declare mapping from frame index to state
- list common render primitives (motion blur, checkpoint interpolation)

This is the same description pattern produced by the 7-phase pipeline.

### 3. Synthetic Biophilia (mathematical structure to fabrication)
Fabrication work demonstrates the same legibility requirement in another medium:
- explicit mathematical construction (phyllotactic field, dome lift mapping)
- explicit discrete structure (residue class arch families, joint neighbour sets)
- explicit geometric conversion (vectors to spherical, cell planarisation, export-ready outlines)
- explicit constraints (non-piercing/clearance)

Where code-based verification is difficult, the pipeline still enforces the “audit trail” via formulas and named construction steps.

## Skills Demonstrated (competency tags)

- Turning informal creative objectives into typed procedural sequences.
- Routing goals → module IDs → compositional artefacts.
- Preserving mathematical meaning via corpus-first extraction and formula isolation.
- Creating auditable documentation: citations, LaTeX preservation, and compliance checks.
- Operational AI governance to prevent decision debt.

## Stack

- Pipeline overview: `blog/docs/Processes/idea-to-library-pipeline.md`
- Research methodology: `blog/docs/Processes/agentic-research-to-implementation.md`
- Compliance audit and remediation: `blog/docs/Processes/process-compliance-audit.md`
- AI governance: `blog/docs/Processes/ai-workflow-governance.md`
- Execution prompt template: `blog/docs/Processes/page-idea-processing-prompt.md`

