# Wave Equation Synth — Issues and Conflicts

## ERROR

**[RESOLVED]** **[BUG] Generator Not Implemented (Stub)**
Full implementation present in `wave-equation-synth.gen.js` v1.0.0: sandboxed equation compiler (AUDIO-004), wave indexing (AUDIO-005), equation evaluator (AUDIO-006), AudioBuffer source (AUDIO-007), WAV exporter (AUDIO-008), oscilloscope renderer (CANVAS-014), circular loop renderer (CANVAS-015), GIF exporter stub (CANVAS-016).

**[RESOLVED]** **[BUG] harmonics Parameter Has No Effect**
Replaced with `eq1`–`eq4` dropdown parameters (11 options each: Off, Sine, Triangle, Square, Sawtooth, 2nd Harm, 3rd Harm, 4th Harm, FM Sine, Pulse, AM Sine).

---

## WARN

**[RESOLVED]** **[ARCHITECTURE] Web Audio API is Outside Scope of draw Function**
Audio lifecycle managed within `draw` via closure state (`_audioCtx`, `_gainNode`, `_source`, `_wasPlaying`, `_buffer`, `_bufferKey`). Buffer regeneration guarded by a synthesis-param cache key. No host extension was required.

**[RESOLVED]** **[STANDARDS] No animation Block in SCRIPT_CONFIG**
`animation: { type: 'infinite', defaultFps: 60, sequencer: false, animationExport: false }` added.

**[RESOLVED]** **[STANDARDS] No export Block in SCRIPT_CONFIG**
`export: { png: true, gif: false, webm: false }` added. GIF suppressed: infinite animation with no defined loopFrames.

**[RESOLVED]** **[CONFLICT] Canvas Size Conflict (spec vs live)**
Canvas is now 420×420 per spec.

**[PARTIAL]** **[SECURITY] Sandboxed Equation Compiler Risk**
`safeEquationCompiler` uses `new Function` with restricted scope (only `p`, `w`, `u`, `t`, `g`, `Math` visible). Worker-based sandboxing not implemented. CSP environments that prohibit `eval`-equivalent constructs will block equation compilation. Documented in KNOWN LIMITATIONS.

---

## NOTE

**[RESOLVED]** **[STANDARDS] textarea Parameter Type Non-Standard**
Equations implemented as dropdown selections from a predefined list (EQUATION_MAP). Free-text equation input is not supported; documented as a known limitation.

**[RESOLVED]** **[RESEARCH] WAV Format Binary Encoding**
`wavExporter()` implements 16-bit PCM RIFF/WAVE format: RIFF header, fmt chunk (PCM, mono, 16-bit), data chunk. Sample encoding: `round(clamp(y,−1,1) × 32767)` as signed Int16LE. Not UI-accessible (no action button type in parameter system); documented as known limitation.

**[RESOLVED] [STALE DOC]** **DOC-048** `migration-log.md` stated "Generator is not implemented" — fixed by rewriting against live v1.0.0.

**[RESOLVED] [STALE DOC]** **DOC-049** Stub/spec docs reconciled with live v1.0.0 source.

---

## v4 turn log (2026-04-23)

- **GEN-025 (P1, WONTFIX):** Reference source is a placeholder stub; strict source parity against live implementation is not meaningful.
- **GEN-026 (P1, WONTFIX):** Reference single-parameter stub contract diverges from live synthesis/visual/audio parameter surface by design.
- **GEN-027 (P1, WONTFIX):** Reference minimal script skeleton diverges from live audio lifecycle, presets, and export/animation contracts by design.
- **ARCH-028 (P1, FIXED):** Live wave-equation-synth imports no modules from `assets/js/shared/` (`zero-shared-imports`).
- **DOC-048 (P2, FIXED):** `migration-log.md` rewritten against live v1.0.0.
- **DOC-049 (P2, FIXED):** Docs reconciled with live audio/visual/export/performance behaviour.
