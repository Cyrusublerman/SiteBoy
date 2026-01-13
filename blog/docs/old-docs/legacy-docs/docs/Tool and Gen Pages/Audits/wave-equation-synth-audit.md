# Wave Equation Synth — Audit

## 1. Source
- File: `blog/ideas/DUMP/wave_equation_synth_design.md`
- Goal: Generate audio from arbitrary mathematical equations, visualise in oscilloscope/circular loop modes, export audio and visuals.

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | Equation text | Function | Safe sandboxed compile | AUDIO-004 |
| 2 | Freq, rate, duration | Index vars | Wave indexing | AUDIO-005 |
| 3 | Index vars | y[i] samples | Equation evaluation | AUDIO-006 |
| 4 | Samples | AudioBuffer | Web Audio API | AUDIO-007 |
| 5 | Samples, cycles | Polyline | Oscilloscope mapping | CANVAS-014 |
| 6 | Segment samples, depth | Polar coords | r = R₀(1 + d·y) | CANVAS-015 |
| 7 | AudioBuffer | WAV file | Binary encoding | AUDIO-008 |
| 8 | Frames, FPS | GIF | Frame encoder | CANVAS-016 |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| AUDIO-004 | safeEquationCompiler | ❌ Missing | Implement |
| AUDIO-005 | waveIndexing | ❌ Missing | Implement |
| AUDIO-006 | equationEvaluator | ❌ Missing | Implement |
| AUDIO-007 | audioBufferSource | ❌ Missing | Implement |
| AUDIO-008 | wavExporter | ❌ Missing | Implement |
| CANVAS-014 | oscilloscopeRenderer | ❌ Missing | Implement |
| CANVAS-015 | circularLoopRenderer | ❌ Missing | Implement |
| CANVAS-016 | gifExporter | ❌ Missing | Implement |
| MATH-002 | clamp | ⚠️ Inline | Extract |
| MATH-004 | wrap | ⚠️ Inline | Extract |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | Safe equation sandboxing (new Function) | HIGH |
| RESEARCH | Wave indexing variables (p, w, u, t, g) | HIGH |
| RESEARCH | WAV file binary format encoding | MEDIUM |
| RESEARCH | Circular polar oscilloscope mapping | MEDIUM |
| VARIATION | Segment looping with stable visuals | LOW |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Oscilloscope | reference documentation/Oscilloscope/ | ✅ |
| WAV format | reference documentation/WAV/ | ✅ |
| Polar coordinates | reference documentation/Polar_coordinate_system/ | ✅ |

