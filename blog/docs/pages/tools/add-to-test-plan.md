# Features to Add to Tool Test Plan

This document tracks features that exist in tools but are not yet covered in `tool-test-ui.js`.

---

## Component Tests Needed

### 1. CheckpointList Component
**Source:** wave-interference original
**Status:** Not implemented as component
**Features to test:**
- [ ] Save checkpoint (captures current state)
- [ ] Load checkpoint (restores state)
- [ ] Delete checkpoint
- [ ] Duplicate checkpoint
- [ ] Rename checkpoint (inline edit)
- [ ] Duration per checkpoint
- [ ] Drag-and-drop reordering
- [ ] Empty state display
- [ ] Maximum checkpoint limit handling

### 2. Undo/History System
**Source:** wave-interference original, lissajous original
**Status:** Not implemented
**Features to test:**
- [ ] Push state to history
- [ ] Undo (Ctrl+Z)
- [ ] History depth limit (50)
- [ ] Disable undo button when empty

### 3. Equation Display (Interactive)
**Source:** wave-interference original
**Status:** Not implemented
**Features to test:**
- [ ] Live equation rendering
- [ ] Clickable numbers for inline editing
- [ ] Color-coded variables (R=red, X=green, Y=blue)
- [ ] Dynamic update on parameter change

### 4. Tab-Filtered Parameter Visibility
**Source:** wave-interference original
**Status:** Partially implemented (tabs exist, filtering doesn't)
**Features to test:**
- [ ] Show only relevant parameters per tab
- [ ] "Show All" toggle
- [ ] Hide zero-value parameters by default
- [ ] Smart visibility persistence

### 5. Keyboard Shortcuts
**Source:** wave-interference original
**Status:** Not implemented
**Features to test:**
- [ ] Ctrl+Z (undo)
- [ ] Ctrl+S (save checkpoint)
- [ ] Space (play/pause)
- [ ] Arrow keys (adjust focused slider)
- [ ] Tab (cycle through sliders)
- [ ] Shift+Arrow (10x step)
- [ ] Ctrl+Arrow (0.1x step)

---

## Animation Tests Needed

### 6. Phase Animation Controls
**Source:** wave-interference original
**Status:** Partially implemented
**Features to test:**
- [ ] Per-parameter enable/disable
- [ ] Per-parameter speed control
- [ ] Per-parameter direction (forward/reverse)
- [ ] Multiple simultaneous phase animations

### 7. Sequence Animation
**Source:** wave-interference original
**Status:** Implemented but needs testing
**Features to test:**
- [ ] Sequence playback between checkpoints
- [ ] Smoothstep interpolation
- [ ] Per-checkpoint duration
- [ ] Loop toggle
- [ ] Stop/reset
- [ ] Progress indicator

### 8. Timeline-Based Animation
**Source:** squares original
**Status:** NOT IMPLEMENTED (critical gap)
**Features to test:**
- [ ] Phase sequence with durations
- [ ] Transition animations between phases
- [ ] Effect overlays during phases
- [ ] Envelope functions (fade in/out)
- [ ] Total cycle timing

---

## Rendering Tests Needed

### 9. Draft Mode Rendering
**Source:** wave-interference original
**Status:** Not implemented
**Features to test:**
- [ ] Half-resolution while dragging
- [ ] Full resolution on release
- [ ] Performance improvement measurement

### 10. WebGL vs CPU Fallback
**Source:** wave-interference implementation
**Status:** Implemented
**Features to test:**
- [ ] WebGL detection
- [ ] Automatic fallback to CPU
- [ ] Visual parity between modes
- [ ] Performance comparison

---

## Export Tests Needed

### 11. SVG Export
**Source:** wave-interference original
**Status:** Implemented
**Features to test:**
- [ ] Vector output quality
- [ ] Resolution independence
- [ ] Complex pattern export

### 12. Animation Export (GIF/Video)
**Source:** tool-standards.md requirement
**Status:** Not implemented
**Features to test:**
- [ ] Frame capture sequence
- [ ] GIF encoding
- [ ] Video encoding (MP4)
- [ ] Duration control
- [ ] Frame rate control

---

## Pattern/Effect Tests Needed (Squares Specific)

### 13. Pattern Library
**Source:** squares original
**Status:** NOT IMPLEMENTED
**Patterns to test:**
- [ ] allBlack
- [ ] allWhite
- [ ] checkerboard
- [ ] horizontalStripes
- [ ] verticalStripes
- [ ] cafeWall
- [ ] diagonalStripes

### 14. Transition Library
**Source:** squares original
**Status:** NOT IMPLEMENTED
**Transitions to test:**
- [ ] radialWave
- [ ] linearSweep
- [ ] verticalSweep
- [ ] spiralUnwind
- [ ] randomFlicker

### 15. Effect Library
**Source:** squares original
**Status:** NOT IMPLEMENTED
**Effects to test:**
- [ ] none
- [ ] rotationWave
- [ ] compressionWave
- [ ] cafeWallShift
- [ ] radialPulse
- [ ] spiralRotation
- [ ] shapeMorph

---

## Priority Order

1. **Critical (blocking feature parity):**
   - Timeline-Based Animation (#8)
   - Pattern/Transition/Effect Libraries (#13-15)
   - CheckpointList Component (#1)

2. **High (UX polish):**
   - Undo/History System (#2)
   - Keyboard Shortcuts (#5)
   - Tab-Filtered Parameter Visibility (#4)

3. **Medium (nice to have):**
   - Equation Display (#3)
   - Draft Mode Rendering (#9)
   - Animation Export (#12)

4. **Low (already works, needs verification):**
   - Phase Animation Controls (#6)
   - Sequence Animation (#7)
   - WebGL vs CPU (#10)
   - SVG Export (#11)

