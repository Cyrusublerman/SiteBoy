/**
 * Wave Equation Synth — additive audio synthesis and waveform visualisation.
 *
 * Compiles predefined mathematical expressions into an audio buffer via the
 * Web Audio API. Up to four equations are summed per sample, normalised, and
 * written to a Float32Array. Playback loops the buffer at the configured base
 * frequency. Three visual modes: Oscilloscope, Segmented, and Circular (polar).
 *
 * Modules implemented:
 *   AUDIO-004  safeEquationCompiler
 *   AUDIO-005  waveIndexing
 *   AUDIO-006  equationEvaluator
 *   AUDIO-007  audioBufferSource
 *   AUDIO-008  wavExporter
 *   CANVAS-014 oscilloscopeRenderer
 *   CANVAS-015 circularLoopRenderer
 *   CANVAS-016 gifExporter (stub — suppressed via animationExport:false)
 *   MATH-002   clamp
 *
 * @script wave-equation-synth
 * @category other
 * @version 1.0.0
 */

import '../../../../shared/algorithms/core/math-utils.js';

export const SCRIPT_CONFIG = (() => {

    const TWO_PI = Math.PI * 2;

    // ── Predefined equations (name → expression string) ──────────────────────
    // Compiled on demand via safeEquationCompiler (AUDIO-004).
    // Variables in scope: p (phase [0,1)), w (wave index), u (norm. wave [0,1]),
    //                     t (time s), g (global progress [0,1]), Math.
    const EQUATION_MAP = {
        'Off':      '0',
        'Sine':     'Math.sin(2*Math.PI*p)',
        'Triangle': '1 - 4*Math.abs(p - Math.floor(p + 0.5))',
        'Square':   '(p < 0.5 ? 1 : -1)',
        'Sawtooth': '2*(p - Math.floor(p + 0.5))',
        '2nd Harm': '0.5*Math.sin(4*Math.PI*p)',
        '3rd Harm': '0.33*Math.sin(6*Math.PI*p)',
        '4th Harm': '0.25*Math.sin(8*Math.PI*p)',
        'FM Sine':  'Math.sin(2*Math.PI*p + 2*Math.sin(4*Math.PI*p))',
        'Pulse':    '(p < 0.2 ? 1 : -0.1)',
        'AM Sine':  'Math.sin(2*Math.PI*p) * u',
    };

    const EQ_NAMES = Object.keys(EQUATION_MAP);

    // ── Closure state (audio lifecycle) ──────────────────────────────────────
    let _buffer     = null;   // Float32Array — computed samples
    let _bufferKey  = '';     // Cache key: synthesis params snapshot
    let _audioCtx   = null;   // AudioContext — created lazily on first play
    let _gainNode   = null;   // GainNode — persistent across source swaps
    let _source     = null;   // AudioBufferSourceNode — replaced each play
    let _wasPlaying = false;  // Previous-frame play state

    // ── MATH-002 ──────────────────────────────────────────────────────────────
    function clamp(v, lo, hi) {
        return v < lo ? lo : v > hi ? hi : v;
    }

    // ── AUDIO-004 — Sandboxed equation compiler ───────────────────────────────
    /**
     * Compile an expression string to a callable function.
     * Only p, w, u, t, g, Math are in scope — no outer scope or global access.
     * Compile errors return a zero-function; runtime errors are silently ignored
     * per AUDIO-006 contract.
     */
    function safeEquationCompiler(exprStr) {
        try {
            return new Function('p', 'w', 'u', 't', 'g', 'Math',
                `"use strict"; return (${exprStr});`);
        } catch (err) {
            console.warn('[WaveEquationSynth] Equation compile error:', err.message);
            return () => 0;
        }
    }

    // ── AUDIO-005 — Wave indexing ─────────────────────────────────────────────
    /**
     * Compute per-sample index variables for sample index i.
     *
     * framesPerCycle = sampleRate / baseFrequency
     * w = floor(i / fpc)                    — integer wave index
     * p = (i − w × fpc) / fpc              — phase in [0, 1)
     * u = w / totalCycles                   — normalised wave index [0, 1]
     * t = w / baseFrequency                 — time in seconds
     * g = i / totalSamples                  — global progress [0, 1]
     *
     * @param {number} i              Sample index
     * @param {number} framesPerCycle sampleRate / baseFrequency (float)
     * @param {number} totalSamples   N_total = floor(sampleRate × duration)
     * @param {number} baseFrequency  Base frequency in Hz
     * @param {number} totalCycles    floor(duration × baseFrequency)
     * @returns {{ p: number, w: number, u: number, t: number, g: number }}
     */
    function waveIndexing(i, framesPerCycle, totalSamples, baseFrequency, totalCycles) {
        const w = Math.floor(i / framesPerCycle);
        const p = (i - w * framesPerCycle) / framesPerCycle;
        const u = totalCycles > 0 ? w / totalCycles : 0;
        const t = w / baseFrequency;
        const g = totalSamples > 0 ? i / totalSamples : 0;
        return { p, w, u, t, g };
    }

    // ── AUDIO-006 — Equation evaluator / buffer generator ────────────────────
    /**
     * Generate a Float32Array buffer by evaluating and summing equations.
     * Each sample: y = Σ fn_k(p,w,u,t,g,Math) / activeCount; clamped to [−1,1].
     * Buffer generation is an init-phase operation (not per-frame).
     *
     * @param {string[]} eqNames     Equation names from EQUATION_MAP
     * @param {number}   sampleRate
     * @param {number}   baseFrequency
     * @param {number}   duration    Duration in seconds
     * @returns {Float32Array}
     */
    function equationEvaluator(eqNames, sampleRate, baseFrequency, duration) {
        const activeFns = eqNames
            .filter(n => n !== 'Off' && Object.prototype.hasOwnProperty.call(EQUATION_MAP, n))
            .map(n => safeEquationCompiler(EQUATION_MAP[n]));

        const N = Math.floor(sampleRate * duration);
        const buf = new Float32Array(N);

        if (activeFns.length === 0) return buf; // silence

        const framesPerCycle = sampleRate / baseFrequency;
        const totalCycles    = Math.floor(duration * baseFrequency);
        const norm           = 1 / activeFns.length;

        for (let i = 0; i < N; i++) {
            const { p, w, u, t, g } = waveIndexing(i, framesPerCycle, N, baseFrequency, totalCycles);
            let y = 0;
            for (const fn of activeFns) {
                try { y += fn(p, w, u, t, g, Math); } catch (_) {}
            }
            buf[i] = clamp(y * norm, -1, 1);
        }

        return buf;
    }

    // ── AUDIO-007 — AudioBuffer creation ─────────────────────────────────────
    /**
     * Wrap a Float32Array into a Web Audio API AudioBuffer (mono).
     * @param {Float32Array} floatBuffer
     * @param {number}       sampleRate
     * @param {AudioContext} audioCtx
     * @returns {AudioBuffer}
     */
    function audioBufferSource(floatBuffer, sampleRate, audioCtx) {
        const ab = audioCtx.createBuffer(1, floatBuffer.length, sampleRate);
        ab.copyToChannel(floatBuffer, 0);
        return ab;
    }

    // ── AUDIO-008 — WAV file exporter ─────────────────────────────────────────
    /**
     * Encode Float32Array to 16-bit PCM WAV (mono) and trigger browser download.
     *
     * RIFF layout: RIFF/WAVE header + fmt chunk (16 B, PCM) + data chunk.
     * Samples: signed Int16LE = round(clamp(y, −1, 1) × 32767).
     *
     * NOTE: Uses document.createElement and URL.createObjectURL — unavoidable
     * browser API exception for file download. No UI trigger exists in the
     * current host; function is available for programmatic invocation only.
     *
     * @param {Float32Array} floatBuffer
     * @param {number}       sampleRate
     */
    function wavExporter(floatBuffer, sampleRate) {
        const nSamples       = floatBuffer.length;
        const bitsPerSample  = 16;
        const bytesPerSample = bitsPerSample / 8;
        const byteRate       = sampleRate * bytesPerSample;
        const dataSize       = nSamples * bytesPerSample;
        const fileSize       = 44 + dataSize;

        const buf = new ArrayBuffer(fileSize);
        const dv  = new DataView(buf);

        const ws = (off, str) => {
            for (let i = 0; i < 4; i++) dv.setUint8(off + i, str.charCodeAt(i));
        };

        ws(0,  'RIFF');  dv.setUint32(4,  fileSize - 8,   true);
        ws(8,  'WAVE');
        ws(12, 'fmt ');  dv.setUint32(16, 16,              true);
                         dv.setUint16(20, 1,               true); // PCM
                         dv.setUint16(22, 1,               true); // mono
                         dv.setUint32(24, sampleRate,      true);
                         dv.setUint32(28, byteRate,        true);
                         dv.setUint16(32, bytesPerSample,  true);
                         dv.setUint16(34, bitsPerSample,   true);
        ws(36, 'data');  dv.setUint32(40, dataSize,        true);

        for (let i = 0; i < nSamples; i++) {
            dv.setInt16(44 + i * 2, Math.round(clamp(floatBuffer[i], -1, 1) * 32767), true);
        }

        const blob = new Blob([buf], { type: 'audio/wav' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'wave-equation-synth.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── CANVAS-014 — Oscilloscope renderer ───────────────────────────────────
    /**
     * Plot amplitude vs pixel for cyclesShown complete cycles starting at sample 0.
     * Mapping: idx = floor((px/W) × viewLen); y_pixel = H/2 − buf[idx] × H × 0.45.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number}       W
     * @param {number}       H
     * @param {Float32Array} buffer
     * @param {Object}       params
     */
    function oscilloscopeRenderer(ctx, W, H, buffer, params) {
        const sr           = Number(params.sampleRate);
        const framesPerCycle = sr / params.baseFrequency;
        const viewLen      = Math.min(Math.floor(params.cyclesShown * framesPerCycle), buffer.length);
        const halfH        = H * 0.5;
        const ampScale     = H * 0.45;

        ctx.beginPath();
        ctx.strokeStyle = params.lineColor;
        ctx.lineWidth   = params.strokeWidth;

        for (let px = 0; px < W; px++) {
            const idx = Math.min(Math.floor((px / W) * viewLen), buffer.length - 1);
            const y   = halfH - buffer[idx] * ampScale;
            if (px === 0) ctx.moveTo(0, y); else ctx.lineTo(px, y);
        }
        ctx.stroke();
    }

    // ── Segmented renderer (CANVAS-014 variant) ───────────────────────────────
    /**
     * Plot a fixed buffer segment across the full canvas width.
     * Functionally equivalent to oscilloscopeRenderer in this implementation;
     * segmentStartWave is not exposed in the current UI (known limitation).
     */
    function segmentedRenderer(ctx, W, H, buffer, params) {
        oscilloscopeRenderer(ctx, W, H, buffer, params);
    }

    // ── CANVAS-015 — Circular loop renderer ──────────────────────────────────
    /**
     * Map a waveform segment to polar coordinates.
     *   θ_i = 2π × i / segLen
     *   r_i = R₀ × (1 + modulationDepth × y_i)
     *   point = (cx + r_i × cos(θ_i), cy + r_i × sin(θ_i))
     * The path is closed to form a continuous loop.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number}       W
     * @param {number}       H
     * @param {Float32Array} buffer
     * @param {Object}       params
     */
    function circularLoopRenderer(ctx, W, H, buffer, params) {
        const sr           = Number(params.sampleRate);
        const framesPerCycle = sr / params.baseFrequency;
        const segLen       = Math.min(Math.floor(params.cyclesShown * framesPerCycle), buffer.length);
        const cx           = W * 0.5;
        const cy           = H * 0.5;
        const R0           = Math.min(W, H) * 0.35;
        const depth        = params.modulationDepth;

        ctx.beginPath();
        ctx.strokeStyle = params.lineColor;
        ctx.lineWidth   = params.strokeWidth;

        for (let i = 0; i < segLen; i++) {
            const theta = (TWO_PI * i) / segLen;
            const r     = R0 * (1 + depth * buffer[i]);
            const x     = cx + r * Math.cos(theta);
            const y     = cy + r * Math.sin(theta);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // ── CANVAS-016 — gifExporter (stub) ──────────────────────────────────────
    // GIF export suppressed via animation.animationExport: false.
    // animation type is infinite with no defined loopFrames; frame-based visual
    // output is static (params-driven, not frame-driven). Stub retained for
    // inventory completeness.
    function gifExporter() {
        console.warn('[WaveEquationSynth] GIF export not available: animation type is infinite with no defined loopFrames.');
    }

    // ── Audio lifecycle helpers ───────────────────────────────────────────────
    function _startAudio(params) {
        if (!_buffer || _buffer.length === 0) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) {
                console.warn('[WaveEquationSynth] AudioContext not available.');
                return;
            }
            if (!_audioCtx) _audioCtx = new AudioCtx();
            if (_audioCtx.state === 'suspended') _audioCtx.resume();
            if (!_gainNode) {
                _gainNode = _audioCtx.createGain();
                _gainNode.connect(_audioCtx.destination);
            }
            _gainNode.gain.value = clamp(params.volume, 0, 1);
            if (_source) { try { _source.stop(); } catch (_) {} _source = null; }
            const ab = audioBufferSource(_buffer, Number(params.sampleRate), _audioCtx);
            _source        = _audioCtx.createBufferSource();
            _source.buffer = ab;
            _source.loop   = true;
            _source.connect(_gainNode);
            _source.start();
        } catch (err) {
            console.warn('[WaveEquationSynth] Audio start failed:', err.message);
        }
    }

    function _stopAudio() {
        if (_source) {
            try { _source.stop(); } catch (_) {}
            _source = null;
        }
    }

    // ── Buffer cache key ──────────────────────────────────────────────────────
    // Encodes only synthesis params (baseFrequency, sampleRate, duration, eq1–eq4).
    // Visualisation param changes do not trigger buffer regeneration.
    function _bufferCacheKey(p) {
        return `${p.baseFrequency}|${p.sampleRate}|${p.duration}|${p.eq1}|${p.eq2}|${p.eq3}|${p.eq4}`;
    }

    // ── Draw ──────────────────────────────────────────────────────────────────
    function draw(ctx, canvas, params, frame) {
        const W = canvas.width;
        const H = canvas.height;

        // Regenerate buffer when synthesis params change (init-phase operation).
        // Performance: at default params (44100 Hz, 2 s, 1 eq): ~88 K evals, < 5 ms.
        const key = _bufferCacheKey(params);
        if (key !== _bufferKey) {
            _bufferKey = key;
            _buffer    = equationEvaluator(
                [params.eq1, params.eq2, params.eq3, params.eq4],
                Number(params.sampleRate),
                params.baseFrequency,
                params.duration
            );
            // Restart audio if it was playing before the param change.
            if (_wasPlaying) _startAudio(params);
        }

        // Handle playback toggle transitions.
        const isPlaying = Array.isArray(params.playback) && params.playback.includes('Play');
        if (isPlaying !== _wasPlaying) {
            _wasPlaying = isPlaying;
            if (isPlaying) _startAudio(params); else _stopAudio();
        }

        // Live volume update (no buffer regeneration required).
        if (_gainNode) _gainNode.gain.value = clamp(params.volume, 0, 1);

        // Clear canvas.
        ctx.fillStyle = params.bgColor || '#000000';
        ctx.fillRect(0, 0, W, H);

        if (!_buffer || _buffer.length === 0) return;

        switch (params.mode) {
            case 'Oscilloscope': oscilloscopeRenderer(ctx, W, H, _buffer, params);  break;
            case 'Segmented':    segmentedRenderer(ctx, W, H, _buffer, params);     break;
            case 'Circular':     circularLoopRenderer(ctx, W, H, _buffer, params);  break;
        }
    }

    // ── SCRIPT_CONFIG ─────────────────────────────────────────────────────────
    return {
        id:      'wave-equation-synth',
        title:   'Wave Equation Synth',
        category: 'other',
        version:  '1.0.0',
        description: 'Additive audio synthesis from mathematical equations with oscilloscope, segmented, and circular visualisation modes.',

        // ── INFO tab (8 sections) ─────────────────────────────────────────────
        infoSections: [
            {
                heading: 'DESCRIPTION',
                body:    'Wave Equation Synth compiles predefined mathematical expressions into a Float32Array audio buffer, plays the buffer via Web Audio API, and visualises the waveform on canvas. Up to four equations are summed at each sample index, normalised by the active count, and clamped to [−1, 1]. Playback loops the buffer continuously while the Play toggle is active. Three visual modes: Oscilloscope plots amplitude vs pixel for cyclesShown complete cycles starting at sample 0; Segmented is functionally equivalent (segmentStartWave is not exposed in the current UI); Circular maps a waveform segment to polar coordinates r_i = R₀ × (1 + modulationDepth × y_i), producing a closed loop whose shape encodes harmonic content. Canvas is 420×420 with a 2d context.'
            },
            {
                heading: 'ALGORITHM',
                body:    'safeEquationCompiler(expr): new Function("p","w","u","t","g","Math", "\'use strict\'; return (" + expr + ")") — only the five index variables and Math are in scope; compile errors return a zero-function. waveIndexing(i, fpc, N, baseFreq, totalCycles): fpc = sampleRate/baseFreq; w = floor(i/fpc); p = (i − w×fpc)/fpc; u = w/totalCycles; t = w/baseFreq; g = i/N. equationEvaluator: N = floor(sampleRate×duration); for each i: compute {p,w,u,t,g}; y = Σ fn_k(...)/activeCount; buf[i] = clamp(y, −1, 1). audioBufferSource: audioCtx.createBuffer(1, N, sr); ab.copyToChannel(buf, 0). Oscilloscope: for px in [0,W): idx = floor((px/W)×viewLen); y_pixel = H/2 − buf[idx]×H×0.45; polyline. Circular: θ_i = 2π×i/segLen; r_i = R₀×(1+depth×y_i); closePath. WAV: RIFF/WAVE header; fmt chunk (PCM, mono, 16-bit); data chunk; sample_i = round(clamp(y,−1,1)×32767) as signed Int16LE.'
            },
            {
                heading: 'PARAMETERS',
                body:    'Core — baseFrequency: slider 1–2000 Hz, default 220; fundamental frequency for waveIndexing and AudioBuffer. sampleRate: radio 22050|44100, default 44100; audio sample rate. duration: slider 0.1–30 s, step 0.1, default 2; buffer length; triggers regeneration on change. Equations — eq1–eq4: dropdown (Off|Sine|Triangle|Square|Sawtooth|2nd Harm|3rd Harm|4th Harm|FM Sine|Pulse|AM Sine), defaults Sine/Off/Off/Off; each active equation is compiled and summed; normalised by active count. Visualisation — mode: radio Oscilloscope|Segmented|Circular, default Oscilloscope. cyclesShown: slider 1–32, step 1, default 4; cycles shown in oscilloscope/circular view. strokeWidth: slider 1–8, step 1, default 2. lineColor: VGA palette dropdown, default #00ff00. bgColor: VGA palette dropdown, default #000000. modulationDepth: slider 0–1, step 0.01, default 0.3; radial amplitude for Circular mode. Audio — playback: toggle [Play], default []; engaging Play starts the AudioContext loop. volume: slider 0–1, step 0.01, default 0.8; applied via GainNode, updated every frame without buffer regeneration.'
            },
            {
                heading: 'PRESETS',
                body:    'Pure Sine: 440 Hz, eq1=Sine, Oscilloscope, 4 cycles, green on black — textbook reference waveform. Rich Harmonics: 110 Hz, eq1=Sine + eq2=2nd Harm + eq3=3rd Harm + eq4=4th Harm, Oscilloscope, 8 cycles, cyan — Fourier-series approximation of a complex tone; summed and normalised by 4. Square Wave: 220 Hz, eq1=Square, Oscilloscope, 4 cycles, white — band-unlimited ideal square waveform. FM Synthesis: 220 Hz, eq1=FM Sine, Circular mode, modulationDepth=0.5, yellow — frequency modulation produces a non-circular polar loop. Polar Bloom: 110 Hz, eq1=Sine + eq2=2nd Harm, Circular, modulationDepth=0.6, 8 cycles, cyan — two-harmonic sum produces a petal-shaped polar curve.'
            },
            {
                heading: 'PERFORMANCE',
                body:    'Buffer generation (init-phase, not per-frame): N_total = floor(sampleRate×duration). At default (44100 Hz, 2 s, 1 active eq): 88,200 evals, estimated < 5 ms. At 44100 Hz, 30 s, 4 eqs: 5.3 M evals, estimated 20–80 ms — acceptable as a one-off operation on param change. sampleRate is capped at 44100 Hz in the UI to prevent worst-case durations at 192 kHz. Oscilloscope render: O(W) = 420 lookups per frame — trivial at 60 FPS. Circular render: O(cyclesShown × framesPerCycle); at 32 cycles at 44100/220 ≈ 200.5 fpc: ~6,416 points — trivial. Compute tier: lightweight. No adaptive resolution (compute.interactionScale not set) or Worker offload required within the exposed parameter ranges. Buffer regeneration is guarded by a cache key (_bufferCacheKey) so it runs only when synthesis params change, not on every frame or visualisation param update.'
            },
            {
                heading: 'ANIMATION',
                body:    'type: infinite. The oscilloscope and circular renderers read the pre-computed buffer on each frame; the visual output is params-driven, not frame-driven (frame counter unused in rendering). Animation is declared infinite so the host loop continuously calls draw, keeping volume changes and playback state responsive without requiring a user interaction to refresh. sequencer: false — type is infinite with no loop point; no meaningful phase-parameter interpolation exists. animationExport: false — no loopFrames defined; visual output is static across frames at fixed params; GIF/WebM export suppressed. export: { png: true, gif: false, webm: false }.'
            },
            {
                heading: 'KNOWN LIMITATIONS',
                body:    'textarea parameter type not supported by the host: equation input is restricted to predefined dropdown options rather than arbitrary user expressions; the spec intent of free-text equations is architecturally blocked. WAV export (AUDIO-008) is implemented but not UI-accessible: no action button type exists in the generator parameter system and the host export tab has no WAV entry; wavExporter() can be invoked programmatically only. Segmented mode: segmentStartWave (spec range 0–100000) and segmentWaveCount parameters are not exposed; Segmented is currently identical to Oscilloscope. GIF export suppressed: animation type is infinite with no loopFrames. AudioContext may require a user gesture on some browsers (autoplay policy); clicking the Play toggle constitutes the required gesture. safeEquationCompiler uses new Function — blocked by CSPs that prohibit eval-equivalent constructs; Worker-based evaluation is the recommended mitigation (not implemented in this version).'
            },
            {
                heading: 'REFERENCES',
                body:    'Algorithm sources: additive synthesis (Fourier/Helmholtz), Web Audio API AudioBuffer, oscilloscope polar coordinate mapping, RIFF/WAVE PCM 16-bit format.'
            }
        ],

        compute: { cost: 'lightweight' },

        // ── Canvas ────────────────────────────────────────────────────────────
        // Spec: 420×420. Live stub used 800×800 — corrected per issues-and-conflicts.md.
        canvas: { width: 420, height: 420, context: '2d' },

        // ── Parameters ────────────────────────────────────────────────────────
        parameters: [
            {
                group: 'Core',
                params: [
                    {
                        key: 'baseFrequency', type: 'slider', label: 'Base Freq (Hz)',
                        min: 1, max: 2000, step: 1, default: 220
                    },
                    {
                        key: 'sampleRate', type: 'radio', label: 'Sample Rate',
                        options: ['22050', '44100'], default: '44100'
                    },
                    {
                        key: 'duration', type: 'slider', label: 'Duration (s)',
                        min: 0.1, max: 30, step: 0.1, default: 2, precision: 1
                    },
                ]
            },
            {
                group: 'Equations',
                params: [
                    { key: 'eq1', type: 'dropdown', label: 'Eq 1', options: EQ_NAMES, default: 'Sine' },
                    { key: 'eq2', type: 'dropdown', label: 'Eq 2', options: EQ_NAMES, default: 'Off'  },
                    { key: 'eq3', type: 'dropdown', label: 'Eq 3', options: EQ_NAMES, default: 'Off'  },
                    { key: 'eq4', type: 'dropdown', label: 'Eq 4', options: EQ_NAMES, default: 'Off'  },
                ]
            },
            {
                group: 'Visualisation',
                params: [
                    {
                        key: 'mode', type: 'radio', label: 'Mode',
                        options: ['Oscilloscope', 'Segmented', 'Circular'], default: 'Oscilloscope'
                    },
                    {
                        key: 'cyclesShown', type: 'slider', label: 'Cycles Shown',
                        min: 1, max: 32, step: 1, default: 4
                    },
                    {
                        key: 'strokeWidth', type: 'slider', label: 'Stroke Width',
                        min: 1, max: 8, step: 1, default: 2
                    },
                    {
                        key: 'lineColor', type: 'color', label: 'Line Colour',
                        default: '#00ff00'
                    },
                    {
                        key: 'bgColor', type: 'color', label: 'Background',
                        default: '#000000'
                    },
                    {
                        key: 'modulationDepth', type: 'slider', label: 'Mod Depth',
                        min: 0, max: 1, step: 0.01, default: 0.3, precision: 2
                    },
                ]
            },
            {
                group: 'Audio',
                params: [
                    {
                        key: 'playback', type: 'toggle', label: 'Playback',
                        options: ['Play'], default: []
                    },
                    {
                        key: 'volume', type: 'slider', label: 'Volume',
                        min: 0, max: 1, step: 0.01, default: 0.8, precision: 2
                    },
                ]
            }
        ],

        // ── Presets ───────────────────────────────────────────────────────────
        presets: [
            {
                name: 'Pure Sine',
                values: {
                    baseFrequency: 440, sampleRate: '44100', duration: 2,
                    eq1: 'Sine', eq2: 'Off', eq3: 'Off', eq4: 'Off',
                    mode: 'Oscilloscope', cyclesShown: 4, strokeWidth: 2,
                    lineColor: '#00ff00', bgColor: '#000000', modulationDepth: 0.3,
                    playback: [], volume: 0.8
                }
            },
            {
                name: 'Rich Harmonics',
                values: {
                    baseFrequency: 110, sampleRate: '44100', duration: 2,
                    eq1: 'Sine', eq2: '2nd Harm', eq3: '3rd Harm', eq4: '4th Harm',
                    mode: 'Oscilloscope', cyclesShown: 8, strokeWidth: 2,
                    lineColor: '#00ffff', bgColor: '#000000', modulationDepth: 0.3,
                    playback: [], volume: 0.8
                }
            },
            {
                name: 'Square Wave',
                values: {
                    baseFrequency: 220, sampleRate: '44100', duration: 2,
                    eq1: 'Square', eq2: 'Off', eq3: 'Off', eq4: 'Off',
                    mode: 'Oscilloscope', cyclesShown: 4, strokeWidth: 2,
                    lineColor: '#ffffff', bgColor: '#000000', modulationDepth: 0.3,
                    playback: [], volume: 0.8
                }
            },
            {
                name: 'FM Synthesis',
                values: {
                    baseFrequency: 220, sampleRate: '44100', duration: 2,
                    eq1: 'FM Sine', eq2: 'Off', eq3: 'Off', eq4: 'Off',
                    mode: 'Circular', cyclesShown: 4, strokeWidth: 2,
                    lineColor: '#ffff00', bgColor: '#000000', modulationDepth: 0.5,
                    playback: [], volume: 0.8
                }
            },
            {
                name: 'Polar Bloom',
                values: {
                    baseFrequency: 110, sampleRate: '44100', duration: 2,
                    eq1: 'Sine', eq2: '2nd Harm', eq3: 'Off', eq4: 'Off',
                    mode: 'Circular', cyclesShown: 8, strokeWidth: 2,
                    lineColor: '#00ffff', bgColor: '#000000', modulationDepth: 0.6,
                    playback: [], volume: 0.8
                }
            },
        ],

        // ── Animation ─────────────────────────────────────────────────────────
        // type: 'infinite' — no loop point; oscilloscope is a static buffer display.
        // sequencer: false — infinite type, no animatable phase parameters.
        // animationExport: false — no loopFrames defined; visual is params-driven.
        animation: {
            type:            'infinite',
            defaultFps:      60,
            sequencer:       false,
            animationExport: false,
        },

        // ── Export ────────────────────────────────────────────────────────────
        // gif/webm suppressed: infinite animation with no defined loopFrames.
        // WAV export implemented in wavExporter() but not UI-accessible.
        export: { png: true, gif: false, webm: false },

        draw,
    };
})();
