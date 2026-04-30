# Cymatics — Issues and Conflicts

## Standards Compliance Check (`build-page.md` §8)

**This is a 2D generator (context: '2d'); p5 rules do not apply.**

**All generator rules:**

- No `document.*` / `window.*` / `.innerHTML` / `.createElement`: **PASS** — none present in source
- No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation: **PASS** — none present; animation is host-driven; `frame` argument is used deterministically
- Canvas output uses VGA palette or algorithmic colour with justification: **CONDITIONAL PASS** — greyscale values in density/radial modes are computed quantities; not VGA-discrete but justified by physics model. In particle mode: `rgba(192, 192, 192, ${alpha})` uses raw rgba string — base colour is VGA silver but the string form violates the "only CSS vars" rule.
- No inline algorithm that exists in `assets/js/shared/algorithms/`: **PASS** — wave superposition and chord-to-frequency mapping are not in the shared library
- State stored on module-level (mutable): **FAIL** — `sources`, `particles`, `t`, and cache variables are module-level mutable variables, not on `this`. Architecture issue persists.
- `destroy()` cleanup: **PASS** — `destroy()` method now on `SCRIPT_CONFIG` with full reset of all module-level state.
- `id` is kebab-case and matches filename: **PASS**
- `title` is Title Case: **PASS**
- `category` is one of permitted values: **PASS**
- All parameter keys are camelCase: **PASS**
- Preset format `{ name, values: {} }`: **PASS** — now standard format.
- Render hook is a method on SCRIPT_CONFIG: **PASS** — `draw` is now defined as a method directly on `SCRIPT_CONFIG`.

---

## Bug and Risk Detection

**[RESOLVED] [ERROR] [BUG] `template`, `chordType`, and `particleSpacing` have no effect after first frame**
Change detection implemented: `templateChanged = params.template !== _lastTemplate || params.chordType !== _lastChordType` and `spacingChanged = params.particleSpacing !== _lastParticleSpacing`. Either condition triggers a rebuild of sources, particles, and the relevant distance caches. Parameters now apply live.

**[RESOLVED] [WARN] [BUG] `canvasWidth` and `canvasHeight` parameters not wired in `draw()`**
Canvas parameter group removed. Parameters no longer declared.

**[RESOLVED] [STANDARDS] `animatableParams` at SCRIPT_CONFIG root, not inside `animation` block**
`animatableParams: []` moved inside `animation` block; parameter-builder reads `scriptConfig.animation.animatableParams`.

**[WARN] [STANDARDS] Module-level mutable state**
`let sources = []`, `let particles = []`, `let t = 0`, and cache variables remain at module scope. Correct multi-instance isolation requires a host that calls `destroy()` before remounting. Architecture risk unchanged.

**[RESOLVED] [WARN] [STANDARDS] `onDestroy` is a non-standard cleanup hook name**
Replaced by `destroy()` method on `SCRIPT_CONFIG`. Standard name now used.

**[RESOLVED] [WARN] [STANDARDS] Preset format uses flat objects**
All presets now use `{ name, values: { ... } }` format (current standard).

**[WARN] [STANDARDS] Raw `rgba()` string for particle alpha rendering**
`drawParticle()` still uses `` ctx.fillStyle = `rgba(192, 192, 192, ${bucketAlpha.toFixed(2)})` ``. Base colour is VGA silver (192 = 0xC0) but the `rgba()` string form violates the colour rule.

**[RESOLVED] [WARN] [STANDARDS] Render hook assigned as external function reference**
`draw` is now a method defined directly on `SCRIPT_CONFIG`, not an external function reference.

**[NOTE] [STANDARDS] Non-standard SCRIPT_CONFIG fields**
`compute: { cost, interactionScale, idleDelay }` and `animation.canPrerender` remain. These are hints for optional host subsystems; silently ignored if unrecognised.

---

## Performance Risks

**[PARTIAL] [ERROR] [PERFORMANCE] Density mode exceeds frame budget at high source counts**
`buildPixelDistCache` now precomputes all source-to-pixel distances into `Float32Array` per source, eliminating per-frame `sqrt` in the density inner loop. This approximately halves per-frame computation. Frame budget at grid4 (16 sources) on 512×512 remains significantly exceeded (~168–336ms estimated). The algorithmic complexity is inherent; the distance cache is the primary mitigation available short of a worker path.

**[RESOLVED] [WARN] [PERFORMANCE] Per-pixel sqrt evaluated redundantly every frame (density mode)**
`buildPixelDistCache` precomputes all distances once after source setup. Per-frame `sqrt` eliminated from density and radial inner loops.

---

## Parity Holes (as Issues)

**[RESOLVED] [NOTE] [PARITY] `template`, `chordType`, `particleSpacing` frozen after first frame**
Change detection and conditional rebuilds implemented. See resolved ERROR [BUG] above.

**[NOTE] [PARITY] Click-to-add source interaction absent**
No canvas event handling in live source. Primary interactive feature from the original concept unavailable.

**[NOTE] [PARITY] Web Audio oscillator playback absent**
No Web Audio API in live source. Audio feedback feature documented and expected is absent.

---

## Stale Documentation

**[STALE DOC] [DOC-015] — mechanisms.md Multiple Stale Entries**

(1) State model references `onDestroy` hook as the reset trigger — RESOLVED; now `destroy()` method on SCRIPT_CONFIG. (2) Render Loop step 1 describes pre-fix lazy-init (`particles.length === 0 || sources.length === 0` fires only once) — live source now includes change detection for `template`/`chordType`/`particleSpacing`. (3) Function inventory missing `buildPixelDistCache` and `buildParticleDistCache` (added as performance mitigation). (4) Rebuild Mechanism section describes frozen params as a current bug — bug is fixed in v1.0.1.

---

**[STALE DOC] [DOC-016] — ui-layout.md Multiple Stale Entries**

(1) `canvasWidth`/`canvasHeight` still listed in parameter table and sidebar structure (Canvas group removed in v1.0.1). (2) `chordType`, `template`, `particleSpacing` Controls column notes say "Applied only at first frame; changing after first frame has no effect" — bug fixed; change detection now handles all three. (3) Preset format note says "non-standard" — now standard `{ name, values }` format. (4) Sidebar structure includes Canvas group (removed).

---

**[MISSING DOC] [DOC-017] — migration-log.md Stale + source-reference.md Absent**

Migration log Open Items all describe pre-v1.0.1 state; many are resolved. Claims `source-reference.md` was produced with compliance score 2, but the file does not exist in the folder.

---

## Escalation Issues

**[NOTE] [ESCALATION] Algorithm candidate: 2D wave interference computation**
`WaveSource.getWave()` and `WaveSource.getDisplacement()` remain candidates for `assets/js/shared/algorithms/physics/wave-interference.js`. Same wave physics used in `wave-interference.gen.js`.

**[NOTE] [ESCALATION] Algorithm candidate: semitone-to-frequency mapping**
`this.noteFreq = baseFreq * Math.pow(2, semitone / 12)` remains a candidate for `assets/js/shared/algorithms/music/temperament.js`.

---

## v4 turn log (2026-04-23)

- **GEN-008 (P2, FIXED):** Added `onDestroy()` compatibility hook delegating to `destroy()` so reference lifecycle contract is honoured.
- **ARCH-009 (P1, FIXED):** Live cymatics imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **ARCH-010 (P1, SKIPPED-PHASE-3):** Full BaseComponent conversion is a structural refactor beyond this batch scope; queued as `Q-mid-fix-ARCH-010`.
- **PERF-001 (P1, FIXED):** Added Tier-3 worker compute path (`compute.worker` + `computePixels`) for per-pixel density workloads.
- **PERF-002 (P2, FIXED):** Added offscreen render staging for density/radial modes and worker-backed pixel compute fallback.
- **DOC-010 (P2, FIXED):** `description.md` updated to reflect live rebuild-on-change behaviour.
- **DOC-011 (P2, FIXED):** `ui-layout.md` updated to remove stale inert/frozen canvas and rebuild claims.
- **DOC-012 (P2, FIXED):** `mechanisms.md` updated for destroy/onDestroy lifecycle and rebuild flow.
