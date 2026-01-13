# Low-Frequency Oscillation (LFO)

## 1. Overview
A low-frequency oscillator (LFO) is an electronic oscillator that generates waveforms typically below the human hearing range (under 20 Hz). In computer graphics and animation, LFOs provide periodic modulation for parameters like position, scale, color, or opacity—creating rhythmic, organic motion without explicit keyframing.

## 2. Basic Waveforms

### 2.1 Sine Wave
$$y(t) = A \sin(2\pi f t + \phi)$$

Where:
- \(A\) = amplitude
- \(f\) = frequency (Hz)
- \(t\) = time (seconds)
- \(\phi\) = phase offset (radians)

**Characteristics**: Smooth, continuous, no harmonics.

### 2.2 Triangle Wave
$$y(t) = \frac{4A}{T} \left| \left((t - \phi) \mod T\right) - \frac{T}{2} \right| - A$$

Or using sawtooth:
$$y(t) = 2A \left| 2\left(\frac{t}{T} - \lfloor\frac{t}{T} + 0.5\rfloor\right) \right| - A$$

**Characteristics**: Linear ramps, softer than square.

### 2.3 Sawtooth Wave
$$y(t) = 2A \left(\frac{t}{T} - \lfloor\frac{t}{T} + 0.5\rfloor\right)$$

**Characteristics**: Linear rise, instant fall (or reverse).

### 2.4 Square Wave
$$y(t) = A \cdot \text{sign}\left(\sin(2\pi f t + \phi)\right)$$

**Characteristics**: Binary output, sharp transitions.

### 2.5 Pulse Wave (Variable Duty Cycle)
$$y(t) = \begin{cases}
A & (t \mod T) < D \cdot T \\
-A & \text{otherwise}
\end{cases}$$

Where \(D\) = duty cycle (0 to 1).

## 3. Implementation

### 3.1 JavaScript LFO Class
```javascript
class LFO {
    constructor(options = {}) {
        this.frequency = options.frequency || 1.0;  // Hz
        this.amplitude = options.amplitude || 1.0;
        this.phase = options.phase || 0;
        this.waveform = options.waveform || 'sine';
        this.offset = options.offset || 0;
    }
    
    getValue(time) {
        const t = time * this.frequency + this.phase;
        let value;
        
        switch (this.waveform) {
            case 'sine':
                value = Math.sin(2 * Math.PI * t);
                break;
            case 'triangle':
                value = 4 * Math.abs((t % 1) - 0.5) - 1;
                break;
            case 'sawtooth':
                value = 2 * ((t % 1) - 0.5);
                break;
            case 'square':
                value = (t % 1) < 0.5 ? 1 : -1;
                break;
            case 'noise':
                value = Math.random() * 2 - 1;  // Sample & hold in practice
                break;
            default:
                value = Math.sin(2 * Math.PI * t);
        }
        
        return value * this.amplitude + this.offset;
    }
}
```

### 3.2 Smoothed Waveforms
Anti-aliased transitions using smoothstep:
```javascript
function smoothSquare(t, smoothness = 0.05) {
    const phase = t % 1;
    const rising = smoothstep(0, smoothness, phase);
    const falling = smoothstep(0.5, 0.5 + smoothness, phase);
    return rising - falling;
}
```

### 3.3 Sample-and-Hold (S&H)
Random value that changes at regular intervals:
```javascript
class SampleAndHold {
    constructor(frequency) {
        this.frequency = frequency;
        this.currentValue = Math.random() * 2 - 1;
        this.lastTrigger = 0;
    }
    
    getValue(time) {
        const period = 1 / this.frequency;
        if (time - this.lastTrigger >= period) {
            this.currentValue = Math.random() * 2 - 1;
            this.lastTrigger = time;
        }
        return this.currentValue;
    }
}
```

## 4. Modulation Techniques

### 4.1 Frequency Modulation (FM)
One LFO modulates another's frequency:
```javascript
const modulatorValue = modulatorLFO.getValue(time);
const carrierFreq = baseFreq + modulatorValue * modDepth;
const output = Math.sin(2 * Math.PI * carrierFreq * time);
```

### 4.2 Amplitude Modulation (AM)
One LFO modulates another's amplitude:
```javascript
const envelope = envelopeLFO.getValue(time);
const carrier = carrierLFO.getValue(time);
const output = carrier * envelope;
```

### 4.3 Ring Modulation
Multiply two signals:
$$y(t) = A(t) \cdot B(t)$$

### 4.4 Phase Modulation
Modulate the phase offset:
```javascript
const phaseOffset = modulatorLFO.getValue(time) * modDepth;
const output = Math.sin(2 * Math.PI * freq * time + phaseOffset);
```

## 5. Combining Multiple LFOs
Additive synthesis of LFOs:
```javascript
function combinedLFO(time, lfos) {
    return lfos.reduce((sum, lfo) => sum + lfo.getValue(time), 0);
}
```

Complex motion from simple components:
```javascript
const x = lfoX.getValue(time);  // Horizontal oscillation
const y = lfoY.getValue(time);  // Vertical oscillation (different freq)
// Creates Lissajous figures when frequencies are related
```

## 6. Perfect Loop Animation
For seamless loops of duration \(T\):
```javascript
function perfectLoopLFO(time, loopDuration, frequency) {
    // Ensure frequency creates integer cycles in loop
    const cycles = Math.round(frequency * loopDuration);
    const actualFreq = cycles / loopDuration;
    return Math.sin(2 * Math.PI * actualFreq * time);
}
```

## 7. Common Animation Parameters

| Parameter | Typical LFO Range | Typical Frequency |
|-----------|-------------------|-------------------|
| Position offset | ±10-100 px | 0.1-2 Hz |
| Scale | 0.8-1.2 | 0.5-1 Hz |
| Rotation | ±5-15° | 0.2-0.5 Hz |
| Opacity | 0.5-1.0 | 0.3-1 Hz |
| Color hue shift | ±10-30° | 0.1-0.3 Hz |
| Wave amplitude | 0.5-1.5 | 0.2-1 Hz |

## 8. Applications
- Procedural animation (breathing, bobbing)
- Audio synthesis modulation
- Generative art parameter variation
- UI micro-interactions
- Particle system properties
- Camera shake/movement

## 9. References
- Roads, Curtis. "The Computer Music Tutorial." MIT Press, 1996.
- "Low-frequency oscillation." Wikipedia. https://en.wikipedia.org/wiki/Low-frequency_oscillation

