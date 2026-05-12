### sRGB and linearisation

The standard colour encoding for images on screen is sRGB (IEC 61966-2-1). The sRGB values stored in `ImageData` are non-linear (gamma-encoded). Any arithmetic that must be physically meaningful (blending, convolution, colour matching) must first linearise the values by inverting the transfer function:

$$C_{\text{linear}} = \begin{cases} C / 12.92 & C \le 0.04045 \\ ((C + 0.055) / 1.055)^{2.4} & \text{otherwise} \end{cases}$$

where \(C = \text{byte} / 255\). Colour operations that ignore linearisation (e.g. a naïve average of two sRGB colours) produce systematic errors in bright regions where the gamma curve is most nonlinear.

### CIE XYZ and CIELAB

Linear RGB is converted to CIE XYZ via the sRGB primary matrix (ITU-R BT.709):

$$\begin{bmatrix} X \\ Y \\ Z \end{bmatrix} = M_{\text{sRGB}} \begin{bmatrix} R_l \\ G_l \\ B_l \end{bmatrix}$$

XYZ is further transformed to CIELAB (CIE 1976 L\*a\*b\*) by the cube-root compressive function:

$$L^* = 116 f(Y/Y_n) - 16, \quad a^* = 500[f(X/X_n) - f(Y/Y_n)], \quad b^* = 200[f(Y/Y_n) - f(Z/Z_n)]$$

CIELAB is designed to be approximately perceptually uniform: equal step sizes in \((L^*, a^*, b^*)\) correspond to approximately equal perceived colour differences. See [Colour Quantizer](/projects/colour-quantizer) for the complete derivation.

### Delta E 76

The perceptual distance between two colours in CIELAB is:

$$\Delta E_{76} = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$$

This is used for nearest-palette matching in the Colour Quantizer. Thresholds: \(\Delta E_{76} < 1\) is imperceptible; \(> 10\) is strongly visible; \(> 50\) is maximally different.

### RGB nearest-colour (fallback)

When CIELAB is not required (e.g. the MFP Quantize tab's nearest-colour fallback), Euclidean distance in RGB space is used:

$$d_{\text{RGB}} = \sqrt{(\Delta R)^2 + (\Delta G)^2 + (\Delta B)^2}$$

This is faster (no colour space conversion) but less perceptually accurate. For palettes with well-separated, saturated colours the difference is small; for palettes with subtle neutral variations it can produce visible mismatches.
