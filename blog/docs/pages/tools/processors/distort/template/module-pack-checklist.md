# Module Pack Checklist

Use to verify a completed module documentation pack scores 8/8 in `review-and-correction-loop.md`.

## File Existence

- [ ] `source-reference.md` exists
- [ ] `description.md` exists
- [ ] `mechanisms.md` exists
- [ ] `ui-layout.md` exists
- [ ] `performance.md` exists
- [ ] `feature-parity.md` exists
- [ ] `issues-and-conflicts.md` exists
- [ ] `migration-log.md` exists

## source-reference.md

- [ ] Source node path present and correct
- [ ] Registry and pipeline paths present
- [ ] Archive destination present
- [ ] Component-level doc archive entry present
- [ ] Algorithm imports section present
- [ ] All files classified

## description.md

- [ ] Specific algorithm named (not just category)
- [ ] Visual output described
- [ ] Distinction from similar modules stated
- [ ] Algorithm origin noted
- [ ] Scope boundary stated
- [ ] ≥150 words

## mechanisms.md

- [ ] apply() execution order — numbered steps in source sequence
- [ ] Function inventory table — every function with role, inputs, output, complexity
- [ ] At least one formula with all symbols defined (or "no formulas" explicitly stated)
- [ ] Preview strategy described (or "no cap needed" justified)

## ui-layout.md

- [ ] Parameter table — one row per paramDef entry; Controls column substantive
- [ ] Mask controls section present
- [ ] Modulation targets section present
- [ ] UX notes section present

## performance.md

- [ ] Dominant operation named specifically
- [ ] Complexity in O(n) notation with n defined
- [ ] Extreme parameter value analysed
- [ ] Render cost class assigned (PREVIEW and FULL)
- [ ] Mitigation candidates listed

## feature-parity.md

- [ ] Feature inventory — every component-level doc feature with status
- [ ] Module standard feature audit table present
- [ ] Parity holes explicitly numbered

## issues-and-conflicts.md

- [ ] Standards compliance check — every build-module.md §8 item with evidence
- [ ] At least one issue recorded
- [ ] All issues in correct format (Severity, Category, Location, Evidence, Impact)
- [ ] Parity holes carried over as [NOTE] [PARITY]
- [ ] Performance risks carried over

## migration-log.md

- [ ] Date present
- [ ] All input files listed with paths and classifications
- [ ] All archive outputs listed
- [ ] Compliance score table present
