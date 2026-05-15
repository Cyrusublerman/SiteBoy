# Lissajous Curves — Feature Parity

## Feature Inventory

Two legacy docs consolidated. `lissajous.md` (mixed bundle) is the primary spec source — it describes three intended variants (Harmonics, Editor, Animation) and a Y-delta parameter architecture. `lissajous-audit.md` (audit only) audited the prior ToolBase implementation. The live `.gen.js` source is the Lissajous-2 (Editor) variant only, with a significant architecture change: Y parameters are independent (not delta-from-X).

| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| Two-term X equation (Ax1, wx1, px1, phiX1, Ax2, wx2, px2, phiX2) | lissajous.md, audit | Confirmed | Present in SCRIPT_CONFIG.parameters; keys renamed to camelCase in v1.1.0 |
| X modulation term (Mx, wxm1, pxm1, phiXm1, wxm2, pxm2, phiXm2) | lissajous.md, audit | Confirmed | Present; default Mx=0 (disabled); keys renamed to camelCase in v1.1.0 |
| Two-term Y equation | lissajous.md | Confirmed | Y uses independent params (Ay1, wy1, etc.), not deltas |
| Y modulation term | lissajous.md | Confirmed | Present; default My=0 (disabled) |
| signedPow function | lissajous.md, audit | Confirmed | Defined in generator; uses imported `safePow` from shared evaluation.js |
| Scale and rotation | lissajous.md, audit | Confirmed | `scale` and `rotation` params in Global group |
| Points control | lissajous.md, audit | Confirmed | `points` param, range [1000, 80000] |
| Off-screen path-break guard | lissajous.md (audit: artifact lines) | Confirmed | Added in v1.1.0: `if (|rx| > 2W || |ry| > 2H) { first=true; continue; }` |
| 27 preset landmarks | lissajous.md | Changed | Live source has 28 presets (Circle added as first entry) |
| Y parameters as deltas from X (delta coupling) | lissajous.md | Absent | Live source uses independent absolute Y params; delta coupling architecture not ported |
| 50-state undo history | lissajous.md | Absent | No history stack in live source |
| Analysis functions (coupling check, integer freq check) | lissajous.md, audit | Absent | Not implemented in live source |
| Reset Y deltas button | lissajous.md | Absent | No delta architecture means no Reset Y needed |
| Live equation display | lissajous.md | Absent | No text rendering in draw() |
| Motion blur / trail | lissajous.md, audit | Absent | No trail accumulation; each frame is a fresh clear |
| Animation with phase drift | lissajous.md, audit | Confirmed (via animatableParams) | 11 animatable params declared with mode/rate; phase keys renamed to camelCase in v1.1.0 |
| Export PNG | lissajous.md, audit | Confirmed | export: { png: true } |
| Export SVG | lissajous.md, audit | Changed | Legacy audit: missing. Live: `svg: false` — explicitly disabled |
| Export GIF | lissajous.md (export block) | Confirmed | export: { gif: true } |
| Export WebM | lissajous.md (export block) | Confirmed | export: { webm: true } |
| Sequence export | lissajous.md, audit | Confirmed | export: { sequence: true } |
| Harmonics variant (musical ratio animation) | lissajous.md | Absent | Documented as separate variant; not in this generator |
| Lissajous-Animation variant (random walk) | lissajous.md, audit | Absent | Random walk parameter animation not implemented |

---

## Host Feature Audit

| Host feature | Used? | Notes |
| --- | --- | --- |
| Presets | Yes — 28 presets | All in LANDMARKS array; each preset produced by `preset()` helper with all 30 keys present |
| INFO tab | Yes | `infoSections` fully populated with 8 sections including ALGORITHM and KNOWN LIMITATIONS |
| Animation config | Yes | `type: 'parametric'`, `defaultFps: 60`, `defaultSpeed: 1`, 11 `animatableParams` declared; phase keys updated to camelCase in v1.1.0 |
| Export config | Yes — explicit | `png: true, svg: false, gif: true, webm: true, sequence: true` |
| animatableParams | Yes — declared | 11 params with mode ('phase' or 'oscillate'), rate, and optional min/max; key names updated to camelCase |
| Compute block | Yes | `compute: { cost: 'geometric' }` |

---

## Parity Holes

1. **Y delta coupling absent.** The legacy spec defines Y parameters as offsets from their X counterparts (e.g. `Ay1 = Ax1 + Ay1_delta`). The live source replaces this with fully independent Y parameters. The preset set has been redesigned to work with the independent-Y model — the prior delta-based preset values would not be compatible.

2. **Undo history (50 states) absent.** Documented in `lissajous.md` §4; confirmed absent by audit. No history stack in the live `.gen.js` script.

3. **Analysis functions absent.** Coupling check (shared X/Y frequencies) and integer frequency check (closed-curve indicator) are documented in `lissajous.md` §3 and confirmed absent by audit.

4. **Motion blur / trail absent.** The legacy audit documents a `motionBlur` slider; not present in the live source. Each frame clears the canvas completely.

5. **Live equation display absent.** The legacy spec includes formatted equation display in the sidebar; not rendered in the live generator.

6. **Harmonics and Animation variants absent.** The legacy spec documents three variants (Harmonics, Lissajous-2 Editor, Animation). The live generator implements only the Editor variant. The Harmonics variant is a separate generator (`harmonics.gen.js`). The Animation (random walk) variant is not implemented.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | X-axis term and modulation parameter set | reference/generators/lissajous/source/lissajous.gen.js:23-29 | Ax1..phi_xm2 |
| R-02 | param | Y-axis term and modulation parameter set | reference/generators/lissajous/source/lissajous.gen.js:26-29 | Ay1..phi_ym2 |
| R-03 | param | global params scale/rotation/points | reference/generators/lissajous/source/lissajous.gen.js:29 | global controls |
| R-04 | behaviour | signed power transform | reference/generators/lissajous/source/lissajous.gen.js:15-18 | `signedPow` |
| R-05 | behaviour | parametric evaluation pipeline | reference/generators/lissajous/source/lissajous.gen.js:93-117 | X/Y terms + modulation + rotation |
| R-06 | behaviour | landmark preset library | reference/generators/lissajous/source/lissajous.gen.js:43-78 | LANDMARKS collection |
| R-07 | behaviour | frame render sweep | reference/generators/lissajous/source/lissajous.gen.js:120-145 | sample + draw path |
| R-08 | interaction | host animation param integration | reference/generators/lissajous/source/lissajous.gen.js:180-214 | animatable params mapping |
| R-09 | export | png/gif/webm/sequence export support | reference/generators/lissajous/source/lissajous.gen.js:260-265 | export config |
| R-10 | behaviour | delta-coupled Y parameter architecture | reference/generators/lissajous/source/lissajous.gen.js:220-248 | legacy coupling model |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | signedPow | 15-18 | R-04 |
| F-02 | function | preset | 21-33 | R-06 |
| F-03 | function | evaluate | 93-117 | R-05 |
| F-04 | top-level-stmt | LANDMARKS definition | 43-78 | R-06 |
| F-05 | method | draw | 120-145 | R-07 |
| F-06 | top-level-stmt | parameters block | 150-179 | R-01, R-02, R-03 |
| F-07 | top-level-stmt | animatableParams block | 180-214 | R-08 |
| F-08 | top-level-stmt | delta-Y resolution logic | 220-248 | R-10 |
| F-09 | top-level-stmt | export config | 260-265 | R-09 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | param | X-axis term and modulation parameter set | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:118-173 | camelCase phase keys |
| L-02 | param | Y-axis term and modulation parameter set | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:176-231 | independent Y params |
| L-03 | param | global params scale/rotation/points | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:234-238 | global controls |
| L-04 | behaviour | signed power transform | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:14-17 | `signedPow` |
| L-05 | behaviour | inlined parametric evaluation pipeline | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:248-305 | evaluate logic in draw |
| L-06 | behaviour | landmark preset library | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:35-64 | LANDMARKS collection |
| L-07 | behaviour | frame render sweep | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:248-325 | sample + draw path with breaks |
| L-08 | interaction | host animation param integration | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:327-340 | animatable params mapping |
| L-09 | export | png/svg/gif/webm/sequence export support | assets/js/tools/generators/scripts/parametric/lissajous.gen.js:72-78 | explicit export config |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | X-axis term and modulation parameter set | L-01 | present | lissajous.gen.js:118-173 | — | none | — |
| R-02 | Y-axis term and modulation parameter set | L-02 | present | lissajous.gen.js:176-231 | — | none | — |
| R-03 | global params scale/rotation/points | L-03 | present | lissajous.gen.js:234-238 | — | none | — |
| R-04 | signed power transform | L-04 | present | lissajous.gen.js:14-17 | — | none | — |
| R-05 | parametric evaluation pipeline | L-05 | present | lissajous.gen.js:248-305 | evaluate() inlined into draw() | none | — |
| R-06 | landmark preset library | L-06 | present | lissajous.gen.js:35-64 | preset object wrapper changed to `{name, values}` | none | — |
| R-07 | frame render sweep | L-07 | present | lissajous.gen.js:248-325 | path-break guard added | none | — |
| R-08 | host animation param integration | L-08 | present | lissajous.gen.js:327-340 | phase keys renamed to camelCase | none | — |
| R-09 | export support | L-09 | partial | lissajous.gen.js:72-78 | SVG explicitly disabled in live | log EXP | P2 |
| R-10 | delta-coupled Y parameter architecture | — | absent | — | live uses independent absolute Y params | log GEN | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: `../../shared/evaluation.js` only (not `assets/js/shared/algorithms/*`)
- Algorithms inlined that have shared modules: coordinate transforms and matrix rotation logic inlined in draw loop
- Algorithms inlined where no shared module exists: generator-specific parametric evaluator (accepted as specialised)

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs used
- GPUFoundation: no GPU APIs used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: does not extend BaseComponent (procedural SCRIPT_CONFIG pattern)
- MathematicalFoundation: layout maths inlined (`W/2`, `H/2`) outside foundation ownership map

**Check 4 — State scope smells**
- Module-scope mutable state: none (LANDMARKS is module-const)

**Issues logged:** ARCH-005, ARCH-006

### Performance Tier Audit

**Primary workload:** geometric  
**Workload size estimate:** O(points), up to 80k samples/frame

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** n/a for geometric path renderer  
**Tier 3 (Worker offload):** n/a (no `computePixels` path)  
**Tier 4 (GPU):** n/a (no per-pixel/per-vertex GPU candidate path in this script)

**Documented mitigations:**
- `performance.md` still documents removed `evaluate()` call path and unresolved optimisation items that are already implemented in live (stale docs logged).

**Shader hygiene:** not applicable — no shader code

**Issues logged:** none

### v4 issues logged

- GEN-005, EXP-001, ARCH-005, ARCH-006, DOC-004, DOC-005, DOC-006

### v4 questions queued

- none (lissajous turn)
