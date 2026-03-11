# Wave Equation Synth — Issues and Conflicts

## ERROR [BUG] — Generator Not Implemented (Stub)

**Location:** `assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js` — entire file.

**Issue:** Live script is a placeholder. `draw` fills black; `harmonics` param not read. Source file referenced in TODO comment does not exist.

**Impact:** Catastrophic — generator produces no output or audio.

**Required action:** Full implementation of sandboxed equation compiler, Web Audio pipeline, oscilloscope/circular renderers, WAV exporter.

---

## ERROR [BUG] — harmonics Parameter Has No Effect

**Fix:** Implement or remove.

---

## WARN [ARCHITECTURE] — Web Audio API is Outside Scope of draw Function

The spec calls for `AudioContext` instantiation and `AudioBuffer` playback. The `.gen.js` `draw` function signature `(ctx, canvas, params, frame)` has no mechanism for audio I/O. The host (`generative-tool-host.js`) would need to support an audio lifecycle hook (e.g., `init`, `onDestroy`, `onPlay`) beyond the standard `draw` contract.

**Resolution required:** Either (a) extend the generator host to support audio hooks, or (b) treat this generator as an exception with custom host integration.

---

## WARN [STANDARDS] — No animation Block in SCRIPT_CONFIG

**Fix:** Add `animation: { type: 'infinite' }` for the oscilloscope display.

---

## WARN [STANDARDS] — No export Block in SCRIPT_CONFIG

**Fix:** Add `export: { png: true, gif: true }` minimum (WAV export requires separate action button).

---

## WARN [CONFLICT] — Canvas Size Conflict (spec vs live)

**Spec:** 420×420. **Live:** 800×800. Resolve to spec when implementing.

---

## WARN [SECURITY] — Sandboxed Equation Compiler Risk

`new Function('p', 'w', 'u', 't', 'g', 'Math', expr)` prevents access to declared variables but does not prevent access to global objects accessible via prototype chains or via `globalThis`. Full sandboxing requires either a CSP-restricted Worker or a dedicated expression parser.

**Recommendation:** Run equation evaluation exclusively inside a Worker; never execute user equation strings on the main thread.

---

## NOTE [STANDARDS] — textarea Parameter Type Non-Standard

The spec uses `type: 'textarea'` for equation inputs. This is not a standard generator parameter type (`slider`, `radio`). The host must support free-text input fields for this generator.

---

## NOTE [RESEARCH] — WAV Format Binary Encoding

The WAV PCM format requires a RIFF header with specific chunk identifiers, sample rate, bit depth, and byte-rate fields. This is well-documented but non-trivial to implement correctly with 16-bit and 32-bit IEEE float variants.
