Multifilament Print Calibration is a four-stage workflow tool for producing colour-accurate artwork from multi-material FDM (Fused Deposition Modelling) 3D printers. The physical process — stacking translucent filament layers — behaves as a subtractive colour mixing system: each layer absorbs certain wavelengths, and the final perceived colour is the product of all the individual layer transmittances. Because this mixing is nonlinear and depends on the specific filament pigments, any colour prediction made from the manufacturer's stated filament colours will differ from the actual printed result.

The tool addresses this with a four-phase calibration loop:

1. **SOURCE** — generate a calibration grid containing every possible combination of the selected filaments across \(L\) layers. Each tile in the grid carries a specific layer sequence \([f_0, f_1, \ldots, f_{L-1}]\) where \(f_i\) is the filament index for layer \(i\). The total tile count is \(c^v\) where \(c\) is the number of colours and \(v\) is the number of variable layers.
2. **SCAN** — align a flatbed scan of the printed calibration grid with the reference layout, then sample the average RGB of each tile's deadzone area to extract the *actual* printed colour for each sequence.
3. **QUANTIZE** — use the extracted actual colours as a palette to quantise an input artwork image (Floyd-Steinberg error diffusion optional), mapping each pixel to the closest print sequence.
4. **EXPORT** — generate per-filament STL files that a multi-material slicer loads, assigning each file to the corresponding extruder.

The mathematical core covers: combinatorial sequence enumeration (base-\(c\) digit decomposition), grid packing under dual constraints (print bed and scanner size), Beer-Lambert transmittance approximation for colour simulation, grid alignment with DPI estimation and deadzone sampling, and nearest-colour mapping in RGB space with optional K-means initialisation.
