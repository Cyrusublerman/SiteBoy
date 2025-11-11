# SiteBoy Generative Art - Feature Comparison Analysis

**Status:** Preliminary Analysis  
**Date:** 2025-11-10  
**Purpose:** Document differences between original standalone animations and current SiteBoy implementations

---

## 1. CIRCLES (Nested Rolling Circles)

### Original Features (`to process/circles/`)
**UI Elements:**
- 3 button controls: "Lines" | "B/W Alternating" | "Gradient"
- Active button highlighting
- Fixed 800×800 canvas

**Functions:**
- 100 nested circles rolling around each other
- 3 visual modes:
  - Lines: White outlines only
  - B/W: Alternating black/white filled circles
  - Gradient: 1% opacity layers building up
- 3600 frame cycle (60 seconds at 60fps)
- Direct DOM button manipulation

### Current SiteBoy Implementation (`animations/circles.js`)
**UI Elements:**
- ButtonGroup with 3 options: "LINES" | "B/W" | "GRADIENT"
- AnimationContainer with export controls
- Responsive canvas (F-based sizing)

**Functions:**
- ✅ All 3 visual modes preserved
- ✅ Same animation logic
- ✅ Export functionality (ADDED)
- ✅ Responsive sizing (ADDED)
- ✅ SiteBoy architecture (BaseComponent, AnimationFoundation)

### Status: ✅ **COMPLETE** - All features ported + enhancements added

---

## 2. CYMATICS (Wave Interference)

### Original Features (`to process/cymatics/`)
**UI Elements:**
- **Visualization modes:** 3 buttons (Particle | Density | Radial)
- **Base Note selector:** Dropdown with C4-B4 (12 chromatic notes)
- **Semitone selector:** 12 buttons (Root, +1, +2... +11) for next click
- **Next frequency display:** Shows Hz for next click
- **Chord presets:** 8 buttons (Major, Minor, Dim, Aug, Maj7, Min7, Dom7, Sus4)
- **Template presets:** 8 buttons (Circle 6, Circle 12, Grid 3×3, Grid 4×4, Star 5, Star 8, Corners, Cross)
- **Parameter inputs:** 4 number inputs
  - Amp (amplitude)
  - Speed (animation speed)
  - Boost (contrast/intensity)
  - Radial Res (radial mode resolution)
- **Source list:** Shows all wave sources with ID, semitone, frequency, amplitude
- **Remove buttons:** Individual X button for each source
- **Source count:** Displays number of sources
- **Canvas click:** Add wave source at click position
- **Audio controls:** Play/Stop buttons (Web Audio API)
- **Clear button:** Remove all sources

**Functions:**
- Wave interference simulation
- 3 visualization modes:
  - Particle: Physical displacement of grid points
  - Density: Grayscale heatmap with boost
  - Radial: Circle-based rendering with resolution control
- Musical frequency system (440Hz base)
- Semitone-based frequency selection
- Chord system with 8 presets
- Template system for positioning (8 geometric layouts)
- Interactive source placement (click to add)
- Dynamic source management (add/remove)
- Web Audio API sound generation
- Auto-update when base note changes
- Real-time parameter adjustment

### Current SiteBoy Implementation (`animations/cymatics.js`)
**UI Elements:**
- Minimal buttons: "TRIANGLE" | "SQUARE" | "CIRCLE" | "CLEAR"
- Canvas click to add sources
- AnimationContainer with export

**Functions:**
- ✅ Wave interference simulation
- ✅ Particle visualization only
- ✅ Click to add sources
- ✅ Basic pattern presets (3)
- ❌ NO visualization mode switching
- ❌ NO density/radial modes
- ❌ NO musical frequency system
- ❌ NO base note selector
- ❌ NO semitone selection
- ❌ NO chord presets
- ❌ NO template presets
- ❌ NO parameter controls (amp, speed, boost, radial res)
- ❌ NO source list/management
- ❌ NO individual source removal
- ❌ NO frequency display
- ❌ NO Web Audio API sound generation
- ❌ Fixed parameters (no user control)

### Status: 🔴 **INCOMPLETE** - Major features missing (~80% functionality missing)

**Missing Critical Features:**
1. Visualization mode switching (Density, Radial)
2. Musical frequency system (12-tone, chords)
3. Template system (8 geometric layouts)
4. Parameter controls (4 sliders)
5. Source management UI (list, remove, display)
6. Web Audio API integration
7. Chord presets (8 musical chords)

---

## 3. HARMONICS (Lissajous Harmonics)

### Original Features (`to process/harmonics/`)
**UI Elements:**
- Ratio display (shows current harmonic ratio like "1.53:1.21")
- Minimal UI (primarily visual)
- Fixed 800×800 canvas

**Functions:**
- 12-minute cycle (720 seconds total)
- 8 passes total (4 view cycles)
- Harmonic ratio morphing:
  - 13 musical intervals: unison→minor 2nd→major 2nd→minor 3rd→major 3rd→perfect 4th→tritone→perfect 5th→minor 6th→major 6th→minor 7th→major 7th→octave
  - Exact ratios: 1:1, 16:15, 9:8, 6:5, 5:4, 4:3, 45:32, 3:2, 8:5, 5:3, 9:5, 15:8, 2:1
- Time warping: Slowdown at each harmonic ratio (smoothstep easing²)
- View morphing between 4 projections:
  - lateralClosed: cos/sin combination
  - counterCurrent: rotating amplitude modulation
  - lateralOpen: sin/sin combination
  - concurrent: synchronized amplitude modulation
- Pass structure:
  - Even passes: ascending ratios (1:1→2:1), view stable
  - Odd passes: descending ratios (2:1→1:1), view transitioning
- Motion blur effect (5% alpha trails)
- 800 points per curve
- Advanced mathematical visualization

**Current SiteBoy Implementation (`animations/harmonics.js`)
**UI Elements:**
- Ratio display
- AnimationContainer with export

**Functions:**
- ✅ 12-minute cycle
- ✅ Harmonic ratio morphing
- ✅ 13 musical intervals
- ✅ View morphing (4 projections)
- ✅ Motion blur
- ✅ Time warping
- ✅ Pass structure (ascending/descending)
- ✅ All mathematical visualizations

### Status: ✅ **COMPLETE** - All features ported

---

## 4. TORUS (3D Toroidal Spiral)

### Original Features (`to process/torus/`)
**UI Elements:**
- None (autonomous animation)
- Fixed 800×800 canvas

**Functions:**
- 3D torus visualization
- Multiple projection:
  - Central torus spiral (36 filled ellipses)
  - 9 spirals in one direction (4 winds each)
  - 9 spirals in opposite direction (counter-rotation)
- 3 simultaneous rotations:
  - Torus rotation (major circle)
  - Spiral rotation (opposite direction)
  - X-axis rotation (tumbling effect)
- 3600 frame cycle (60 seconds at 60fps)
- Parameters:
  - Major radius (R): 150px
  - Minor radius (r): 150px
  - View angles: π/6 (X), π/8 (Y)
- White lines on black background
- Motion creates moiré patterns

### Current SiteBoy Implementation (`animations/torus.js`)
**UI Elements:**
- AnimationContainer with export

**Functions:**
- ✅ 3D torus visualization
- ✅ Central spiral (36 ellipses)
- ✅ 18 surface spirals (9+9 counter-rotating)
- ✅ All 3 rotation axes
- ✅ Same mathematical model
- ✅ Export functionality (ADDED)

### Status: ✅ **COMPLETE** - All features ported

---

## 5. LISSAJOUS-3 (Complex Parametric Curves)

### Original Features (`to process/las3/`)
**UI Elements:**
- **Equation display:** Shows full parametric equations for x(t) and y(t)
- **27 parameter controls:** Each with label and number input
  - X-axis: Ax1, wx1, px1, φ_x1, Ax2, wx2, px2, φ_x2, Mx, wxm1, pxm1, φ_xm1, wxm2, pxm2, φ_xm2
  - Y-axis deltas: Ay1_Δ, wy1_Δ, py1_Δ, φ_y1_Δ, Ay2_Δ, wy2_Δ, py2_Δ, φ_y2_Δ, My_Δ, wym1_Δ, pym1_Δ, φ_ym1_Δ, wym2_Δ, pym2_Δ, φ_ym2_Δ
- **Auto-cycling system:** Automatically iterates through all 27 parameters
- **Variable sequencing:** Structured exploration of parameter space
- **Range constraints:** Each parameter type has specific range
  - A (amplitude): -1 to 1, step 0.02
  - w (frequency): -250 to 250, step 1 (integer)
  - p (power): 0 to 5, step 1 (integer)
  - φ (phase): -2π to 2π, step 0.1
  - M (modulation): -1 to 1, step 0.02

**Functions:**
- Universal parametric equation system
- Two-term + modulation for each axis
- Y-axis as delta from X-axis
- Safe power function (handles negative bases)
- Automatic parameter exploration
- 20,000 points per curve
- High-quality rendering
- Fixed 540×540 canvas with 405px scale

### Current SiteBoy Implementation
**Status:** ❌ **NOT IMPLEMENTED**

### Status: 🔴 **NOT IMPLEMENTED** - Complex parameter exploration system

---

## 6. LISSAJOUS-2 (Enhanced Parametric Editor)

### Original Features (`to process/lassajous-2/`)
**UI Elements:**
- **Full parameter editor:** 15 primary + 12 delta controls
- **Template library:** 27 named presets with descriptions:
  - "Complex Interference: 300hz"
  - "Asymmetric Flow: 3:5"
  - "Interference Pattern: 260hz"
  - "Woven Bloom: 120hz"
  - "Modulated Ring: 60hz"
  - "Quintic Static: 500hz"
  - "Spiroform: 3:5"
  - "Involute Rosette: 1:3"
  - etc.
- **Template selector:** Dropdown with all presets
- **Global controls:**
  - Rotation: 0-360°
  - Scale: 20-300px
  - Points: 1000-80000
- **Analysis display:**
  - Frequency coupling percentage
  - Integer frequency detection
  - Visual indicators (✓/⚠)
- **Equation display:** Real-time formatted equations
- **Phase notation:** Displays as π multiples (π, 2π, π/2, etc.)
- **Undo system:** History stack for parameter changes
- **Reset Y button:** Reset Y-axis deltas to zero
- **Export button:** Save current parameters
- **Status bar:** Render time display
- **Debounced rendering:** Delays render for high point counts

**Functions:**
- Universal harmonic equation system
- Rotation parameter (global transform)
- Safe power function
- HarmonicManifold analysis class
- Frequency coupling detection
- Integer frequency validation
- Template system with 27 presets
- History management
- Performance optimization
- High-resolution rendering (up to 80K points)
- Formatted equation display with Unicode
- Phase display as π fractions

### Current SiteBoy Implementation (`animations/lissajous.js`)
**UI Elements:**
- Basic sliders: A, B, δ (delta) frequency ratio
- Mode buttons: "CURVE" | "DOTS"
- AnimationContainer with export

**Functions:**
- ✅ Basic Lissajous curves
- ✅ A:B frequency ratio
- ✅ Delta parameter
- ✅ Two visualization modes
- ❌ NO template library
- ❌ NO parameter editor
- ❌ NO modulation terms
- ❌ NO power controls
- ❌ NO phase controls
- ❌ NO global rotation
- ❌ NO analysis system
- ❌ NO undo system
- ❌ NO equation display
- ❌ Extremely simplified (3 params vs 27)

### Status: 🔴 **INCOMPLETE** - Massive feature gap (~90% missing)

**Missing Critical Features:**
1. 27-parameter universal equation system
2. Template library (27 presets)
3. Modulation terms (Mx, My with frequencies)
4. Power controls (px1, px2, py1, py2, etc.)
5. Phase controls (φ with π notation)
6. Global rotation transform
7. Analysis system (coupling, integer detection)
8. Undo/history system
9. Scale and point count controls
10. Formatted equation display

---

## 7. SQUARES (Optical Illusion Patterns)

### Original Features (`to process/squares/`)
**UI Elements:**
- **Info overlay:**
  - Phase name (e.g., "checkerboard + rotationWave")
  - Sub-phase description
  - Timer: current time / 4:00 total
- **Control buttons:**
  - PLAY/PAUSE toggle
  - RESTART button
  - HIDE/SHOW info toggle
- **Keyboard controls:**
  - Space: Play/Pause
  - R: Restart
  - H: Hide/Show info

**Functions:**
- 4-minute cycle (240 seconds)
- 50×50 grid of tiles
- 7 base patterns:
  - allBlack, allWhite, checkerboard, horizontalStripes, verticalStripes, cafeWall, diagonalStripes
- 5 transition types:
  - radialWave, linearSweep, verticalSweep, spiralUnwind, randomFlicker
- 6 geometric effects:
  - rotationWave, compressionWave, cafeWallShift, radialPulse, spiralRotation, shapeMorph
- 15 timeline phases with exact durations
- Effect envelopes (1s fade in/out)
- Shape morphing (squares to circles with roundness parameter)
- Tile flipping animations (3D-style scale transforms)
- Easing functions (easeIn, easeOut, easeInOut)
- Phase-aligned effects (end at neutral state)
- Spiral path generation for unwinding effect
- Hash function for deterministic randomness

### Current SiteBoy Implementation (`animations/squares.js`)
**UI Elements:**
- Play/Pause button
- Restart button
- Timeline info display (phase, type, time)
- AnimationContainer with export

**Functions:**
- ✅ 4-minute cycle
- ✅ 50×50 grid
- ✅ All 7 patterns
- ✅ All 5 transitions
- ✅ All 6 effects
- ✅ 15-phase timeline
- ✅ Effect envelopes
- ✅ Shape morphing
- ✅ Tile flipping
- ✅ All easing functions
- ✅ Phase alignment
- ✅ Spiral path
- ✅ Hash function
- ❌ NO keyboard controls
- ❌ NO hide/show toggle

### Status: 🟡 **MOSTLY COMPLETE** - Core features done, minor UI missing

**Missing Minor Features:**
1. Keyboard shortcuts (Space, R, H)
2. Hide/Show info toggle

---

## 8. TILE-ANIMATION-ENHANCED (Deterministic Tile System)

### Original Features (`to process/tile-animation-enhanced.html`)
**UI Elements:**
- **Grid controls:**
  - Cols: 2-12 input
  - Rows: 2-12 input
- **Tile size control:** 60-300px (step: 12)
- **Gap control:** 0-24px
- **FPS control:** 6-60
- **Refresh frames:** 24-360 (step: 12)
- **Control buttons:**
  - Play
  - Stop  
  - Regenerate
- **Click interaction:** Click tile to manually regenerate it

**Functions:**
- Deterministic tile system with seeded randomness
- Per-tile independent animation cycles
- **3 shapes:** square, circle, triangle
- **Gradient system:**
  - Triangle gradients centered at centroid (not bbox)
  - Rotation-linked gradient direction
  - Random inversion per cycle
- **Rotation mechanics:**
  - Dark side ALWAYS leads
  - Direction tied to gradient inversion
  - Rotation speed: 0.68° to 12.5° per frame
  - Speed inversely proportional to seam count
  - Initial random offset (0-360°)
- **Seam system:**
  - 1-11 seams per tile
  - Radial divisions creating pie slices
  - More seams = slower rotation (better visibility)
- **Motion blur:** 75% fade per frame (25% alpha)
- **Cycle system:**
  - Each tile has independent cycle
  - Refresh after N frames
  - New shape/seams/gradient on refresh
  - Different pattern each cycle (cycleState in hash)
- **Hash-based distribution:**
  - Pseudo-random but deterministic
  - No diagonal patterns
  - Varies by position + cycle state
- **Performance:**
  - Configurable FPS (6-60)
  - Independent canvas per tile
  - No global redraw

### Current SiteBoy Implementation
**Status:** ❌ **NOT IMPLEMENTED**

### Status: 🔴 **NOT IMPLEMENTED** - Sophisticated tile animation system

**Would Need to Implement:**
1. Multi-shape gradient system (3 shapes)
2. Deterministic seeded randomness
3. Per-tile cycle management
4. Dark-leading rotation mechanics
5. Centroid-based triangle gradients
6. Motion blur system
7. Seam count variation (1-11)
8. Speed/seam inverse relationship
9. Grid configuration UI
10. Click-to-regenerate interaction
11. Independent canvas management

---

## SUMMARY

| Animation | Status | Completeness | Critical Missing Features |
|-----------|--------|--------------|---------------------------|
| Circles | ✅ Complete | 100% | None - Enhanced |
| Cymatics | 🔴 Incomplete | ~20% | Viz modes, musical system, templates, parameters, audio |
| Harmonics | ✅ Complete | 100% | None |
| Torus | ✅ Complete | 100% | None |
| Lissajous-3 | 🔴 Not Implemented | 0% | Entire 27-parameter auto-exploration system |
| Lissajous-2 | 🔴 Incomplete | ~10% | 27 params, templates, modulation, analysis, undo |
| Squares | 🟡 Mostly Complete | ~95% | Keyboard shortcuts, hide/show toggle |
| Tile Animation | 🔴 Not Implemented | 0% | Entire deterministic multi-tile system |

---

## PRIORITY RECOMMENDATIONS

### High Priority (Core Functionality Missing)
1. **Cymatics** - Restore visualization modes (Density, Radial) and parameter controls
2. **Lissajous-2** - Implement template library and parameter editor
3. **Cymatics** - Add musical frequency system and chord presets

### Medium Priority (Advanced Features)
4. **Tile Animation** - Implement as new page (sophisticated system)
5. **Lissajous-3** - Implement as advanced exploration tool (separate from basic lissajous)
6. **Cymatics** - Add Web Audio API integration

### Low Priority (Polish)
7. **Squares** - Add keyboard shortcuts
8. **All** - Ensure export functionality works consistently

---

## ARCHITECTURAL NOTES

### What Works Well
- ✅ BaseComponent architecture successfully ported
- ✅ AnimationFoundation integration clean
- ✅ Export functionality added across animations
- ✅ Responsive sizing works well
- ✅ Complex math/rendering preserved accurately

### What Needs Attention
- ❌ UI controls drastically simplified (loss of functionality)
- ❌ Parameter systems stripped down or removed
- ❌ Preset/template libraries not ported
- ❌ Advanced interaction systems (audio, analysis) missing
- ❌ Some animations completely skipped

### Pattern Observed
**Issue:** Animations converted to SiteBoy architecture but with minimal UI, losing 50-90% of user controls and features. Core rendering works but interactivity severely reduced.

**Recommendation:** Restore UI controls using ComponentLibrary systematically. Most originals have rich parameter systems that enable exploration and experimentation.

