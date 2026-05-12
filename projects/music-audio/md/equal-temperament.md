### The twelve-tone equal-tempered scale

Western music divides the octave (a 2:1 frequency ratio) into twelve equal steps. Equal temperament defines each semitone step as a frequency ratio of:

$$r = 2^{1/12} \approx 1.05946$$

Given a base frequency \(f_0\) (e.g. middle C at 261.63 Hz), the frequency of a note \(n\) semitones above it is:

$$f_n = f_0 \cdot 2^{n/12}$$

This is the fundamental formula used throughout the music tools. It is exact for equal temperament; just intonation would use rational-number ratios (3/2 for the perfect fifth, 5/4 for the major third) and is not used here.

### Note-to-frequency table

The Cymatics tool exposes a base note selector covering one octave from C4 to C5:

| Note | Frequency (Hz) |
|---|---|
| C4 | 261.63 |
| C♯4 / D♭4 | 277.18 |
| D4 | 293.66 |
| D♯4 / E♭4 | 311.13 |
| E4 | 329.63 |
| F4 | 349.23 |
| F♯4 / G♭4 | 369.99 |
| G4 | 392.00 |
| G♯4 / A♭4 | 415.30 |
| A4 | 440.00 (concert pitch) |
| A♯4 / B♭4 | 466.16 |
| B4 | 493.88 |
| C5 | 523.25 |

All values are \(f_n = 261.63 \cdot 2^{n/12}\) rounded to 2 decimal places.

### Chord intervals

A chord is represented as a set of semitone offsets from the root. Each offset is added to the base note's semitone index and the resulting frequency is computed:

| Chord | Semitone offsets | Intervals |
|---|---|---|
| Major | \{0, 4, 7\} | root, major 3rd, perfect 5th |
| Minor | \{0, 3, 7\} | root, minor 3rd, perfect 5th |
| Diminished | \{0, 3, 6\} | root, minor 3rd, tritone |
| Augmented | \{0, 4, 8\} | root, major 3rd, augmented 5th |
| Major 7th | \{0, 4, 7, 11\} | major + major 7th |
| Minor 7th | \{0, 3, 7, 10\} | minor + minor 7th |
| Dominant 7th | \{0, 4, 7, 10\} | major + minor 7th |
| Suspended 4th | \{0, 5, 7\} | root, perfect 4th, perfect 5th |

```javascript
const CHORDS = {
    maj:  [0, 4, 7],
    min:  [0, 3, 7],
    dim:  [0, 3, 6],
    aug:  [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    dom7: [0, 4, 7, 10],
    sus4: [0, 5, 7]
};

function chordFrequencies(baseHz, chordName) {
    return CHORDS[chordName].map(n => baseHz * 2 ** (n / 12));
}
```

When a chord is applied as a template, one wave source is created per frequency, placed at the template-specified canvas coordinates, and one Web Audio oscillator is assigned per source.
