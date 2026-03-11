# Module Processing Checklist

Use in order when beginning a module migration. One tick per step — do not proceed to the next step until the current one is complete.

## Pre-Migration

- [ ] Read `document-module.md` from Step 0 to completion gate — do not skip
- [ ] Open source node (`*Node.js`) and read completely
- [ ] Open component-level doc (`blog/docs/components/distort/modules/<type>.md`) and read completely
- [ ] Consolidate features: three lists — confirmed, absent (parity holes), conflicts

## Archive

- [ ] Copy source node to `reference/distort/<type>/source/<ClassName>Node.js`
- [ ] Copy component-level doc to `reference/distort/<type>/legacy-docs/<type>.md`
- [ ] Copy any additional legacy docs to `reference/distort/<type>/legacy-docs/`
- [ ] Note any missing files in migration-log.md

## Pack Creation

- [ ] Create `blog/docs/pages/tools/processors/distort/<type>/` folder
- [ ] Write `source-reference.md` (Step 2)
- [ ] Write `description.md` (Step 3)
- [ ] Write `mechanisms.md` (Step 4)
- [ ] Write `ui-layout.md` (Step 5)
- [ ] Write `performance.md` (Step 6)
- [ ] Write `feature-parity.md` (Step 7)
- [ ] Write `issues-and-conflicts.md` (Step 8)
- [ ] Write `migration-log.md` (Step 9)

## Review

- [ ] Run pre-acceptance spot checks from `agent-compliance.md §4`
- [ ] Score all 8 files using `review-and-correction-loop.md`
- [ ] Correct any failing files and re-score
- [ ] Achieve 8/8 score

## Close

- [ ] Update `inventory.md` pack status from `absent` to `complete`
- [ ] Add compliance score to `migration-log.md`
- [ ] Update `audit.md` complete count
