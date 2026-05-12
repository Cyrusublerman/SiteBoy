### Oscillator bank

Each wave source is coupled to an `OscillatorNode` in a Web Audio `AudioContext`. The oscillator frequency matches the source's wave frequency parameter so that the audible pitch and the visual spatial frequency correspond. One `GainNode` per oscillator controls amplitude; all gain nodes feed into a master `GainNode` that provides global volume control.

```javascript
function createOscillators(sources, audioCtx, masterGain) {
    return sources.map(source => {
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type      = 'sine';
        osc.frequency.setValueAtTime(source.freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(source.amp / sources.length, audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        return { osc, gain };
    });
}
```

The gain per oscillator is normalised by `sources.length` to prevent clipping as sources accumulate. Amplitude envelope management (attack/release) is not implemented in the current version; sources are switched on and off abruptly, which is audible as a click. A ramped `gain.gain.linearRampToValueAtTime` would eliminate this artefact.

### Browser autoplay restriction

Browsers require a user gesture before an `AudioContext` can produce sound. The standard workaround is to create the `AudioContext` in response to the first user click on the canvas, or to call `audioCtx.resume()` on a user event if the context was created in the suspended state. The Cymatics implementation defers `AudioContext` creation to the *Play* button press, which is an explicit user gesture, guaranteeing that the context starts in the `running` state.

```javascript
function startAudio(sources) {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    oscillators = createOscillators(sources, audioCtx, masterGain);
}
```

### Stopping and cleanup

```javascript
function stopAudio() {
    oscillators.forEach(({ osc }) => {
        osc.stop();
        osc.disconnect();
    });
    oscillators = [];
}
```

`stop()` schedules the oscillator to stop at the default time (immediately). `disconnect()` removes it from the audio graph so its memory can be freed. The `AudioContext` itself is not closed between stop/start cycles — creating a new context for each playback session has a higher overhead than reusing one.

### Frequency visualisation linkage

The visual frequency parameter (the `freq` field of a `WaveSource`) is a spatial scale factor measured in pixels per cycle, not a physical frequency in Hz. The mapping from semitone index \(n\) to the visual frequency parameter is chosen so that the visual wavelength is perceptually meaningful at the canvas size — typically the canvas width divided by a number proportional to the note number within the octave. This is a design parameter, not a physical law.
