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
    
    destroy() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        super.destroy();
    }
}

