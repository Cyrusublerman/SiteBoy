# SiteBoy Framework

This document formalises the site’s framework architecture as a set of owned concerns and explicit lifecycle rules.

The goal is to make every tool/page behave as a composition of:
- declarative content (JSON/config-driven)
- owned UI components (BaseComponent descendants via ComponentLibrary)
- owned math (LayoutCalculator exposed as `window.MathematicalFoundation`)
- owned animation timing (AnimationFoundation)
- owned GPU compute (GPUFoundation)
- owned routing (hash Router)

## Technical Domain

Framework design, UI lifecycle, dependency injection, rendering system boundaries, animation and GPU orchestration, and deterministic page composition.

## Architecture

### 1. Component foundation: `BaseComponent`
`assets/js/shared/foundation.js` owns the canonical UI base class.

Owned invariants:
- All UI components must extend `BaseComponent`.
- DOM manipulation is required to flow through BaseComponent methods (create/attach/update) rather than via ad-hoc global DOM calls.
- Components implement `.destroy()` and integrate cleanup.

BaseComponent provides:
- dependency injection (`deps.MF`, `deps.Resize`) with fallbacks to `window.MathematicalFoundation` and `window.ResizeManager`
- F-system access (`getF()` and F/2) so layout is dimensional rather than ad-hoc pixels
- lifecycle hooks and resize subscription hooks

### 2. Layout math: `LayoutCalculator` exposed as `MathematicalFoundation`
The core math provider is created/initialised by the app and exposed globally as `window.MathematicalFoundation`.

Ownership boundary:
- concrete layout math and dimension calculation belong to the layout system (initialised in `assets/js/core/app.js`)
- components request computed dimensions via `MF.calculateDimensions(...)` rather than performing their own unit math

This makes all UI spacing follow the same dimensional authority (`F`-system).

### 3. Animation timing: `AnimationFoundation`
`assets/js/core/animation-foundation.js` is the single source of truth for animation timing and lifecycle:
- unified lifecycle (`start/stop/pause/resume/destroy`)
- frame counting and timekeeping with pause-exclusion correctness
- automatic cleanup integration

This prevents fragmentation between tool-level animation and framework-level animation, and it keeps export determinism possible because frame progression becomes declared rather than implied.

### 4. GPU compute: `GPUFoundation`
`assets/js/core/gpu-foundation.js` owns GPU tier detection and compute context management:
- GPU capability detection across WebGPU and WebGL2
- shader pipeline compilation caching
- pixel upload/readback and ping-pong BufferRing support

The framework’s GPU compute boundary is:
- no tool should implement raw `navigator.gpu` / `canvas.getContext('webgl2')` detection directly
- tools use GPUFoundation’s contexts and dispatch interfaces

### 5. Routing: `Router`
`assets/js/core/router.js` provides hash-based navigation and route parsing.

Ownership boundary:
- routing state is a single source of truth for `section/subsection`
- section loading and display mode coordination happens through Router callbacks

### 6. UI composition: `ComponentLibrary`
`assets/js/shared/component-library.js` imports and re-exports all UI components, grouped by:
- foundation components
- layout components
- content components
- interactive components
- specialised output/canvas and tool components

`ComponentLibrary` is therefore the stable integration surface for pages/sections and tools; it prevents components from being re-implemented ad hoc in multiple places.

## Skills Demonstrated

- Owned concern separation: UI foundation vs layout math vs animation timing vs GPU compute vs routing.
- Dependency injection under global availability constraints (BaseComponent falls back to `window.MathematicalFoundation` and `window.ResizeManager`).
- Determinism prerequisites: animation frame progression is abstracted into AnimationFoundation rather than being improvisational.
- Tool compliance: tools are expected to inherit framework rules via ComponentLibrary.

## Stack

- Component foundation: `assets/js/shared/foundation.js`
- Layout math initialisation and `window.MathematicalFoundation`: `assets/js/core/app.js`
- Animation: `assets/js/core/animation-foundation.js`
- GPU compute: `assets/js/core/gpu-foundation.js`
- Routing: `assets/js/core/router.js`
- UI integration surface: `assets/js/shared/component-library.js`

