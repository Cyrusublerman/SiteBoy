The Music and Audio cluster is a set of tools that connect musical pitch relationships to spatial and visual phenomena. All three tools share a common theoretical spine: the equal-tempered chromatic scale maps semitone intervals to frequency ratios, and those frequencies drive both audible oscillators via the Web Audio API and visual wave computations on a 2D canvas.

**Cymatics** places point wave sources at user-defined or template-specified canvas positions, each assigned a semitone offset from a base pitch. The per-pixel wave superposition is visualised in three modes (particle displacement, density intensity, radial dots) and is simultaneously played back through one oscillator per source. Clicking the canvas adds a source at the cursor position; chord presets (major, minor, dominant 7th, suspended 4th, etc.) place a harmonically coherent set of sources at a chosen template geometry in one action.

**Wave Interference** is a lower-level visualisation of the same physics: a configurable number of wave sources are placed at parametric positions and their superposition is computed per pixel, without audio, with emphasis on the interference pattern geometry rather than the harmonic relationship.

**Wave Equation Synth** explores the physical wave equation on a 1D or 2D membrane as a sound synthesis metaphor, allowing the user to pluck or excite the membrane and hear the resulting resonant modes.

The three tools together document: equal-temperament arithmetic, chord interval sets, Web Audio oscillator management (including the browser autoplay restriction workaround), 2D wave interference computation, and three distinct visualisation strategies for the same underlying wave field.
