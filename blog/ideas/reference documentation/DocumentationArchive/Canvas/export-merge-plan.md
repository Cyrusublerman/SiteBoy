# Video Export Merge Plan

## Executive Summary

**Problem:** 3 separate video export systems with 100% redundancy:
1. **ExportController** (458 lines) - UNUSED, only via dead AnimationContainer
2. **AnimationExport** (933 lines) - UNUSED, never wired to tools
3. **P5ToVideo custom logic** (200+ lines) - ONLY working export, completely isolated

**Impact:** 
- 7 generative art tools have `animation` config but NO export functionality
- P5ToVideo duplicates all export logic
- 1,391 lines of dead code (ExportController + AnimationExport)
- Zero code reuse across tools

**Solution:** Activate AnimationExport, wire to ToolBase, migrate P5ToVideo, delete dead code

---

## Current State Analysis

### System 1: ExportController
**Location:** `assets/js/shared/export-controller.js`
**Status:** ❌ DEAD CODE
**Technology:** MediaRecorder API
**Formats:** PNG, JPEG, WebM, MP4
**Usage:** Only instantiated by AnimationContainer (which is never used)
**Lines:** 458

**Key Features:**
- Aspect ratio presets (square/portrait/landscape)
- Live preview resize
- Quality/bitrate controls
- Frame-by-frame with manual track.requestFrame()

**Why Dead:**
```javascript
// AnimationContainer.render() line 57-66
if (this.enableExport && this.animationInstance) {
    const exportCtrl = new ExportController({...}, this.deps);
    wrapper.appendChild(exportCtrl.render());
}
```
But NO tool creates AnimationContainer → ExportController never runs

### System 2: AnimationExport
**Location:** `assets/js/shared/components/output/AnimationExport.js`
**Status:** ❌ DEAD CODE (but most comprehensive)
**Technology:** RecordRTC + MediaRecorder + JSZip
**Formats:** PNG Sequence (ZIP), GIF, WebM, MP4
**Usage:** In ComponentLibrary but never instantiated
**Lines:** 933

**Key Features:**
- Animation metadata model (loop/sequence/infinite)
- renderFrame(frameIndex, totalFrames) callback
- getState/setState for frame-accurate rendering
- Silent pre-rendering (no playback)
- Progress tracking
- Resolution presets (720p/1080p/4K/custom)
- Lazy-loads RecordRTC/JSZip on demand

**Why Dead:**
- ToolBase doesn't read `config.animation`
- No injection logic in ToolBase constructor
- Tools declare `animation: { type, loopFrames, ... }` but it's ignored

### System 3: P5ToVideo Custom Logic
**Location:** `assets/js/tools/processors/p5-to-video.js`
**Status:** ✅ WORKING (only export that functions)
**Technology:** CCapture.js (P5.js-specific)
**Formats:** WebM, GIF, PNG sequence
**Usage:** P5.js to Video tool only
**Lines:** ~200 (export logic)

**Key Features:**
- Iframe sandbox for P5.js execution
- CCapture hijacks P5's draw() loop
- Silent recording (hide iframe)
- Message passing (iframe → parent)
- Frame-accurate capture

**Why Isolated:**
- P5.js-specific (CCapture designed for P5)
- Iframe architecture (security requirement)
- No shared components used

---

## Redundancy Matrix

| Feature | ExportController | AnimationExport | P5ToVideo |
|---------|------------------|-----------------|-----------|
| **Status** | Dead | Dead | Working |
| **WebM** | ✓ | ✓ | ✓ |
| **MP4** | ✓ | ✓ | ✗ |
| **GIF** | ✗ | ✓ | ✓ |
| **PNG** | ✓ (single) | ✓ (ZIP) | ✓ (sequence) |
| **JPEG** | ✓ | ✗ | ✗ |
| **Frame-by-frame** | ✓ | ✓ | ✓ |
| **Silent render** | ✗ | ✓ | ✓ |
| **Progress UI** | ✓ | ✓ | ✓ |
| **Aspect presets** | ✓ | ✓ | ✗ |
| **Metadata model** | ✗ | ✓ | ✗ |
| **renderFrame callback** | ✗ | ✓ | ✗ |
| **Lazy library loading** | ✗ | ✓ | ✗ |

**Winner:** AnimationExport (most comprehensive, best architecture)

---

## Shared Algorithms (Missing)

**Current:** All video logic embedded in components
**Needed:** Extract to `assets/js/shared/algorithms/video-export/`

### Core Algorithms to Extract

#### 1. Codec Selection Algorithm
```javascript
// algorithms/video-export/codec-selection.js
/**
 * Select best available codec for format
 * @source blog/ideas/reference documentation/[TBD]
 */
export function selectCodec(format) {
    const codecs = {
        mp4: ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1.4D401E', 'video/mp4'],
        webm: ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    };
    return codecs[format]?.find(c => MediaRecorder.isTypeSupported(c)) || null;
}
```

#### 2. Frame Capture Algorithm
```javascript
// algorithms/video-export/frame-capture.js
/**
 * Capture canvas frame to data URL or blob
 * @source blog/ideas/reference documentation/[TBD]
 */
export function captureFrame(canvas, format = 'png', quality = 1.0) {
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), `image/${format}`, quality);
    });
}
```

#### 3. Sequence Zipper Algorithm
```javascript
// algorithms/video-export/sequence-zipper.js
/**
 * Create ZIP archive from frame sequence
 * @source blog/ideas/reference documentation/[TBD]
 */
export async function zipFrameSequence(frames, metadata) {
    const zip = new JSZip();
    const folder = zip.folder('frames');
    frames.forEach((frame, i) => {
        const paddedNum = String(i).padStart(4, '0');
        folder.file(`frame-${paddedNum}.png`, frame.data, { base64: true });
    });
    folder.file('metadata.json', JSON.stringify(metadata, null, 2));
    return await zip.generateAsync({ type: 'blob' });
}
```

#### 4. Progress Calculation Algorithm
```javascript
// algorithms/video-export/progress-tracker.js
/**
 * Calculate export progress percentage
 * @source blog/ideas/reference documentation/[TBD]
 */
export function calculateProgress(currentFrame, totalFrames, stage = 'rendering') {
    const stageWeights = { rendering: 0.8, encoding: 0.2 };
    return (currentFrame / totalFrames) * (stageWeights[stage] * 100);
}
```

---

## Recommended Solution: Option A

### Activate AnimationExport + Extract Algorithms

**Why AnimationExport:**
1. Most comprehensive feature set
2. Already has metadata model (loop/sequence/infinite)
3. Already has renderFrame callback system
4. Already has silent rendering
5. Already lazy-loads dependencies
6. Matches tool standards doc expectations

**Implementation Steps:**

### Phase 1: Wire ToolBase (2 hours)

**File:** `assets/js/tools/core/tool-base.js`

```javascript
// In constructor, after line 109
this.canvasConfig = config.canvas ?? {};
this.animationConfig = config.animation ?? null; // ADD THIS

// In render(), after canvas area built (around line 200)
if (this.animationConfig) {
    this._injectAnimationExport();
}

// New method
_injectAnimationExport() {
    const { AnimationExport } = this.deps.ComponentLibrary;
    if (!AnimationExport) return;
    
    const exportComponent = new AnimationExport({
        canvas: this.canvas,
        getCanvas: () => this.canvas,
        type: this.animationConfig.type,
        loopFrames: this.animationConfig.loopFrames || 0,
        loopDuration: this.animationConfig.loopDuration || 0,
        sequenceLength: this.animationConfig.sequenceLength || 0,
        sequenceDuration: this.animationConfig.sequenceDuration || 0,
        defaultFps: this.animationConfig.defaultFps || 60,
        canPrerender: this.animationConfig.canPrerender !== false,
        renderFrame: (frameIndex, totalFrames) => {
            // Call tool's draw function
            if (this.onDraw) {
                this.onDraw(this.ctx, this.canvas, this.values);
            }
        },
        getState: () => ({ ...this.values }),
        setState: (state) => {
            Object.assign(this.values, state);
        }
    }, this.deps);
    
    this.addChild(exportComponent);
    this.componentInstances.push(exportComponent);
    
    // Inject into CANVAS tab or create EXPORT tab
    this._appendToCanvasTab(exportComponent.render());
}
```

### Phase 2: Test with One Tool (1 hour)

**File:** `assets/js/tools/generators/cymatics-tool.js`

Already has:
```javascript
animation: {
    type: 'infinite',
    loopFrames: 0,
    defaultFps: 60,
    canPrerender: true
}
```

**Test:**
1. Navigate to #tools/cymatics
2. Verify CANVAS tab has export controls
3. Test WebM export (30 frames)
4. Test GIF export (30 frames)
5. Test PNG sequence export (30 frames)

### Phase 3: Rollout to All Tools (30 min)

All 7 tools already have `animation` config, just need ToolBase wiring:
- ✓ wave-interference-tool.js
- ✓ torus-tool.js
- ✓ cymatics-tool.js
- ✓ circles-tool.js
- ✓ squares-tool.js
- ✓ harmonics-tool.js
- ✓ generative-pattern.js

### Phase 4: Adapt P5ToVideo (2 hours)

**Challenge:** P5ToVideo uses iframe + CCapture (P5-specific)

**Options:**

#### 4A: Keep P5ToVideo Separate (RECOMMENDED)
**Rationale:** 
- CCapture is P5-specific, designed for P5's draw() loop
- Iframe architecture required for security (untrusted code)
- AnimationExport can't easily work across iframe boundary
- P5ToVideo is a meta-tool (processor), not a generator

**Action:** Document why P5ToVideo is an exception

#### 4B: Hybrid Approach
- Keep iframe + CCapture for P5 execution
- Extract shared UI components (format dropdown, progress bar)
- Share download logic

**Action:** Extract `downloadBlob()` to shared utility

### Phase 5: Extract Algorithms (4 hours)

Create `assets/js/shared/algorithms/video-export/index.js`:
```javascript
export { selectCodec } from './codec-selection.js';
export { captureFrame } from './frame-capture.js';
export { zipFrameSequence } from './sequence-zipper.js';
export { calculateProgress } from './progress-tracker.js';
```

Refactor AnimationExport to use algorithms:
```javascript
import { selectCodec, captureFrame, zipFrameSequence } from '../algorithms/video-export/index.js';
```

### Phase 6: Delete Dead Code (30 min)

**Files to Delete:**
- `assets/js/shared/export-controller.js` (458 lines)
- `assets/js/shared/animation-container.js` (93 lines)

**Files to Update:**
- `assets/js/shared/component-library.js` - Remove imports/exports
- Search for any references (should be none)

**Savings:** 551 lines deleted

---

## Alternative: Option B (Not Recommended)

### Keep P5ToVideo, Skip Gen Art Export

**Why Consider:**
- Least work (2 hours vs 8 hours)
- P5ToVideo already works
- Gen art tools never had export before

**Why Reject:**
- Tool standards doc says animation export is REQUIRED
- All 7 tools have `animation` config (clearly intended)
- Users expect export from generative tools
- Leaves 1,391 lines of dead code

---

## Decision Required

**Recommendation:** Implement Option A (Activate AnimationExport)

**Estimated Effort:** 8-10 hours total
**Risk:** Low (AnimationExport already complete, just needs wiring)
**Benefit:** 
- 7 tools gain full export functionality
- Single export system (AnimationExport)
- Delete 551 lines of dead code
- Proper algorithm extraction

**User Approval Needed:**
1. Proceed with Option A?
2. Keep P5ToVideo separate (4A) or hybrid (4B)?
3. Priority: High/Medium/Low?

