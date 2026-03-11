# Wave Equation Synth — Performance

**Status: Unimplemented stub.** Expected performance of the intended algorithm.

## Buffer Generation Cost

| Parameter | Size | Equation evals |
|---|---|---|
| sampleRate=44100, duration=1 s, N_eq=1 | 44,100 samples | 44,100 |
| sampleRate=44100, duration=10 s, N_eq=8 | 441,000 samples | 3.5 M |
| sampleRate=192000, duration=300 s, N_eq=16 | 57.6 M samples | 921 M |

Buffer generation is an **init-phase operation** (not per-frame). At maximum parameters (sampleRate=192000, duration=300 s, 16 equations), generation requires ~920 M equation evaluations — this must run in a Worker to avoid blocking the main thread.

At typical parameters (44100 Hz, 10 s, 4 equations): ~1.76 M evals. Estimated: 10–50 ms in a Worker. Acceptable.

## Oscilloscope Render Cost

O(W × cyclesShown) — at 420 px width and 64 cycles shown, 26,880 sample lookups per frame. Trivial.

## Memory

| Buffer | Size at 44100 Hz, 300 s |
|---|---|
| Float32Array samples | 44100 × 300 × 4 bytes ≈ 53 MB |
| AudioBuffer (Web Audio) | Same, managed by AudioContext |

At 192000 Hz and 300 s: ~230 MB. This exceeds available memory on low-end devices. Practical maximum: 192000 Hz × 60 s ≈ 46 MB.

## Web Audio Latency

`AudioBufferSourceNode.start()` has near-zero scheduling latency. Playback is real-time; no per-frame computation during audio output.

## Worker Feasibility

**Essential for buffer generation** at non-trivial parameters. The `equationEvaluator` has no DOM dependencies. Worker message: `{ equations: [string], sampleRate, duration, baseFrequency }` → returns `Float32Array`.

The sandboxed compilation (`new Function(...)`) must be re-run inside the Worker — function objects cannot be transferred cross-thread.
