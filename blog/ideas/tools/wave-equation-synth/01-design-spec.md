# Wave Equation Synth — Design Specification

## 1. Overview

**Purpose:** Generate audio from arbitrary mathematical equations.

**Output Type:** Audio + Animation

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Base Frequency | slider | 1–2000 Hz | 440 | Samples per wave |
| Sample Rate | slider | 8000–192000 | 48000 | Audio resolution |
| Duration | slider | 0.1–300 s | 30 | Buffer length |
| Equation Count | stepper | 1–16 | 1 | Active equations |
| Equation Text | textarea | — | sin(2*pi*p) | DSP equation |

### Visualization

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Mode | dropdown | [Oscilloscope, Segmented, Circular] | Oscilloscope | Display mode |
| Cycles Shown | stepper | 1–64 | 4 | Visible cycles |
| Modulation Depth | slider | 0–1 | 0.3 | Radius modulation |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Core** — Frequency, Sample Rate, Duration, Equation Count

**Block: Equations** — Equation text areas

### Tab: AUDIO
**Block: Playback** — Play/Stop, Volume

**Block: Export** — WAV, Segment WAV

### Tab: CANVAS
**Block: Style** — Colors, Stroke Width

**Block: Export** — PNG, GIF

### Tab: INFO
**Block: Variables** — p, w, u, t, g descriptions

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

