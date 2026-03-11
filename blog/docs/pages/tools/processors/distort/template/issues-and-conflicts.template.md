# <Display Name> — Issues and Conflicts

## Standards Compliance Check

Run through every item in `build-module.md §8`. Pass or fail with evidence.

**Module structure:**
- [ ] Class extends `EffectNode` — pass/fail
- [ ] `type` lowercase, no separators, unique — pass/fail
- [ ] `category` matches registered category — pass/fail
- [ ] `paramDefs` has ≥1 tier-3 param — pass/fail: <evidence>
- [ ] All param keys camelCase — pass/fail
- [ ] All labels SCREAMING CASE ≤16 chars — pass/fail
- [ ] `apply(src, dst, w, h, ctx)` signature correct — pass/fail
- [ ] Reads `ctx.quality`, applies PREVIEW caps — pass/fail: <evidence>
- [ ] Driveable params read via `this.getModulated(...)` — pass/fail: <evidence>
- [ ] No `document.*`, `window.*` — pass/fail
- [ ] No `fetch`, network API — pass/fail
- [ ] No `requestAnimationFrame`, `setInterval`, `setTimeout` — pass/fail
- [ ] No inline algorithm that exists in library — pass/fail: <evidence>
- [ ] Releases all `ctx.pool` buffers before return — pass/fail: <evidence>

## Issues

<Use the format from issue-flagging.md for each finding.>

```
[SEVERITY] [CATEGORY] Short description
Location: method name or step reference
Evidence: exact quote or precise paraphrase
Impact: what goes wrong or is missing
```

<At minimum, record parity holes as [NOTE] [PARITY] and escalation candidates as [NOTE] [ESCALATION]. Even if all compliance items pass, there is typically at least one NOTE.>
