/**
 * AudioOutput - Web Audio API oscillator component
 * 
 * Used for generating audio tones (e.g., Cymatics tool).
 * 
 * @extends BaseComponent
 */

import { BaseComponent } from '../../foundation.js';

export class AudioOutput extends BaseComponent {
    constructor(options = {}, deps = {}) {
        super({ ...options, componentType: 'audio-output' }, deps);
        
        this.frequencies = options.frequencies ?? [440]; // Array of Hz values
        this.waveform = options.waveform ?? 'sine'; // 'sine' | 'square' | 'sawtooth' | 'triangle'
        this.gain = options.gain ?? 0.3; // 0-1
        
        this.audioContext = null;
        this.oscillators = [];
        this.gainNode = null;
        this.isPlaying = false;
    }
    
    render() {
        if (this.element) return this.element;
        
        // AudioOutput doesn't render visible UI
        // But we create a hidden container for component tracking
        this.element = this.createElement('div', 'audio-output component');
        this.element.style.display = 'none';
        
        return this.element;
    }
    
    _initAudioContext() {
        if (!this.audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.gain;
            this.gainNode.connect(this.audioContext.destination);
        }
        
        // Resume if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Public API
    play() {
        if (this.isPlaying) return;
        
        this._initAudioContext();
        
        this.oscillators = this.frequencies.map(freq => {
            const osc = this.audioContext.createOscillator();
            osc.type = this.waveform;
            osc.frequency.value = freq;
            osc.connect(this.gainNode);
            osc.start();
            return osc;
        });
        
        this.isPlaying = true;
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        this.oscillators.forEach(osc => {
            osc.stop();
            osc.disconnect();
        });
        this.oscillators = [];
        
        this.isPlaying = false;
    }
    
    setFrequencies(frequencies) {
        this.frequencies = frequencies;
        
        if (this.isPlaying) {
            // Update existing oscillators or recreate
            if (frequencies.length === this.oscillators.length) {
                frequencies.forEach((freq, i) => {
                    this.oscillators[i].frequency.value = freq;
                });
            } else {
                this.stop();
                this.play();
            }
        }
    }
    
    addFrequency(freq) {
        if (!this.frequencies.includes(freq)) {
            this.frequencies.push(freq);
            
            if (this.isPlaying) {
                this._initAudioContext();
                const osc = this.audioContext.createOscillator();
                osc.type = this.waveform;
                osc.frequency.value = freq;
                osc.connect(this.gainNode);
                osc.start();
                this.oscillators.push(osc);
            }
        }
    }
    
    removeFrequency(freq) {
        const index = this.frequencies.indexOf(freq);
        if (index >= 0) {
            this.frequencies.splice(index, 1);
            
            if (this.isPlaying && this.oscillators[index]) {
                this.oscillators[index].stop();
                this.oscillators[index].disconnect();
                this.oscillators.splice(index, 1);
            }
        }
    }
    
    setGain(gain) {
        this.gain = Math.max(0, Math.min(1, gain));
        if (this.gainNode) {
            this.gainNode.gain.value = this.gain;
        }
    }
    
    setWaveform(waveform) {
        this.waveform = waveform;
        if (this.isPlaying) {
            this.oscillators.forEach(osc => {
                osc.type = waveform;
            });
        }
    }
    
    getFrequencies() {
        return [...this.frequencies];
    }

    isActive() {
        return this.isPlaying;
    }

    // ── Per-event trigger API (X-013) ─────────────────────────────────────────

    /**
     * Trigger a single short tone — e.g. on particle collision.
     * Non-overlapping: creates a throwaway OscillatorNode per event.
     *
     * @param {number} [freq=440]     - Frequency in Hz
     * @param {number} [duration=0.1] - Duration in seconds
     * @param {number} [volume=0.3]   - Peak gain 0–1
     * @param {'sine'|'square'|'sawtooth'|'triangle'} [waveform]
     */
    trigger(freq = 440, duration = 0.1, volume = 0.3, waveform) {
        this._initAudioContext();
        const ctx = this.audioContext;
        const t   = ctx.currentTime;

        const osc  = ctx.createOscillator();
        const env  = ctx.createGain();

        osc.type           = waveform ?? this.waveform;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(volume, t + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(env);
        env.connect(this.gainNode ?? ctx.destination);

        osc.start(t);
        osc.stop(t + duration + 0.01);
    }

    /**
     * Trigger a musical note by name.
     * @param {string} note    - Note name: 'C','D','E','F','G','A','B' with optional '#'
     * @param {number} octave  - MIDI octave 0–8 (middle C = C4)
     * @param {number} [duration=0.1]
     * @param {number} [volume=0.3]
     */
    triggerNote(note, octave = 4, duration = 0.1, volume = 0.3) {
        const semitones = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
        const semi = semitones[note.toUpperCase()];
        if (semi === undefined) { console.warn(`AudioOutput.triggerNote: unknown note "${note}"`); return; }
        const midi = (octave + 1) * 12 + semi;
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        this.trigger(freq, duration, volume);
    }

    // ── Media stream accessor (for AnimationExport audio mux) ────────────────

    /**
     * Returns a MediaStream containing the live audio output.
     * Call this before starting video export to obtain the audio track.
     * @returns {MediaStream|null}
     */
    getMediaStream() {
        this._initAudioContext();
        if (!this._mediaStreamDest) {
            this._mediaStreamDest = this.audioContext.createMediaStreamDestination();
            if (this.gainNode) {
                this.gainNode.connect(this._mediaStreamDest);
            }
        }
        return this._mediaStreamDest.stream;
    }

    destroy() {
        this.stop();
        if (this._mediaStreamDest) {
            this._mediaStreamDest = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        super.destroy();
    }
}

