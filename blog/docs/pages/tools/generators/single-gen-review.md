# Single-Generator Review

**Purpose:** review one new or drifted generator without rerunning the full v4 campaign.

## Use When

- A new `.gen.js` file is added.
- Drift detection reports Major drift.
- A user reports a generator-specific issue that needs reference comparison.

## Setup

1. Confirm `v4-state.md` exists.
2. Confirm `reference-manifest.md` has the generator row.
3. Create or reuse an empty questions register.

## Full Review

1. Set state to `phase: 1`, `turn: p1-gen-NN-<id>`, `stage: pre-A`.
2. Run cards A → B → B.5 → C → C.5 → D → E → E.5 → E.6 → F → G.
3. Write/update:
   - `feature-parity.md`
   - `system-map.md`
   - `issues-and-conflicts.md`
   - central `issues.md`
4. Run Stage G validation.

## Partial Review

Use for Moderate drift:

1. Re-run Stage C → C.5 → D → E.
2. Update live capability/diff rows.
3. Patch stale docs or issue rows.

## Integration Rules

- Add new issues with the next available prefix number.
- Put architecture/performance decisions in central `issues.md`.
- If source changes during a fix, update docs in the same turn.
- Leave placeholder-reference parity as a decision class; do not remake a live implementation into a stub.
