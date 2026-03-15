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
