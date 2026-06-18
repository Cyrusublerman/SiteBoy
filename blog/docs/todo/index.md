# SiteBoy — TODO Index

One file per work item. This index is the dashboard.

Last touched: 2026-06-18 (B2/B3/B4 status flips; G1 auth wire; F2/E7 notes).

---

## 0. Definitions

**Status** (closed set):
- `TODO` — not started.
- `WIP` — implementation in progress, uncommitted or partial.
- `BLOCKED` — cannot start until named blocker resolves.
- `REVIEW` — code written, awaiting compliance audit / sign-off.
- `DONE` — shipped and verified.

**Priority** (closed set):
- `P0` — critical path; blocks other work.
- `P1` — must ship before next public release.
- `P2` — should ship; deferrable one release.
- `P3` — nice-to-have; no deadline.

**Blocker syntax**: `→ X.n` means "blocked by X.n".

**ID format**: `<Area>.<n>`. Areas are letters A–H. Permanent — status flips, ID does not.

**Done criterion**: every `TODO`/`WIP` row has a single, verifiable predicate in its `Done when` field. Vague verbs ("polish", "improve") are not predicates.

**File-per-item rule**: each row in the table below has a matching file `<ID>-<slug>.md` in this folder. Edit that file to change status, sub-tasks, notes. Update the corresponding row in this index when status flips.

### Ideas folder (`blog/ideas/`)

- **Canonical duplicate rule.** If the same concept appears under `blog/ideas/art/generative/` and under `blog/ideas/tools/`, **`art/generative` is canonical** for provenance, linking, and any future `duplicate_of` field. Treat the `tools/` tree as a feeder unless it is the only copy.
- **Projects are not only tools.** A portfolio entry under `#projects/<slug>` may document a shipped tool, or **only an idea** (research, narrative, planned work). There is no requirement that every project slug map to `assets/js/tools/**`. See B1.

---

## A. Platform & Infrastructure

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| A1 | [A1-vercel-migration.md](A1-vercel-migration.md) | Migrate to dynamic host (Vercel) | P1 | DONE | — |
| A2 | [A2-auth.md](A2-auth.md) | Auth / login mechanism | P1 | REVIEW | → A1 |
| A3 | [A3-backend-store.md](A3-backend-store.md) | Backend data store | P1 | REVIEW | → A1 |
| A4 | [A4-asset-bucket.md](A4-asset-bucket.md) | Binary asset bucket (S3-compat) | P1 | REVIEW | → A1 |

## B. Sections

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| B1 | [B1-projects-section.md](B1-projects-section.md) | Complete projects section | P1 | DONE | — |
| B2 | [B2-store-section.md](B2-store-section.md) | Add store section | P2 | REVIEW | → A1, A3 |
| B3 | [B3-about-me.md](B3-about-me.md) | Add about-me section | P3 | DONE | — |
| B4 | [B4-3d-files-section.md](B4-3d-files-section.md) | 3D files section + viewer | P2 | REVIEW | → A4 |
| B5 | [B5-splat-viewer.md](B5-splat-viewer.md) | Point cloud / Gaussian splat viewer | P3 | WIP | → B4 |

## C. Gallery

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| C1 | [C1-gallery-organisation.md](C1-gallery-organisation.md) | Gallery taxonomy + schema | P1 | DONE | — |
| C2 | [C2-gallery-upload.md](C2-gallery-upload.md) | Server-backed upload pipeline | P1 | DONE | — |
| C3 | [C3-thumbnails.md](C3-thumbnails.md) | Thumbnails for every item | P1 | DONE | — |
| C4 | [C4-animation-export.md](C4-animation-export.md) | Generator animation → gallery | P1 | DONE | — |

## D. Generators

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| D1 | [D1-new-generators.md](D1-new-generators.md) | Ship queued generators | P1 | DONE | — |
| D2 | [D2-animation-export.md](D2-animation-export.md) | TransportStrip record button | P1 | DONE | — |
| D3 | [D3-generator-audit.md](D3-generator-audit.md) | Compliance audit per generator | P2 | TODO | → D1 |
| D3.1 | [D3.1-canvas-resize-audit.md](D3.1-canvas-resize-audit.md) | Canvas resize consistency audit | P2 | DONE | — |
| D4 | [D4-sequencer-transport-wiring.md](D4-sequencer-transport-wiring.md) | Sequencer transport wiring | P1 | DONE | — |

## E. Distort

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| E1 | [E1-driver-fix.md](E1-driver-fix.md) | WU-3 — G1 driver (+D) fix | P0 | DONE | — |
| E2 | [E2-blend-audit.md](E2-blend-audit.md) | WU-4 — G13 blend-mode audit | P1 | DONE | — |
| E3 | [E3-residuals.md](E3-residuals.md) | WU-5 — G5 + G9 residuals | P2 | DONE | — |
| E4 | [E4-worker-offload.md](E4-worker-offload.md) | WU-6 — G12 worker offload + bilateral fix | P1 | DONE | — |
| E5 | [E5-algorithm-verification.md](E5-algorithm-verification.md) | WU-7 — 38-algorithm verification | P2 | DONE | — |
| E6 | [E6-issue-triage.md](E6-issue-triage.md) | WU-8 — per-module issue triage | P2 | DONE | — |
| E7 | [E7-module-rebuilds.md](E7-module-rebuilds.md) | Phase 10 — per-module rebuilds | P1 | REVIEW | — |
| E8 | [E8-new-effects.md](E8-new-effects.md) | Add new distort effects | P2 | DONE | — |

## F. In-flight tools

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| F1 | [F1-cursive-glyph-builder.md](F1-cursive-glyph-builder.md) | Cursive glyph builder MVP completion | P1 | DONE | — |
| F2 | [F2-notes-tool.md](F2-notes-tool.md) | Notes-processing tool suite | P2 | WIP | → A3 |
| F3 | [F3-uncommitted-work.md](F3-uncommitted-work.md) | Land current uncommitted work | P0 | DONE | — |
| F4 | [F4-cursive-glyph-builder-ux.md](F4-cursive-glyph-builder-ux.md) | Cursive glyph builder toolbar + sidebar UX | P1 | DONE | — |
| F5 | [F5-handwriting-vector-compose.md](F5-handwriting-vector-compose.md) | Handwriting vector compose SVG export | P2 | DONE | — |

## G. Authoring & operations

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| G1 | [G1-admin-gui.md](G1-admin-gui.md) | GUI for adding content per section | P1 | WIP | → A2, A3 |
| G2 | [G2-docs-cleanup.md](G2-docs-cleanup.md) | Docs cleanup pass | P1 | REVIEW | — |
| G3 | [G3-portal-index.md](G3-portal-index.md) | Documentation portal index refresh | P2 | TODO | → G2 |

## H. Cross-cutting

| ID | File | Title | P | Status | Blockers |
| --- | --- | --- | --- | --- | --- |
| H1 | [H1-page-audit.md](H1-page-audit.md) | Every page passes page-compliance-audit | P0 | TODO | — |
| H2 | [H2-console-log.md](H2-console-log.md) | Eliminate console.log outside owners | P1 | DONE | — |
| H3 | [H3-dist-hygiene.md](H3-dist-hygiene.md) | Remove dist/ churn from commits | P1 | DONE | — |
| H4 | [H4-design-rule-pass-b.md](H4-design-rule-pass-b.md) | Design-rule corpus: Pass-B LLM extract | P3 | DONE | — |
| H5 | [H5-design-rule-embed-cluster-synth.md](H5-design-rule-embed-cluster-synth.md) | Design-rule corpus: embed / cluster / synth | P3 | DONE | — |
| H6 | [H6-design-rule-conflict-emit-lint.md](H6-design-rule-conflict-emit-lint.md) | Design-rule corpus: conflict / emit / lint / test | P3 | REVIEW | → H4, H5 |
| H7 | [H7-slider-component.md](H7-slider-component.md) | Standalone Slider primitive; replace raw range inputs | P2 | DONE | — |

---

## Out of scope (explicit non-goals)

Logged in [out-of-scope.md](out-of-scope.md). Move a row out only with an ADR.

---

## Working agreement

1. New items append; never insert mid-table.
2. ID is permanent. Status flips, ID does not.
3. A row moves to `DONE` only after its `Done when` predicate is verified.
4. Blockers are explicit IDs. "Blocked by complexity" is not a blocker.
5. A row with `WIP` for >14 days must either advance to `REVIEW` or be re-scoped.
6. This folder is the only roadmap. Other "next-steps" docs are tool-internal and feed items here.
