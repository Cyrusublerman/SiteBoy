# Music + Audio

This document describes the site’s music-and-audio skillset as a single deterministic modelling pattern: musical relationships (base frequency + semitone offsets + chord templates) are converted into a wave-source parameterisation, which then drives both visual interference patterns and Web Audio oscillator playback.

## Technical Domain

Harmonic modelling, chord/interval mapping, wave interference visualisation, audio oscillator parameterisation, and frame-driven generative animation.

## Architecture

### 1. Music model: base note + semitone interval mapping
The project uses a musical base note frequency in Hz and builds additional sources by applying semitone offsets (interval steps) from that base.

The cymatics chord system is explicitly interval-based:
- `maj`: 0, 4, 7
- `min`: 0, 3, 7
- `dim`: 0, 3, 6
- `aug`: 0, 4, 8
- `maj7`: 0, 4, 7, 11
- `min7`: 0, 3, 7, 10
- `dom7`: 0, 4, 7, 10
- `sus4`: 0, 5, 7

Templates (spatial source placement) further define where each chord source is placed in the 2D canvas:
- `circle6`, `circle12`
- `grid3`, `grid4`
- `star5`, `star8`
- `corners`, `cross`

### 2. Unified wave-source pipeline (visual)
Each wave source is defined by:
- a position
- a frequency derived from the base note and semitone interval
- an amplitude

At each render frame, the visual field is produced by evaluating per-pixel wave interference by summing wave contributions from all sources, using a sinusoidal wave law of the form:
- `wave = A * sin(2π * dist / freq - t)`

The output can be rendered through multiple visualisation modes:
- particle/displacement (radial displacement)
- density/intensity (per-pixel intensity)
- radial (dot/radial sampling of interference)

### 3. Audio contract: Web Audio oscillator playback
The same musical parameters drive audio playback through Web Audio oscillators:
- base frequency selects the chord’s root pitch
- semitone offsets select chord member pitches
- amplitude and intensity parameters control perceived loudness/boost (as mapped by the implementation)

Playback is controlled by explicit play/stop actions.

### 4. Determinism and animation contract
Animation is driven by `AnimationFoundation.AnimationLoop` under host timing; this prevents internal ad-hoc timing loops and ensures frame-driven state evolution.

In practice, this means:
- a frame index (or monotonic time parameter) defines `t` evolution
- the same parameter state yields reproducible interference output for a given animation step

## Skills Demonstrated (competency tags)

- Interval arithmetic translating semitone steps into frequency-defined wave sources.
- Chord-template construction as explicit integer interval sets.
- Synchronous audio/visual parameter modelling (single musical state drives both domains).
- Frame-driven animation using `AnimationFoundation` rather than improvised timing loops.
- Wave evaluation and visual sampling strategies (particle/density/radial modes).

## Stack

- Cymatics piece reference: `blog/docs/pages/art/generative/cymatics.md`
- Animation timing foundation: `assets/js/core/animation-foundation.js` (as used by the cymatics tool contract)

