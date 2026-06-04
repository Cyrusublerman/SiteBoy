# D4 — Sequencer transport wiring

**Status**: REVIEW
**Priority**: P1
**Owner file(s)**: `assets/js/tools/generators/core/generative-tool-host.js`, `assets/js/shared/interactive.js`
**Blockers**: none
**Blocks**: none
**Last touched**: 2026-06-04

## Goal

The host transport (play / pause / stop, spacebar) drives `SequencerV2` checkpoint interpolation.

## Done when

On a generator with `animation.sequencer === true` and ≥2 saved checkpoints, pressing play advances `SequencerV2._currentTime`, applies `_paramsAtTime()` to `this.params`, and redraws each frame; pause halts at the current time; stop resets time to 0.

## Sub-tasks

- [x] Expose public `startPlayback()` / `pausePlayback()` / `resetPlayback()` / `isPlaying()` on `SequencerV2`.
- [x] `host.play()` starts the sequencer when ≥2 checkpoints exist.
- [x] `host.pause()` pauses the sequencer (preserves `_currentTime`).
- [x] `host.stop()` resets the sequencer to time 0.
- [x] Default segment easing changed `easeInOutCubic` → `linear` (no ease).
- [x] Strip block gains an `EASE` cell next to the frame-count input; click cycles `EASING_KEYS`.

## Notes / decisions

- Root cause: the only trigger for `_startPlayback()` was the panel `▶ PLAY` button, but the host mounts only the strip (`getStripElement()`), never the panel (`render()`). The strip has no play control ("Playback is toolbar / sidebar only"). The main animator already yields via `if (this.sequencerV2?._isPlaying) return;` but nothing ever set `_isPlaying`, so the guard was dead code.
- Static params between checkpoints are intended: the sequencer lerps between fixed states. Frame-driven concurrent motion is a non-goal for this item.

## References

- `assets/js/shared/interactive.js` (`SequencerV2`)
- `assets/js/tools/generators/core/generative-tool-host.js` (`play`/`pause`/`stop`)
