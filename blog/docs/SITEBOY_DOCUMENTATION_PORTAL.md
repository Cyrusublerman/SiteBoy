# SiteBoy Construction & Usability Documentation Portal

Central entry point for planning, building, and maintaining the SiteBoy experience. Use this guide to navigate every document stored in `blog/docs` and understand how the pieces fit together.

---

## How to Use This Portal
- **New developers:** Follow the Build Path sequence below to spin up the project and learn the core rules.
- **Active contributors:** Jump to the section relevant to your current task (components, galleries, tooling, operations).
- **Reference hunters:** Use the Document Index to locate deep-dive write-ups, checklists, and historical context.

---

## Build Path (Recommended Sequence)
1. **Orientation**  
   - [rationale](rationale.md) — why the structure exists.  
   - [guides/index](guides/index.md) — phases/checklists/standards entry.  
   - [Processes/index](Processes/index.md) — process docs and gates.

2. **Architecture & Rules (current)**  
   - [site/ui-interface-overview](site/ui-interface-overview.md) — UI ideology and F-grid.  
   - [guides/standards/coding-standards](guides/standards/coding-standards.md).  
   - [guides/standards/f-system](guides/standards/f-system.md).  
   - [guides/tool-standards](guides/tool-standards.md), [guides/page-design-guide](guides/page-design-guide.md), [guides/lazy-loading](guides/lazy-loading.md), [guides/shared-utilities](guides/shared-utilities.md).

3. **Execution Phases (for new tools/pages)**  
   - Run P0→P6 in `guides/phases/` with matching checklists in `guides/checklists/`.  
   - Active prompt: `guides/idea-to-implementation-promt-3-ENFORCED.md`.  
   - Archives: `old-docs/legacy-prompts/`.

4. **Catalogs**  
   - Components: `components/index.md`, `components/COMPONENT-REFERENCE.md`.  
   - Algorithms: `algorithms/index.md` (+ category files).  
   - Pages: `pages/`.

5. **Archive (legacy)**  
   - Legacy docs moved to `old-docs/legacy-docs/` (formerly `docs/`). Use only for historical reference.

---

## Document Index

### Setup & Onboarding
- [SETUP](docs/SETUP.md): environment prerequisites, local server options, grid debugging.
- [onboarding/GETTING_STARTED](docs/onboarding/GETTING_STARTED.md): orientation checklist.
- [onboarding/AI_AGENT_HANDOFF](docs/onboarding/AI_AGENT_HANDOFF.md): responsibilities when passing work between agents.

### Core Architecture & Rules
- [siteboy-master-guide](docs/siteboy-master-guide.md): end-to-end architectural doctrine and OOP hierarchy.
- [ARCHITECTURE](docs/ARCHITECTURE.md): SPA routing, section modules, markdown ingestion.
- [RULES](docs/RULES.md): enforcement rules (MathematicalFoundation usage, BaseComponent inheritance, CSS policies).
- [MATHEMATICAL-COMPONENT-HIERARCHY](docs/MATHEMATICAL-COMPONENT-HIERARCHY.md): class tree and dependencies.
- [COMPONENT-REFERENCE-SYSTEM](docs/COMPONENT-REFERENCE-SYSTEM.md): component catalogue with ownership boundaries.
- [CONSOLIDATED-GUIDE](docs/CONSOLIDATED-GUIDE.md): curated recap of the active system constraints.
- [SETUP](docs/SETUP.md) (quick start) pairs with these documents for a complete foundation.

### Component Documentation Bundle (`docs/component-documentation/`)
- [component-reference-documentation](docs/component-documentation/component-reference-documentation.md): API-level reference for component library usage.
- [component-usage-examples](docs/component-documentation/component-usage-examples.md): practical patterns, expected props, and lifecycle handling.
- [development-workflow-template](docs/component-documentation/development-workflow-template.md): repeatable plan for new features.
- [migration-report](docs/component-documentation/migration-report.md): history of component library upgrades and incompatibilities.

### Page Composition & Site Structure (`docs/site/`)
- [plan](docs/site/plan.md): required sections, navigation flow, and JSON contract expectations.
- [refined_logic](docs/site/refined_logic.md): detailed build chronology (`app -> router -> destroy -> section -> ...`).
- [type](docs/site/type.md): typography guidelines aligned with the VGA aesthetic.

### Gallery System (`docs/gallery/`)
- [MASONRY-IMPLEMENTATION-SUMMARY](docs/gallery/MASONRY-IMPLEMENTATION-SUMMARY.md): implementation details for the masonry layout.
- [MASONRY-BREAKDOWN](docs/gallery/MASONRY-BREAKDOWN.md): mathematical reasoning and column logic.
- [GALLERY-IMPLEMENTATION-SUMMARY](docs/gallery/GALLERY-IMPLEMENTATION-SUMMARY.md): high-level walkthrough for gallery builders.
- [GALLERY-IMPROVEMENTS-SUMMARY](docs/gallery/GALLERY-IMPROVEMENTS-SUMMARY.md): iterative upgrades and refinements.
- [GALLERY-QUESTIONS-ANSWERED](docs/gallery/GALLERY-QUESTIONS-ANSWERED.md): FAQ from earlier build cycles.
- [GALLERY-TEST-GUIDE](docs/gallery/GALLERY-TEST-GUIDE.md): validation plan before go-live.
- [GALLERY-VERIFICATION-CHECKLIST](docs/gallery/GALLERY-VERIFICATION-CHECKLIST.md): final QA checklist.

### Photo Processing Pipeline (`docs/photo-processing/`)
- [PHOTO-PROCESSING-COMPLETE](docs/photo-processing/PHOTO-PROCESSING-COMPLETE.md): step-by-step processing workflow.
- [PHOTO-PROCESSOR-COMPARISON](docs/photo-processing/PHOTO-PROCESSOR-COMPARISON.md): tooling comparison matrix.
- [PHOTO-PROCESSOR-EXAMPLES](docs/photo-processing/PHOTO-PROCESSOR-EXAMPLES.md): annotated examples.
- [PHOTO-GALLERY-COMPLETE](docs/photo-processing/PHOTO-GALLERY-COMPLETE.md): tying processed assets into the gallery system.

### Tooling (`docs/tools/` and `blog/tools/`)
- [SOLAR-SYSTEM-TOOL-README](docs/tools/SOLAR-SYSTEM-TOOL-README.md): configuration and animation hooks.
- [ASTEROID-BELT-TOOL-README](docs/tools/ASTEROID-BELT-TOOL-README.md): usage instructions and data inputs.
- Blog tool articles (`blog/tools/*.md`) cover front-end utilities (color quantizer, font analysis, pixel tiler, typography notes).

### Migration & Infrastructure (`docs/migration/` + Portal Docs)
- [REPO_RESTRUCTURE_PLAN](docs/migration/REPO_RESTRUCTURE_PLAN.md): restructuring roadmap.
- [RESTRUCTURE_SUMMARY](docs/migration/RESTRUCTURE_SUMMARY.md) & [RESTRUCTURE_QUICKSTART](docs/migration/RESTRUCTURE_QUICKSTART.md): executed steps and quick onboarding to the new layout.
- [R2_SETUP_COMPLETE](docs/migration/R2_SETUP_COMPLETE.md), [R2_FINAL_STRUCTURE](docs/migration/R2_FINAL_STRUCTURE.md), [R2_UPLOAD_INSTRUCTIONS](docs/migration/R2_UPLOAD_INSTRUCTIONS.md), [REMOVE_REFERENCE_FROM_GIT](docs/migration/REMOVE_REFERENCE_FROM_GIT.md): cloud asset migration playbooks.
- [CLOUD_MIGRATION_AND_CLEANUP](CLOUD_MIGRATION_AND_CLEANUP.md): consolidated live reference for the image move plus cleanup instructions.

### Operations, Changes, & Fixes
- [FIXES](docs/FIXES.md): categorized bug fixes and resolution notes.
- [changes](docs/changes.md): chronological change log (append entries here).
- [SETUP-SPEC / other reports](old-docs/SETUP-SPEC.md) - reference when confirming legacy behaviour.
- [CHANGE_F_HERE](docs/reference/CHANGE_F_HERE.md): single place to adjust the F baseline (documented guard rails).

### Generative & Specialized Systems
- [GENERATIVE_ART_IMPLEMENTATION](docs/GENERATIVE_ART_IMPLEMENTATION.md): generative art pipeline specifics.
- [CLOUD_MIGRATION_AND_CLEANUP](CLOUD_MIGRATION_AND_CLEANUP.md): included here for quick Ops access.
- Reference folder (`reference/`) contains supplemental animation specs (e.g., `ANIMATION_SYSTEM_GUIDE` in the repo root) when integrating advanced behaviour.

### Historical Archives (`old-docs/`)
- Legacy analyses: e.g., [SITEBOY_ARCHITECTURE_FLOW](old-docs/SITEBOY_ARCHITECTURE_FLOW.md), [ANALYSIS_OLD_BUILD_vs_CURRENT](old-docs/ANALYSIS_OLD_BUILD_vs_CURRENT.md).
- Compliance and implementation reports: [PAGE-BUILD-COMPLIANCE-FINAL](old-docs/PAGE-BUILD-COMPLIANCE-FINAL.md), [REFACTOR-COMPLETE](old-docs/REFACTOR-COMPLETE.md).
- Use these for context or when re-evaluating prior decisions; do not treat as current instructions unless promoted back into `docs/`.

### Additional References
- [CLOUD_MIGRATION_AND_CLEANUP](CLOUD_MIGRATION_AND_CLEANUP.md): operational reference (repeated intentionally).
- Music theory docs in `blog/music/` inform content within the blog section.
- Site-wide tools (`blog/tools/*.md`) supplement functional articles displayed via the Blog section.

---

## Construction Checklist (Use With the Docs Above)
- [x] Read `SETUP` and run a local server.
- [x] Confirm architectural rules via `siteboy-master-guide` and `RULES`.
- [x] Plan changes with the development workflow template, referencing component docs.
- [x] Derive dimensions using `MathematicalFoundation` and cross-check with `MATHEMATICAL-COMPONENT-HIERARCHY`.
- [x] Assemble sections in JSON, following `plan` and `refined_logic`.
- [x] Load assets and galleries through the photo and gallery packets.
- [x] Verify constraints with `GALLERY-VERIFICATION-CHECKLIST`, `FIXES`, and `changes`.
- [x] Log updates and keep the cloud storage in sync per `CLOUD_MIGRATION_AND_CLEANUP`.

---

## Maintenance Notes
- Update this portal when new documentation is added or promoted from `old-docs/`.
- Keep `docs/changes.md` current with substantive modifications.
- Audit archived material quarterly to decide if it should move into active documentation.

---

Document version: 2025-11-11 (compiled for consolidated construction & usability guidance).

