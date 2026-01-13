# Cymatics Tool — Audit

## 1. Implementation

| Property | Value |
|----------|-------|
| File | `assets/js/tools/cymatics-tool.js` |
| Lines | 575 |
| Architecture | ToolBase |
| Animation | AnimationFoundation.AnimationLoop |
| Exports | `window.CymaticsTool` |

**Key Classes/Functions:**
- `CymaticsTool` class wrapper
- `WaveSource` class — individual wave source
- `CHORDS` object — 8 chord presets
- `initParticles()` — particle grid setup
- `getTemplatePositions()` — 8 geometric templates
- `drawParticle()`, `drawDensity()`, `drawRadial()` — visualization modes
- `onRenderFrame()` — pre-render support for export

---

## 2. vs Docs

Reference: `blog/docs/pages/art/generative/cymatics.md`

| Feature (from doc) | Implemented | Notes |
|--------------------|-------------|-------|
| Click to add sources | ❌ | Missing - only presets work |
| 3 visualization modes | ✅ | particle/density/radial |
| Chord presets (8) | ✅ | maj, min, dim, aug, etc. |
| Template positions (8) | ✅ | triangle, circle6, grid3x3, etc. |
| Web Audio playback | ❌ | Documented but not implemented |
| Amplitude control | ✅ | Slider |
| Speed control | ✅ | Slider |
| Contrast/boost control | ✅ | Slider |
| Root note selection | ✅ | Dropdown (7 notes) |
| Semitone selection | ❌ | Not implemented |
| Radial resolution | ❌ | Documented but not exposed |
| Volume control | ❌ | Documented but not implemented |
| Dynamic source list | ❌ | Documented but not implemented |
| Source removal | ❌ | Only "Clear All" |

**Missing from Doc:**
- Pre-render support for animation export (onRenderFrame)
- Batched particle rendering optimization

---

## 3. vs Guides

### tool-standards.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| Animation: play/pause | ❌ | Always plays |
| Animation: speed control | ✅ | Speed slider |
| Animation: AnimationFoundation | ✅ | Uses AnimationLoop |
| Audio: play/stop | ❌ | Audio not implemented |
| Audio: volume control | ❌ | Not implemented |
| Canvas: PNG export | ✅ | Via showControls |
| Status display | ✅ | Uses setStatus() |

### tool-build-guide.md

| Pattern | Status | Notes |
|---------|--------|-------|
| TOOL_CONFIG object | ✅ | Complete declarative config |
| TAB → BLOCK → COMPONENT | ✅ | 4 tabs |
| canvas.showControls | ✅ | Auto-injected CANVAS tab |
| onInit wiring | ✅ | Button binding |
| onUpdate handler | ✅ | Multiple handlers |
| onDraw rendering | ✅ | Canvas 2D drawing |
| onRenderFrame | ✅ | Pre-render for export |
| destroy() cleanup | ✅ | Stops animator, clears state |
| AnimationFoundation | ✅ | Uses AnimationLoop |

### f-system.md

| Requirement | Status | Notes |
|-------------|--------|-------|
| F-based sizing | ⚠️ | Canvas uses fixed 512×512 |
| CSS variables | ⚠️ | Some hardcoded colors |
| VGA palette | ✅ | Uses #c0c0c0 (silver) |

---

## 4. vs Reference Source Files

| Source | Location | Status |
|--------|----------|--------|
| cymatics original | `reference/.../cymatics/dist/script.js` | ⚠️ Partial port |

**Functions to Port:**
- Canvas click handler for adding sources
- Audio oscillator bank creation
- `startAudio()` / `stopAudio()` functions
- Per-source semitone selection
- Individual source removal

**Parity Issues:**
1. Interactive source placement missing
2. Web Audio API integration missing
3. Semitone picker UI missing

---

## 5. Gap Summary

### Critical Gaps
1. **Click to add sources** — Core feature documented but missing
2. **Web Audio playback** — Documented in both doc and source, not implemented
3. **Semitone selection** — Interactive feature missing

### Medium Gaps
1. No play/pause control
2. No radial resolution slider
3. No individual source removal
4. No volume control

### Minor Gaps
1. Fixed canvas size
2. Some hardcoded colors (though VGA compliant)

---

## 6. Recommended Actions

1. **Add canvas click handler:** Enable interactive source placement
2. **Implement Web Audio:** Port oscillator code from reference source
3. **Add semitone picker:** Radio buttons 0-12 as documented
4. **Add radial resolution:** Expose existing parameter as slider
5. **Add source management:** List sources with individual delete
6. **Add play/pause:** Control animation state
7. **Add volume control:** For audio playback

