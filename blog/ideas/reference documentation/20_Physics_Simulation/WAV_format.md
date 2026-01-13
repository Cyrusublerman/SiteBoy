# WAV Audio Format

## 1. Overview
WAV (Waveform Audio File Format) is an uncompressed audio format developed by Microsoft and IBM. It stores raw audio samples with metadata, making it ideal for audio editing and synthesis applications. Understanding WAV structure enables direct generation of audio files from synthesized waveforms.

## 2. File Structure
A WAV file consists of RIFF chunks:

```
RIFF chunk (file container)
├── "RIFF" (4 bytes)
├── File size - 8 (4 bytes)
├── "WAVE" (4 bytes)
├── fmt chunk (format info)
│   ├── "fmt " (4 bytes)
│   ├── Chunk size (4 bytes)
│   └── Format data
└── data chunk (audio samples)
    ├── "data" (4 bytes)
    ├── Data size (4 bytes)
    └── Sample data
```

## 3. Format Chunk (fmt)

### 3.1 PCM Format
| Field | Bytes | Description |
|-------|-------|-------------|
| Audio format | 2 | 1 = PCM (uncompressed) |
| Num channels | 2 | 1 = mono, 2 = stereo |
| Sample rate | 4 | Samples per second (e.g., 44100) |
| Byte rate | 4 | = SampleRate × NumChannels × BitsPerSample/8 |
| Block align | 2 | = NumChannels × BitsPerSample/8 |
| Bits per sample | 2 | 8, 16, 24, or 32 |

### 3.2 Common Configurations

| Config | Rate | Bits | Channels | Byte Rate |
|--------|------|------|----------|-----------|
| CD quality | 44100 | 16 | 2 | 176,400 |
| DVD quality | 48000 | 24 | 2 | 288,000 |
| Voice | 22050 | 16 | 1 | 44,100 |
| High-res | 96000 | 24 | 2 | 576,000 |

## 4. Sample Encoding

### 4.1 8-bit (Unsigned)
- Range: 0 to 255
- Silence: 128
```javascript
const sample8 = Math.round((value + 1) * 127.5);  // value in [-1, 1]
```

### 4.2 16-bit (Signed, Little-Endian)
- Range: -32768 to 32767
- Most common format
```javascript
const sample16 = Math.round(value * 32767);  // value in [-1, 1]
// Write as little-endian
buffer[i] = sample16 & 0xFF;
buffer[i+1] = (sample16 >> 8) & 0xFF;
```

### 4.3 24-bit (Signed, Little-Endian)
- Range: -8388608 to 8388607
```javascript
const sample24 = Math.round(value * 8388607);
buffer[i] = sample24 & 0xFF;
buffer[i+1] = (sample24 >> 8) & 0xFF;
buffer[i+2] = (sample24 >> 16) & 0xFF;
```

### 4.4 32-bit Float
- IEEE 754 float
- Range: -1.0 to 1.0
- Audio format code = 3 (IEEE float)

## 5. JavaScript Implementation

### 5.1 WAV Header Generator
```javascript
function createWavHeader(numSamples, sampleRate, numChannels, bitsPerSample) {
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const fileSize = 36 + dataSize;
    
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(view, 8, 'WAVE');
    
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);           // Chunk size
    view.setUint16(20, 1, true);            // Audio format (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // data chunk header
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    return buffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
```

### 5.2 Complete WAV File Creation
```javascript
function createWavFile(samples, sampleRate = 44100) {
    const numSamples = samples.length;
    const bitsPerSample = 16;
    const numChannels = 1;
    
    // Create header
    const header = createWavHeader(numSamples, sampleRate, numChannels, bitsPerSample);
    
    // Create sample buffer
    const dataSize = numSamples * 2;  // 16-bit = 2 bytes
    const dataBuffer = new ArrayBuffer(dataSize);
    const dataView = new DataView(dataBuffer);
    
    for (let i = 0; i < numSamples; i++) {
        // Clamp to [-1, 1] and convert to 16-bit
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
```

### 5.3 Stereo WAV
```javascript
function createStereoWav(leftSamples, rightSamples, sampleRate = 44100) {
    const numSamples = leftSamples.length;
    const header = createWavHeader(numSamples, sampleRate, 2, 16);
    
    const dataSize = numSamples * 4;  // 2 channels × 2 bytes
    const dataBuffer = new ArrayBuffer(dataSize);
    const dataView = new DataView(dataBuffer);
    
    for (let i = 0; i < numSamples; i++) {
        const left16 = Math.round(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
        const right16 = Math.round(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
        dataView.setInt16(i * 4, left16, true);
        dataView.setInt16(i * 4 + 2, right16, true);
    }
    
    const wavFile = new Uint8Array(44 + dataSize);
    wavFile.set(new Uint8Array(header), 0);
    wavFile.set(new Uint8Array(dataBuffer), 44);
    
    return wavFile;
}
```

### 5.4 Download Helper
```javascript
function downloadWav(samples, filename = 'output.wav', sampleRate = 44100) {
    const wavData = createWavFile(samples, sampleRate);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}
```

## 6. Generating Audio Samples

### 6.1 Sine Wave
```javascript
function generateSine(frequency, duration, sampleRate = 44100) {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        samples[i] = Math.sin(2 * Math.PI * frequency * t);
    }
    
    return samples;
}
```

### 6.2 From Equation
```javascript
function generateFromEquation(equation, duration, sampleRate = 44100) {
    // equation is function(t) returning value in [-1, 1]
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        samples[i] = equation(t);
    }
    
    return samples;
}
```

## 7. Applications
- Audio synthesis output
- Waveform visualization tools
- Sound effect generation
- Music production prototyping
- Scientific data sonification

## 8. References
- Microsoft. "Multimedia Programming Interface and Data Specifications 1.0." 1991.
- "WAV." Wikipedia. https://en.wikipedia.org/wiki/WAV

