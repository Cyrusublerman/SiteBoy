# Cymatics — Feature Parity

## Feature Inventory

Two legacy docs consolidated. `cymatics.md` (mixed bundle) is the primary spec source. `cymatics-audit.md` (audit only) audited the prior ToolBase implementation against cymatics.md.

| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| Three visualisation modes (particle, density, radial) | cymatics.md | Confirmed | `drawParticle`, `drawDensity`, `drawRadial` |
| 8 chord presets | cymatics.md | Confirmed | `CHORDS` object: maj, min, dim, aug, maj7, min7, dom7, sus4 |
| 8 spatial templates | cymatics.md | Changed | Live: 8 templates (triangle, circle6, circle12, grid3, grid4, star5, corners, cross); spec lists `star8` but live has `cross` |
| Root note selection (7 notes) | cymatics.md | Confirmed | `ROOT_NOTES`: C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494 |
| Wave physics: `amp × sin(2π × dist / freq − t)` | cymatics.md | Confirmed | `WaveSource.getWave()` |
| Amplitude control | cymatics.md | Confirmed | `amplitude` slider; live-applied |
| Speed control | cymatics.md | Confirmed | `speed` slider; `t = frame × speed` |
| Contrast/boost control | cymatics.md | Confirmed | `boost` slider; gamma correction in density/radial |
| Particle spacing control | cymatics.md | PASS | resolved — change detection triggers rebuild on `particleSpacing` change |
| Show sources toggle | cymatics.md | Confirmed | `showSources` toggle; draws 4px white circles |
| Pre-render support for animation export | cymatics-audit.md | Confirmed | `animation.canPrerender: true` declared |
| Alpha-bucket batch rendering | cymatics-audit.md | Confirmed | 20-bucket alpha batching in `drawParticle` |
| Click canvas to add sources | cymatics.md | Absent | No canvas event handling in live source |
| Web Audio oscillator playback | cymatics.md | Absent | No Web Audio API in live source |
| Per-source semitone selection | cymatics.md | Absent | Semitones assigned by chord template; no per-source override |
| Radial resolution slider | cymatics.md | Absent | Hardcoded `res=2` in `drawRadial`; no user control |
| Volume control | cymatics.md | Absent | No audio → no volume control |
| Dynamic source list with delete | cymatics.md | Absent | Sources not individually manageable |
| Individual source removal | cymatics.md | Absent | `destroy()` clears all |
| Play/pause animation | cymatics-audit.md | Absent | Animation always runs; no pause |
| `template` changes taking effect mid-session | — | PASS | resolved — change detection implemented |
| `chordType` changes taking effect mid-session | — | PASS | resolved — change detection implemented |
| Canvas size controls (canvasWidth/Height) | cymatics.md | Removed | Parameters removed from SCRIPT_CONFIG |

---

## Host Feature Audit

| Host feature | Used? | Notes |
| --- | --- | --- |
| Presets | Yes — 3 presets | Default, Density Field, Grid Pattern; `{ name, values: {} }` format now standard |
| INFO tab | Yes | `description` field present |
| Animation config | Yes | `type: 'infinite'`, `defaultFps: 60`, `canPrerender: true` |
| Export config | Yes | `png: true, gif: false, webm: true, sequence: true` (GIF removed — no defined loopFrames) |
| animatableParams | Yes | `animatableParams: []` moved inside `animation` block |
| destroy hook | Standard | `SCRIPT_CONFIG.destroy()` — correct method name |
| `compute` field | Non-standard hint | `{ cost: 'per-pixel', interactionScale: 0.5, idleDelay: 200 }` |

---

## Parity Holes

1. **Click-to-add-source interaction absent.** The original cymatics concept centres on interactive source placement; the live source provides only preset geometric templates.

2. **Web Audio playback absent.** Documented in spec as a core feature; not implemented.

3. **Radial resolution slider absent.** Spec documents a slider (1–20); radial mode uses hardcoded `res=2`.

4. **`star8` template absent from live source.** Spec lists `star8`; live has `cross` instead.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | vizMode | reference/generators/cymatics/source/cymatics.gen.js:458-466 | particle/density/radial |
| R-02 | param | showSources | reference/generators/cymatics/source/cymatics.gen.js:468-476 | source markers toggle |
| R-03 | param | rootNote | reference/generators/cymatics/source/cymatics.gen.js:478-486 | base note selector |
| R-04 | param | chordType | reference/generators/cymatics/source/cymatics.gen.js:488-496 | chord interval map |
| R-05 | param | template | reference/generators/cymatics/source/cymatics.gen.js:498-506 | source layout template |
| R-06 | param | amplitude | reference/generators/cymatics/source/cymatics.gen.js:508-516 | wave amplitude |
| R-07 | param | speed | reference/generators/cymatics/source/cymatics.gen.js:518-526 | time advance |
| R-08 | param | boost | reference/generators/cymatics/source/cymatics.gen.js:528-536 | contrast/gamma |
| R-09 | param | particleSpacing | reference/generators/cymatics/source/cymatics.gen.js:538-546 | particle grid spacing |
| R-10 | behaviour | wave source model and superposition | reference/generators/cymatics/source/cymatics.gen.js:99-127 | WaveSource class |
| R-11 | render-mode | particle mode renderer | reference/generators/cymatics/source/cymatics.gen.js:156-220 | drawParticle |
| R-12 | render-mode | density mode renderer | reference/generators/cymatics/source/cymatics.gen.js:222-279 | drawDensity |
| R-13 | render-mode | radial mode renderer | reference/generators/cymatics/source/cymatics.gen.js:281-338 | drawRadial |
| R-14 | behaviour | source template and chord setup | reference/generators/cymatics/source/cymatics.gen.js:142-150 | setupSources |
| R-15 | behaviour | particle initialisation | reference/generators/cymatics/source/cymatics.gen.js:133-140 | initParticles |
| R-16 | export | png/webm/sequence export support | reference/generators/cymatics/source/cymatics.gen.js:606-612 | export config |
| R-17 | behaviour | onDestroy cleanup hook | reference/generators/cymatics/source/cymatics.gen.js:637-642 | state reset hook |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | class-method | WaveSource.getWave | 110-115 | R-10 |
| F-02 | class-method | WaveSource.getDisplacement | 117-126 | R-10 |
| F-03 | function | initParticles | 133-140 | R-15 |
| F-04 | function | setupSources | 142-150 | R-14 |
| F-05 | function | drawParticle | 156-220 | R-11 |
| F-06 | function | drawDensity | 222-279 | R-12 |
| F-07 | function | drawRadial | 281-338 | R-13 |
| F-08 | method | draw | 340-451 | R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-08, R-09 |
| F-09 | method | onDestroy | 637-642 | R-17 |
| F-10 | top-level-stmt | export block | 606-612 | R-16 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | param | vizMode | assets/js/tools/generators/scripts/wave/cymatics.gen.js:560-568 | matches R-01 |
| L-02 | param | showSources | assets/js/tools/generators/scripts/wave/cymatics.gen.js:570-578 | matches R-02 |
| L-03 | param | rootNote | assets/js/tools/generators/scripts/wave/cymatics.gen.js:580-588 | matches R-03 |
| L-04 | param | chordType | assets/js/tools/generators/scripts/wave/cymatics.gen.js:590-598 | matches R-04 |
| L-05 | param | template | assets/js/tools/generators/scripts/wave/cymatics.gen.js:600-608 | matches R-05 |
| L-06 | param | amplitude | assets/js/tools/generators/scripts/wave/cymatics.gen.js:610-618 | matches R-06 |
| L-07 | param | speed | assets/js/tools/generators/scripts/wave/cymatics.gen.js:620-628 | matches R-07 |
| L-08 | param | boost | assets/js/tools/generators/scripts/wave/cymatics.gen.js:630-638 | matches R-08 |
| L-09 | param | particleSpacing | assets/js/tools/generators/scripts/wave/cymatics.gen.js:640-648 | matches R-09 |
| L-10 | behaviour | wave source model and superposition | assets/js/tools/generators/scripts/wave/cymatics.gen.js:103-128 | matches R-10 |
| L-11 | render-mode | particle mode renderer | assets/js/tools/generators/scripts/wave/cymatics.gen.js:196-256 | cache-backed displacement |
| L-12 | render-mode | density mode renderer | assets/js/tools/generators/scripts/wave/cymatics.gen.js:258-326 | cached distances + gamma |
| L-13 | render-mode | radial mode renderer | assets/js/tools/generators/scripts/wave/cymatics.gen.js:328-386 | cached distances + threshold |
| L-14 | behaviour | source template/chord setup with cache rebuild | assets/js/tools/generators/scripts/wave/cymatics.gen.js:143-190 | includes build*DistCache |
| L-15 | behaviour | particle initialisation | assets/js/tools/generators/scripts/wave/cymatics.gen.js:134-141 | matches R-15 |
| L-16 | export | png/webm/sequence export support | assets/js/tools/generators/scripts/wave/cymatics.gen.js:708-714 | matches R-16 |
| L-17 | behaviour | destroy cleanup hook | assets/js/tools/generators/scripts/wave/cymatics.gen.js:740-752 | standard destroy |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | vizMode | L-01 | present | cymatics.gen.js:560-568 | — | none | — |
| R-02 | showSources | L-02 | present | cymatics.gen.js:570-578 | — | none | — |
| R-03 | rootNote | L-03 | present | cymatics.gen.js:580-588 | — | none | — |
| R-04 | chordType | L-04 | present | cymatics.gen.js:590-598 | — | none | — |
| R-05 | template | L-05 | present | cymatics.gen.js:600-608 | — | none | — |
| R-06 | amplitude | L-06 | present | cymatics.gen.js:610-618 | — | none | — |
| R-07 | speed | L-07 | present | cymatics.gen.js:620-628 | — | none | — |
| R-08 | boost | L-08 | present | cymatics.gen.js:630-638 | — | none | — |
| R-09 | particleSpacing | L-09 | present | cymatics.gen.js:640-648 | — | none | — |
| R-10 | wave source model and superposition | L-10 | present | cymatics.gen.js:103-128 | — | none | — |
| R-11 | particle mode renderer | L-11 | present | cymatics.gen.js:196-256 | cache-backed optimisation | none | — |
| R-12 | density mode renderer | L-12 | present | cymatics.gen.js:258-326 | distance cache architecture added | none | — |
| R-13 | radial mode renderer | L-13 | present | cymatics.gen.js:328-386 | distance cache architecture added | none | — |
| R-14 | source template and chord setup | L-14 | present | cymatics.gen.js:143-190 | adds rebuild-on-change logic | none | — |
| R-15 | particle initialisation | L-15 | present | cymatics.gen.js:134-141 | — | none | — |
| R-16 | export support | L-16 | present | cymatics.gen.js:708-714 | gif removed intentionally for non-loop type | none | — |
| R-17 | onDestroy cleanup hook | L-17 | diverged | cymatics.gen.js:740-752 | hook renamed to standard `destroy` | log GEN | P2 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Algorithms inlined that have shared modules: wave-equation style distance/phase loops are inlined
- Algorithms inlined where no shared module exists: template/chord-specific cymatics source placement logic

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module (no BaseComponent inheritance)
- MathematicalFoundation: layout maths inlined in template generators (`W/2`, `H/4`, etc.)

**Check 4 — State scope smells**
- Module-scope mutable state present: `sources`, `particles`, `t`, `_pixelDistCache`, `_partDistCache`, `_lastTemplate`, `_lastChordType`, `_lastParticleSpacing`

**Issues logged:** ARCH-009, ARCH-010

### Performance Tier Audit

**Primary workload:** per-pixel  
**Workload size estimate:** up to 512×512 × source-count in density/radial paths

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** declared via `compute.interactionScale`/`idleDelay` in live script  
**Tier 3 (Worker offload):** not adopted (`compute.worker` absent)  
**Tier 4 (GPU):** candidate not adopted for heavy per-pixel density path

**Documented mitigations:**
- `performance.md` still claims unresolved heavy per-pixel sqrt path; live now includes pixel/particle distance caches.

**Shader hygiene:** not applicable — no shader source in generator

**Issues logged:** PERF-001, PERF-002

### v4 issues logged

- GEN-008, ARCH-009, ARCH-010, PERF-001, PERF-002, DOC-010, DOC-011, DOC-012

### v4 questions queued

- none (cymatics turn)
