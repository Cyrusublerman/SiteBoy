# New Feature Escalation Checklist

Use when a module migration reveals a new algorithm or UI pattern that should be in the shared library, or when documenting a feature that is not covered by existing root authorities.

## Algorithm Escalation

- [ ] Confirm the algorithm is not already in `assets/js/shared/algorithms/` (search by function name and behaviour)
- [ ] Confirm the algorithm is non-trivial (> 5 lines, has a name in the field, or requires meaningful design)
- [ ] Confirm the algorithm is likely reusable (used in 2+ modules, or a named algorithm generally applicable)
- [ ] Record as `[NOTE] [ESCALATION]` in `issues-and-conflicts.md` using the format from `issue-flagging.md §8`
- [ ] Add an entry to `blog/docs/guides/shared-utilities.md` with status "escalated"

## Rule Gap Escalation (missing rule in root authorities)

- [ ] Check `rules.md` — is this feature covered?
- [ ] Check `blog/docs/guides/effect-module-standards.md` — is this covered?
- [ ] Check `blog/docs/guides/standards/coding-standards.md` — is this covered?
- [ ] If genuinely missing: record the gap in `issues-and-conflicts.md` as `[NOTE] [STANDARDS]`
- [ ] Do not add the rule yourself — escalate to the rules authority owner

## UI Component Escalation

- [ ] Confirm the pattern appears in 3+ modules or tools
- [ ] Confirm the pattern is non-trivial (requires own state, event handling, or rendering logic)
- [ ] Record as `[NOTE] [ESCALATION]` in `issues-and-conflicts.md`
- [ ] Add an entry to `blog/docs/guides/shared-utilities.md` with status "escalated"

## Escalation Does Not Block

- [ ] Confirm the module migration continues as normal (escalation is NOTE severity)
- [ ] Confirm the inline implementation remains in the module until the library version exists
- [ ] Confirm migration can close at 8/8 with escalation recorded as NOTE
