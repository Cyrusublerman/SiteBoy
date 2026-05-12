### sRGB and the transfer function

Images on screen are encoded in sRGB, a non-linear colour space standardised by IEC 61966-2-1. The non-linearity — colloquially called *gamma* — compresses highlights and expands shadows so that an 8-bit value encodes perceptually uniform steps rather than linear-light steps. Before performing any arithmetic on colour values the transfer function must be inverted to recover linear light:

$$C_{\text{linear}} = \begin{cases} \dfrac{C_{\text{sRGB}}}{12.92} & \text{if } C_{\text{sRGB}} \le 0.04045 \\[8pt] \left(\dfrac{C_{\text{sRGB}} + 0.055}{1.055}\right)^{2.4} & \text{otherwise} \end{cases}$$

where \(C_{\text{sRGB}} \in [0, 1]\) is the normalised channel value. The threshold 0.04045 defines the linear portion of the piece-wise function; below it the curve is well approximated by a simple ratio. This linearisation is applied to the red, green, and blue channels independently.

### Linear RGB to CIE XYZ (D65)

Linear RGB values relate to CIE XYZ tristimulus values through a fixed \(3 \times 3\) matrix that encodes the sRGB primaries relative to a D65 (daylight 6500 K) white point (ITU-R BT.709):

$$\begin{bmatrix} X \\ Y \\ Z \end{bmatrix} = \begin{bmatrix} 0.4124564 & 0.3575761 & 0.1804375 \\ 0.2126729 & 0.7151522 & 0.0721750 \\ 0.0193339 & 0.1191920 & 0.9503041 \end{bmatrix} \begin{bmatrix} R_{\text{linear}} \\ G_{\text{linear}} \\ B_{\text{linear}} \end{bmatrix}$$

The \(Y\) component equals luminance by construction (it is the CIE photopic luminous efficiency function applied to the primaries). X and Z encode chromatic information but are not perceptually uniform.

### CIE XYZ to CIELAB

CIELAB (CIE 1976 L\*a\*b\*) is designed to be approximately perceptually uniform. The transformation normalises XYZ against the D65 white reference \((X_n, Y_n, Z_n) = (0.95047,\ 1.00000,\ 1.08883)\) and applies a cube-root compressive function:

$$f(t) = \begin{cases} t^{1/3} & \text{if } t > \delta^3 \\[4pt] \dfrac{t}{3\delta^2} + \dfrac{4}{29} & \text{otherwise} \end{cases} \quad \text{where } \delta = \tfrac{6}{29}$$

The three CIELAB coordinates are then:

$$L^* = 116\,f\!\left(\frac{Y}{Y_n}\right) - 16$$

$$a^* = 500\!\left[f\!\left(\frac{X}{X_n}\right) - f\!\left(\frac{Y}{Y_n}\right)\right]$$

$$b^* = 200\!\left[f\!\left(\frac{Y}{Y_n}\right) - f\!\left(\frac{Z}{Z_n}\right)\right]$$

\(L^*\) is lightness on \([0, 100]\). \(a^*\) encodes the green–red axis and \(b^*\) the blue–yellow axis, each roughly on \([-128, 127]\) for typical sRGB colours. Equal numerical steps in \((L^*, a^*, b^*)\) correspond to equal perceived colour differences, which is why Euclidean distance in this space is a sound metric for nearest-colour matching.

### Memoisation

The round-trip sRGB → linear → XYZ → LAB is non-trivial to compute per-pixel for large images. The `ColorSpaceConverter` in the implementation uses a `Map` keyed on the hex string of each palette colour to cache LAB values for all palette entries at load time, and a second `Map` keyed on the 24-bit packed pixel value to short-circuit repeated conversions of the same pixel colour. See *Implementation* for details.
