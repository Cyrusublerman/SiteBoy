### Physical model

Translucent filament layers behave as wavelength-dependent optical absorbers. Light enters the top layer, is partially absorbed, passes to the next layer, is further absorbed, and so on until it reaches the white substrate (the print bed or a white base layer), reflects back up through all layers, and exits to the observer. This is a Beer-Lambert transmission process.

For a single layer of filament with transmittance \(\tau_\lambda\) at wavelength \(\lambda\), the intensity of light exiting the layer is:

$$I = I_0 \cdot \tau_\lambda$$

For \(L\) layers with per-layer channel transmittances \((\tau_R, \tau_G, \tau_B)\), and assuming each layer acts independently (no inter-layer scattering), the total transmittance is the product:

$$\tau_{\text{total}} = \prod_{j=0}^{L-1} \tau_{R,j}, \quad \text{and similarly for G and B}$$

### Implementation approximation

The tool represents each filament as an sRGB colour tuple \((r, g, b) \in [0, 255]^3\). The normalised value \(r / 255\) is used directly as the per-channel transmittance for that filament layer. Starting from a white substrate \((R_0, G_0, B_0) = (255, 255, 255)\):

$$R_k = R_{k-1} \cdot (r_k / 255), \quad G_k = G_{k-1} \cdot (g_k / 255), \quad B_k = B_{k-1} \cdot (b_k / 255)$$

After all \(L\) layers:

$$\text{output} = (\lfloor R_L \rfloor, \lfloor G_L \rfloor, \lfloor B_L \rfloor)$$

```javascript
function simColour(sequence, colours) {
    let [r, g, b] = [255, 255, 255];
    for (const filamentIndex of sequence) {
        if (filamentIndex === 0) continue;
        const [fr, fg, fb] = hexToRGB(colours[filamentIndex - 1].h);
        r *= fr / 255;
        g *= fg / 255;
        b *= fb / 255;
    }
    return { r: Math.floor(r), g: Math.floor(g), b: Math.floor(b) };
}
```

### Accuracy and limitations

This is a first-order approximation. Physical filament transmittance is not a linear function of the sRGB encoding, and the sRGB gamut does not capture the full wavelength-resolved absorption spectrum. In practice:

- Light-coloured, high-transmittance filaments (white, yellow) mix approximately as predicted.
- Dark, heavily pigmented filaments (black, deep blue) saturate early — a single black layer dominates regardless of subsequent layers.
- The model does not account for scattering, which makes the simulation optimistic for highly diffuse filaments (e.g. marble-effect PLA).

The SCAN phase corrects for all these deviations by replacing the simulated colours with measured actual colours, making the QUANTIZE step physically accurate despite the simulation's limitations.
