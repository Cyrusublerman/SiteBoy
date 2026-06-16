# D2 — TransportStrip Record Button — Analysis

**Item**: D2 (`blog/docs/todo/D2-animation-export.md`)
**Status**: WIP
**Last code change**: 2026-05-15 (`0ac5a754` — "gen fix and glyph start")
**Analysed**: 2026-05-27

---

## 1. Goal (verbatim from D2)

> Every generator exposes a deterministic N-frame recording from the TransportStrip.

**Done-when predicate**: Every `.gen.js` with `canvas.context ∈ {'p5','canvas2d'}` shows a record button. Output is a deterministic mp4/webm of N frames at the locked FPS chosen in the strip.

---

## 2. What Already Exists

### 2.1 AnimationExport engine (`assets/js/shared/components/output/AnimationExport.js`)
- Full export logic: frames→ZIP, WebM via MediaRecorder, GIF via RecordRTC, MP4.
- Deterministic frame loop: calls `renderFrame(i, totalFrames)` synchronously.
- State save/restore around export.
- Audio mux support (`setAudioEmitter`).
- Lazy-loads JSZip / RecordRTC via `AssetLoader`.
- Resolution presets (canvas/720p/1080p/4K/square/portrait/custom).
- Progress tracking + cancel.

### 2.2 GeneratorToolbar export panel
- Toolbar EXPORT button → dropdown panel.
- Two modes: **Image** (png/jpeg/webp/avif) and **Animation** (zip/webm/mp4/gif).
- Animation panel exposes: format, image-type (for ZIP), FPS, frames, duration, bitrate.
- Loop-length presets (×1, ×2, ×3) seeded from `setExportConfig({ loopFrames, defaultFps })`.
- Fires `onExport('animation', exportState)` → host routes to `_handleAnimationExport`.

### 2.3 GenerativeToolHost wiring
- `_injectExportUI()` instantiates `AnimationExport` headless (no DOM render — toolbar owns UI).
- `_handleAnimationExport(exportState)` pushes panel state into engine and calls `startExport()`.
- Pause-on-export + restore-on-complete lifecycle in place.

### 2.4 TransportStrip (`GeneratorTransportStrip`)
- Emits: `animSpeed` (slider), `toggleTimeline`.
- No record button, no REC indicator, no FPS lock UI.
- Purely speed + timeline toggle.

### 2.5 TransportStrip CSS
- Speed slider thumb/track styling uses `--f` / `var(--c-*)`. Compliant.

---

## 3. Gap Analysis

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| G1 | **No record button in TransportStrip** | Critical | D2 predicate requires it visible in the strip |
| G2 | **No FPS-lock UI** | High | "locked FPS chosen in the strip" — currently FPS is only in the export panel |
| G3 | **Frame loop not locked-FPS during live playback** | High | `AnimationLoop` uses wall-clock delta; determinism only holds during export |
| G4 | **No visual REC state indicator** | Medium | User has no feedback that recording is active until progress appears |
| G5 | **TransportStrip does not surface duration** | Medium | D2 says "surface duration / fps as TransportStrip params" |
| G6 | **Export panel is toolbar-anchored, not strip-anchored** | Low | May be acceptable — predicate says "from the TransportStrip" |
| G7 | **Compliance: inline styles in TransportStrip** | Low | All `style.cssText` should be CSS classes |
| G8 | **Compliance: inline styles in AnimationExport** | Low | Same pattern |

---

## 4. Architecture Decision: Where Does REC Live?

**Option A — REC button in TransportStrip, opens export panel inline below strip.**
- Pro: Matches D2 wording exactly ("record button" in the strip).
- Pro: Keeps recording semantics co-located with speed/timeline.
- Con: Export panel currently lives in toolbar; would need relocation or duplication.

**Option B — REC button in TransportStrip, triggers existing toolbar export panel.**
- Pro: Minimal code change. Strip gets a single button; clicking it opens the toolbar panel in animation mode and auto-starts.
- Con: Mild UX indirection — user clicks strip, panel opens elsewhere.

**Option C — REC button in TransportStrip, one-click start with last-used settings.**
- Pro: Fast workflow. Single press = start recording with prior config.
- Pro: Strip also shows FPS + duration readout for quick confirmation.
- Con: Needs settings persistence + a "configure" path for first use.

**Recommended**: Option C for primary UX, with long-press or secondary action to open full config. FPS + frame-count readout in strip gives at-a-glance context.

---

## 5. Implementation Plan

### Phase 1 — FPS Lock + Strip UI (core semantics)
1. Add `lockedFps` field to TransportStrip state.
2. Add FPS readout cell to strip (right of speed, left of timeline).
3. Add REC button cell to strip (rightmost, red ● glyph).
4. Wire `onChange('startRecord', null)` from REC button.
5. Wire `onChange('fpsLock', fps)` from FPS cell (click cycles 24/30/60).

### Phase 2 — Deterministic Frame Loop
6. When REC pressed: pause real-time AnimationLoop.
7. Enter deterministic loop: render frame N at locked interval (1000/fps ms).
8. Each frame: evaluate modulators at `frame = N`, call `draw()`, capture.
9. Use existing `AnimationExport.startExport()` under the hood.
10. On complete: restore live AnimationLoop.

### Phase 3 — Visual Feedback
11. Strip shows `● REC` indicator (red, blinking via AnimationFoundation).
12. Strip shows frame counter `042/300` during recording.
13. Strip shows elapsed time `01.4s / 5.0s`.
14. Disable speed slider + timeline toggle during record.

### Phase 4 — Polish + Compliance
15. Move inline styles to `tools.css` (TransportStrip classes).
16. Move inline styles for AnimationExport to `components.css`.
17. Run `page-compliance-audit` on TransportStrip.js.
18. Verify every `.gen.js` with `canvas2d` or `p5` context renders the REC button.

---

## 6. Files Touched

| File | Change |
|------|--------|
| `assets/js/shared/components/tool/TransportStrip.js` | Add REC button, FPS cell, REC state indicator |
| `assets/js/tools/generators/core/generative-tool-host.js` | Wire `startRecord` event from strip to AnimationExport |
| `assets/js/shared/components/output/AnimationExport.js` | Minor: accept `lockedFps` override from strip |
| `assets/css/tools.css` | TransportStrip classes (replace inline styles) |
| `assets/css/components.css` | AnimationExport classes |
| `assets/js/shared/components/tool/GeneratorToolbar.js` | Optional: sync FPS state with strip |

---

## 7. Blockers

None external. F3 (uncommitted work) previously overlapped but working tree is now clean for generators/.

---

## 8. Open Questions

- Q1: Should REC be available when animation type is `'none'` (static generators)?  
  → Likely no — predicate says "N-frame recording", implies animation.
- Q2: Audio mux — should the strip show an audio indicator when `getAudioEmitter` is wired?  
  → Nice-to-have, not in D2 predicate.
- Q3: Max recording duration / frame cap? Currently `AnimationExport` allows 36000 frames (10 min @ 60fps).  
  → Acceptable default.
