# Golden Grid — Issues and Conflicts

## ERROR

None.

## WARN

**[RESOLVED] [BUG] `animation.loopFrames` conflicts with `params.loopFrames`**
*Fix: `animation.loopFrames` replaced with a getter `get loopFrames() { return SCRIPT_CONFIG._liveLoopFrames ?? 360; }`; `p5Draw` syncs `SCRIPT_CONFIG._liveLoopFrames = params.loopFrames` every frame.*
~~`SCRIPT_CONFIG.animation.loopFrames = 360` is static. The user-adjustable `loopFrames` slider (60–720) changes `params.loopFrames`, which correctly updates time `t` and the rendered loop period. However, the host reads `animation.loopFrames` for pre-render frame count and export duration. At any `params.loopFrames ≠ 360`, the pre-render will capture the wrong number of frames.~~

**[RESOLVED] [STANDARDS] Preset format non-standard**
*Fix: Presets updated to `{ name, values: { ... } }` wrapper format.*
~~Flat objects `{ name, key1, key2, ... }` rather than `{ name, values: { ... } }`.~~

**[RESOLVED] [STANDARDS] No `export` block**
*Fix: `export: { png: true, gif: true, webm: false }` added.*
~~No PNG/GIF/WebM export declared.~~

**[RESOLVED] [STANDARDS] State on `SCRIPT_CONFIG` object — dead `_normBounds`**
*Fix: `_normBounds` dead property removed from `SCRIPT_CONFIG` and `p5Setup`; bounds now computed on demand in `p5Draw` under `_lastMaxDepth` guard and stored as `_cachedBounds`.*
~~`_normBounds` is a config property that is set in `p5Setup` but never read by `p5Draw`. Dead code. Same structural issue as `fibonacci-balls`/`animated-lines` regarding state-on-config, though here the state is inert.~~

**[RESOLVED] [PERFORMANCE] `_getRatio` called once per internal tree node**
*Fix: `_getRatio` eliminated; ratio computed once per frame as `const r = Math.pow(PHI, Math.sin(t * Math.PI * 2)); const ratio = r / (1 + r);` in `p5Draw` and passed as the final argument to `_subdivide`.*
~~`_getRatio(frame, loopFrames)` computes `PHI^sin(2πt)` where `frame` and `loopFrames` are constant for the entire frame. The result is identical for all `2^maxDepth − 1` internal nodes. At `maxDepth = 16`: 65,535 redundant `Math.pow(PHI, Math.sin(...))` evaluations per frame.~~

**[RESOLVED] [PERFORMANCE] Bounds recomputed every frame**
*Fix: `_lastMaxDepth` guard added; bounds cached in `_cachedBounds` and only recomputed when `params.maxDepth` changes.*
~~`p5Draw` computes 6 `Math.pow` calls for `wMax`, `wMin`, `hMax`, `hMin`, `aMax`, `aMin` every frame. These change only when `maxDepth` changes. A `_lastMaxDepth` guard would avoid redundant computation.~~

## NOTE

**[RESOLVED] [DEAD CODE] `_normBounds` and `p5Setup` bounds computation**
*Fix: `_normBounds` removed; `p5Setup` now only calls `colorMode`, `noStroke`, `noSmooth`, `noLoop`.*
~~`p5Setup` computes and stores `this._normBounds`. `p5Draw` independently recomputes `bounds` as a local constant. The stored `_normBounds` is never passed to `_subdivide`. Remove from `p5Setup` and `SCRIPT_CONFIG`.~~

## Stale Documentation

**[STALE DOC] [DOC-030] — ui-layout.md Multiple Stale Entries**

(1) Animation Config section documents `animation.loopFrames = 360` as "static; does not reflect params.loopFrames" and flags it as a conflict — RESOLVED (now a getter `get loopFrames() { return _liveLoopFrames ?? 360; }`). (2) Preset format noted as "flat object (non-standard)" — RESOLVED (now `{ name, values }` format). (3) Missing Controls lists "No export block" — RESOLVED (export block added). (4) Animation Config section needs to document the getter mechanism.

---

**[STALE DOC] [DOC-034] — migration-log.md Stale**

Open Items 1–7 describe pre-fix state. Items 1 (loopFrames conflict), 2 (_getRatio cache), 3 (preset format), 4 (export block), 5 (canPrerender), 6 (bounds cache), 7 (_normBounds) confirmed RESOLVED in issues-and-conflicts.md.

---

**[DESIGN] `loopFrames` as a user parameter is unusual**
All other generators with looping animations derive their loop from `animation.loopFrames` (a fixed constant). Exposing it as a user-facing slider creates the conflict noted above and may confuse users who expect it to be a read-only system property. The getter mechanism resolves the technical conflict but the UX ambiguity remains.

---

## v4 turn log (2026-04-23)

- **ARCH-018 (P1, FIXED):** Live golden-grid imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **PERF-008 (P2, WONTFIX):** Recursive p5 draw path has no worker/GPU acceleration; high `maxDepth` remains frame-budget sensitive.
- **DOC-025 (P2, FIXED):** `ui-layout.md` refreshed against current loop/preset/export state.
- **DOC-026 (P2, FIXED):** `migration-log.md` refreshed against live resolved items.
