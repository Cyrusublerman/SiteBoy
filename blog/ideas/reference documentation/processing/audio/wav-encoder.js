/**
 * @fileoverview WAV Audio File Encoding
 * 
 * Generate WAV files from sample data.
 * All functions are pure.
 * 
 * @module audio/wav-encoder
 * @source blog/ideas/reference documentation/20_Physics_Simulation/WAV_format.md
 * @wikipedia https://en.wikipedia.org/wiki/WAV
 * 
 * WAV file structure from reference:
 * - RIFF header (12 bytes): 'RIFF' + fileSize + 'WAVE'
 * - fmt chunk (24 bytes): format, channels, sampleRate, byteRate, blockAlign, bitsPerSample
 * - data chunk (8 + data bytes): 'data' + dataSize + samples
 * 
 * @formula Total file size: 36 + (numSamples × numChannels × bytesPerSample)
 * @formula Byte rate: sampleRate × numChannels × bytesPerSample
 * @formula 16-bit sample: Math.round(clampedFloat × 32767)
 */

// ═══════════════════════════════════════════════════════════════════════════
// WAV FILE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Write a string to DataView
 * @param {DataView} view
 * @param {number} offset
 * @param {string} string
 */
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

/**
 * Create WAV file header
 * 
 * @param {number} numSamples - Total samples
 * @param {number} sampleRate - Sample rate (e.g., 44100)
 * @param {number} numChannels - 1=mono, 2=stereo
 * @param {number} bitsPerSample - 8, 16, 24, or 32
 * @returns {ArrayBuffer} 44-byte header
 */
export function createWavHeader(numSamples, sampleRate, numChannels, bitsPerSample) {
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const fileSize = 36 + dataSize;
    
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);           // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);            // AudioFormat (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    return buffer;
}

/**
 * Encode mono audio samples to 16-bit WAV
 * 
 * @param {Float32Array|number[]} samples - Audio samples in [-1, 1]
 * @param {number} [sampleRate=44100] - Sample rate
 * @returns {Uint8Array} Complete WAV file
 */
export function encodeWavMono(samples, sampleRate = 44100) {
    const numSamples = samples.length;
    const header = createWavHeader(numSamples, sampleRate, 1, 16);
    
    const dataSize = numSamples * 2;
    const dataBuffer = new ArrayBuffer(dataSize);
    const dataView = new DataView(dataBuffer);
    
    for (let i = 0; i < numSamples; i++) {
        const clamped = Math.max(-1, Math.min(1, samples[i]));
        const sample16 = Math.round(clamped * 32767);
        dataView.setInt16(i * 2, sample16, true);
    }
    
    // Combine header and data
    const wavFile = new Uint8Array(44 + dataSize);
    wavFile.set(new Uint8Array(header), 0);
    wavFile.set(new Uint8Array(dataBuffer), 44);
    
    return wavFile;
}

/**
 * Encode stereo audio samples to 16-bit WAV
 * 
 * @param {Float32Array|number[]} left - Left channel [-1, 1]
 * @param {Float32Array|number[]} right - Right channel [-1, 1]
 * @param {number} [sampleRate=44100] - Sample rate
 * @returns {Uint8Array} Complete WAV file
 */
export function encodeWavStereo(left, right, sampleRate = 44100) {
    const numSamples = left.length;
    const header = createWavHeader(numSamples, sampleRate, 2, 16);
    
    const dataSize = numSamples * 4;
    const dataBuffer = new ArrayBuffer(dataSize);
    const dataView = new DataView(dataBuffer);
    
    for (let i = 0; i < numSamples; i++) {
        const leftClamped = Math.max(-1, Math.min(1, left[i]));
        const rightClamped = Math.max(-1, Math.min(1, right[i]));
        
        dataView.setInt16(i * 4, Math.round(leftClamped * 32767), true);
        dataView.setInt16(i * 4 + 2, Math.round(rightClamped * 32767), true);
    }
    
    const wavFile = new Uint8Array(44 + dataSize);
    wavFile.set(new Uint8Array(header), 0);
    wavFile.set(new Uint8Array(dataBuffer), 44);
    
    return wavFile;
}

/**
 * Create downloadable WAV blob
 * 
 * @param {Uint8Array} wavData - WAV file data
 * @returns {Blob} Audio blob
 */
export function createWavBlob(wavData) {
    return new Blob([wavData], { type: 'audio/wav' });
}

/**
 * Create object URL for WAV data
 * 
 * @param {Uint8Array} wavData - WAV file data
 * @returns {string} Object URL (must be revoked when done)
 */
export function createWavUrl(wavData) {
    return URL.createObjectURL(createWavBlob(wavData));
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIO GENERATION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate sine wave samples
 * 
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} [sampleRate=44100] - Sample rate
 * @param {number} [amplitude=0.8] - Peak amplitude
 * @returns {Float32Array} Audio samples
 */
export function generateSine(frequency, duration, sampleRate = 44100, amplitude = 0.8) {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        samples[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
    }
    
    return samples;
}

/**
 * Generate square wave samples
 * 
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} [sampleRate=44100] - Sample rate
 * @param {number} [amplitude=0.8] - Peak amplitude
 * @returns {Float32Array} Audio samples
 */
export function generateSquare(frequency, duration, sampleRate = 44100, amplitude = 0.8) {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    const period = sampleRate / frequency;
    
    for (let i = 0; i < numSamples; i++) {
        samples[i] = ((i % period) < period / 2) ? amplitude : -amplitude;
    }
    
    return samples;
}

/**
 * Generate sawtooth wave samples
 * 
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} [sampleRate=44100] - Sample rate
 * @param {number} [amplitude=0.8] - Peak amplitude
 * @returns {Float32Array} Audio samples
 */
export function generateSawtooth(frequency, duration, sampleRate = 44100, amplitude = 0.8) {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    const period = sampleRate / frequency;
    
    for (let i = 0; i < numSamples; i++) {
        const phase = (i % period) / period;
        samples[i] = amplitude * (2 * phase - 1);
    }
    
    return samples;
}

/**
 * Generate triangle wave samples
 * 
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} [sampleRate=44100] - Sample rate
 * @param {number} [amplitude=0.8] - Peak amplitude
 * @returns {Float32Array} Audio samples
 */
export function generateTriangle(frequency, duration, sampleRate = 44100, amplitude = 0.8) {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    const period = sampleRate / frequency;
    
    for (let i = 0; i < numSamples; i++) {
        const phase = (i % period) / period;
        samples[i] = amplitude * (4 * Math.abs(phase - 0.5) - 1);
    }
    
    return samples;
}

/**
 * Generate white noise samples
 * 
 * @param {number} duration - Duration in seconds
 * @param {number} [sampleRate=44100] - Sample rate
 * @param {number} [amplitude=0.8] - Peak amplitude
 * @returns {Float32Array} Audio samples
 */
export function generateNoise(duration, sampleRate = 44100, amplitude = 0.8) {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        samples[i] = amplitude * (Math.random() * 2 - 1);
    }
    
    return samples;
}

/**
 * Apply envelope to audio samples
 * 
 * @param {Float32Array} samples - Input samples
 * @param {Object} envelope - ADSR envelope
 * @param {number} envelope.attack - Attack time (seconds)
 * @param {number} envelope.decay - Decay time (seconds)
 * @param {number} envelope.sustain - Sustain level (0-1)
 * @param {number} envelope.release - Release time (seconds)
 * @param {number} [sampleRate=44100] - Sample rate
 * @returns {Float32Array} Enveloped samples
 */
export function applyEnvelope(samples, envelope, sampleRate = 44100) {
    const { attack, decay, sustain, release } = envelope;
    const result = new Float32Array(samples.length);
    
    const attackSamples = Math.floor(attack * sampleRate);
    const decaySamples = Math.floor(decay * sampleRate);
    const releaseSamples = Math.floor(release * sampleRate);
    const sustainStart = attackSamples + decaySamples;
    const releaseStart = samples.length - releaseSamples;
    
    for (let i = 0; i < samples.length; i++) {
        let env;
        
        if (i < attackSamples) {
            // Attack
            env = i / attackSamples;
        } else if (i < sustainStart) {
            // Decay
            const t = (i - attackSamples) / decaySamples;
            env = 1 - t * (1 - sustain);
        } else if (i < releaseStart) {
            // Sustain
            env = sustain;
        } else {
            // Release
            const t = (i - releaseStart) / releaseSamples;
            env = sustain * (1 - t);
        }
        
        result[i] = samples[i] * env;
    }
    
    return result;
}

/**
 * Mix multiple audio tracks
 * 
 * @param {Array<{samples: Float32Array, gain: number}>} tracks - Tracks to mix
 * @returns {Float32Array} Mixed samples
 */
export function mixTracks(tracks) {
    const maxLength = Math.max(...tracks.map(t => t.samples.length));
    const result = new Float32Array(maxLength);
    
    for (const track of tracks) {
        for (let i = 0; i < track.samples.length; i++) {
            result[i] += track.samples[i] * track.gain;
        }
    }
    
    // Normalize if clipping
    let maxAbs = 0;
    for (let i = 0; i < result.length; i++) {
        maxAbs = Math.max(maxAbs, Math.abs(result[i]));
    }
    
    if (maxAbs > 1) {
        for (let i = 0; i < result.length; i++) {
            result[i] /= maxAbs;
        }
    }
    
    return result;
}

