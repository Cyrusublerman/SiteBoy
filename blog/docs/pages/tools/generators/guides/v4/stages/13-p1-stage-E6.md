# Card 13 — Phase 1 Stage E.6 — PERFORMANCE TIER AUDIT

## What this stage does
Audits the live generator's adoption of the four-tier compute scheduler (RAF coalesce → adaptive resolution → worker offload → GPU). Catches missed optimisations for resource-intensive generators. Produces the Performance Tier Audit.

## Applicable rules
Operating: R5, R10. Anti-Fab: F.1, F.4 (no "I think" in tier classifications). Anti-pattern numbers: 5, 6.

## Inputs
- Live source (in context)
- Live Data Pathways table (in context from Stage C.5)
- `compute-scheduler.md` (in session context from first Stage A read)
- `gpu-compute.md` (in session context)
- `gpu-shader-authoring.md` (in session context)
- `performance.md` for this generator (in context from Stage A; may be missing)

## Outputs
- Performance Tier Audit — held in context; written in Stage F

## Procedure

- [ ] 1. Update v4-state.md: `stage: E.6`, append checkpoint.
- [ ] 2. **Identify primary workload kind** from Live Data Pathways:
  - `per-pixel` if any pathway with `parallelisable?: yes (per-pixel)` runs every frame
  - `per-vertex` if any per-frame pathway with `yes (per-vertex)`
  - `per-particle` if any per-frame pathway with `yes (per-particle)`
  - `geometric` for vector/path-based per-frame work without per-pixel iteration
  - `static` for one-shot generators (no per-frame `loop` node)
- [ ] 3. **Check Tier 1 (RAF coalesce).** Tier 1 is automatic in `GenerativeToolHost` — usually nothing to verify here. Note `Tier 1: implicit via host` if host runs the loop.
- [ ] 4. **Check Tier 2 (Adaptive resolution).** Grep live SCRIPT_CONFIG for `compute.interactionScale`, `compute.adaptive`, `compute.resolutionScale`, or similar. If primary workload is `per-pixel` or `per-vertex` AND no Tier 2 declaration:
  - Log PERF P1 `tier-2-missing` per Default Assumptions Catalogue
  - Cite SCRIPT_CONFIG location showing absence
- [ ] 5. **Check Tier 3 (Worker offload).** Grep live for `compute.worker` and `compute.computePixels`. Cases:
  - Both present → Tier 3 active. Verify `computePixels` function is sane (uses Float32Array for IO, doesn't reference DOM/window).
  - `worker: true` but no `computePixels` → Log PERF P0 `tier-3-broken-config` per Catalogue
  - `worker: false` (or absent) AND primary workload is per-pixel AND pathway is `yes (per-pixel)` AND not GPU → Log PERF P1 `tier-3-candidate-not-adopted`
- [ ] 6. **Check Tier 4 (GPU).** Grep live for any GPU foundation usage (`GPUFoundation`, `getGPUContext`, `compileShader`). Per `gpu-compute.md §3`, GPU candidates are:
  - Per-pixel work where W*H > 100000 (e.g. 1000x1000 canvas)
  - Per-vertex work with > 10000 vertices
  - Reaction-diffusion or wave-equation per-frame timestep
  - Any pathway with `yes (per-pixel)` OR `yes (per-vertex)` AND per-frame=true AND total parallel width > 100k
  - If candidate AND no GPU path → Log PERF P1 `gpu-candidate` per Catalogue
- [ ] 7. **Check 5: documented mitigations.** If `performance.md` exists, read its mitigation claims. For each claim:
  - If claim is implemented in live source → confirm and note in audit
  - If claim is NOT implemented → Log PERF P2 `documented-mitigation-not-implemented` per Catalogue
- [ ] 8. **Check 6: shader hygiene** (only if generator uses shaders). Per `gpu-shader-authoring.md`:
  - Shaders should be in `assets/js/tools/processors/distort/shaders/*.shader.js` for distort tool — not in generators
  - Generators that need GPU compute: shader inline as a module-const string; precompiled at first frame; cached in BufferRing
  - If generator has inline GLSL/WGSL strings outside the shader file pattern → Log ARCH P2 `shader-out-of-band` (cross-listed with E.5)
- [ ] 9. Aggregate all PERF issues for this generator. Build the Tier Audit from template below.
- [ ] 10. Update v4-state.md: `stage: F`, `last_action: tier audit complete (<N> PERF issues)`, `next_action: log all issues to files`, append checkpoint.
- [ ] 11. Read card `14-p1-stage-F.md` — auto-advance.

## Templates

### Performance Tier Audit

```markdown
### Performance Tier Audit

**Primary workload:** <per-pixel | per-vertex | per-particle | geometric | static>
**Workload size estimate:** <e.g. ~640k pixels/frame at 800x800 canvas>

**Tier 1 (RAF coalesce):** <implicit via host | manual at file:line | not applicable for static>
**Tier 2 (Adaptive resolution):** <yes — `compute.interactionScale: 0.5` at file:line | no — log PERF-NN tier-2-missing | n/a — geometric workload>
**Tier 3 (Worker offload):** <yes — `compute.worker: true` with `computePixels` at file:line | broken — `worker: true` without `computePixels` log PERF-NN tier-3-broken-config | not adopted — candidate, log PERF-NN tier-3-candidate-not-adopted | n/a>
**Tier 4 (GPU):** <yes — uses GPUFoundation at file:line | candidate not adopted — log PERF-NN gpu-candidate | n/a — workload too small or sequential>

**Documented mitigations:**
- `performance.md`: <list of claims; for each, "implemented" or "log PERF-NN documented-mitigation-not-implemented">

**Shader hygiene:** <not applicable — no shaders | OK — shader at canonical path | log ARCH-NN shader-out-of-band>

**Issues logged:** PERF-NN, PERF-NN+1, ...
```

## Validation

```bash
rg "compute\.(interactionScale|adaptive|resolutionScale|worker|computePixels)" assets/js/tools/generators/scripts/<category>/<id>.gen.js
rg "(GPUFoundation|getGPUContext|navigator\.gpu)" assets/js/tools/generators/scripts/<category>/<id>.gen.js
```

Cross-check audit's tier claims against grep results.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Workload kind genuinely unclear (mixed pathways) | Pick the dominant one (highest parallel width). Note both in audit. |
| GPU candidacy borderline (e.g. ~50k pixels) | Apply default: candidate if performance.md complains about FPS or if user-facing fps obviously low. Otherwise note "borderline candidate" and queue OBSERVE Q. |
| `performance.md` documents NO mitigations | Check 5 produces zero rows — that's fine. State so explicitly. |
| Live uses third-party performance library (not foundation) | Log ARCH P2 `bypasses-foundation-via-third-party-lib`. CONTINUE audit. |

## Exit criteria

- [ ] Performance Tier Audit has all four Tier rows + Documented Mitigations + Shader Hygiene
- [ ] Workload classification cited from Live Data Pathways
- [ ] Every PERF issue has cited file:line in live source AND (where relevant) performance.md
- [ ] v4-state.md updated; `stage: F`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/14-p1-stage-F.md`
