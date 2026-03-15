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
