# Wave Equation Synth — Theoretical Foundation

## 1. Wave Indexing

$$
S_{wave} = \frac{\text{sampleRate}}{\text{baseFrequency}}
$$

$$
w = \lfloor i / S_{wave} \rfloor
$$

$$
p = \frac{i \mod S_{wave}}{S_{wave}}
$$

$$
u = \frac{w}{N_{waves} - 1}
$$

$$
t = \frac{i}{\text{sampleRate}}
$$

$$
g = \frac{i}{N_{total} - 1}
$$

## 2. Equation Evaluation

$$
y = f(p, w, u, t, g)
$$

Variables:
- \( p \): phase within current wave [0,1]
- \( w \): wave index
- \( u \): normalized wave position [0,1]
- \( t \): time in seconds
- \( g \): global normalized position [0,1]

## 3. Circular Mapping

$$
\theta = 2\pi \cdot \frac{n}{S_{seg} - 1}
$$

$$
r = R_0 (1 + d \cdot y[n])
$$

$$
x = c_x + r \cos\theta, \quad y = c_y + r \sin\theta
$$

## 4. WAV Encoding

**Reference:** `blog/ideas/reference documentation/Audio/WAV.md`

PCM format:
- Header: RIFF chunk, fmt chunk
- Data: 16-bit signed integers

