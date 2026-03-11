# Colour Quantizer — UI/UX Specification

**Version:** 1.0  
**Date:** 2026-01-16  
**Status:** Production Ready  
**Tool URL:** `#tools/colour-quantizer`

---

## Table of Contents

1. [Overview](#overview)
2. [Layout Diagrams](#layout-diagrams)
3. [Component Hierarchy](#component-hierarchy)
4. [User Flow](#user-flow)
5. [State Machine](#state-machine)
6. [Interaction Patterns](#interaction-patterns)
7. [Feature Specifications](#feature-specifications)
8. [Visual Examples](#visual-examples)

---

## Overview

The Colour Quantizer is a professional image processing tool that reduces image colours to a limited palette using perceptually accurate LAB colour space and multiple dithering algorithms.

### Key Features
- **17 Predefined Palettes** (1-bit to 17-colour)
- **12 Dithering Algorithms** (Blue Noise, Floyd-Steinberg, Bayer, etc.)
- **Real-time Preview** with image adjustments
- **Professional Export** with descriptive filenames

---

## Layout Diagrams

### Desktop Layout (Landscape ≥800px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: COLOUR QUANTIZER                                  [← Back] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐  │
│  │   SIDEBAR    │  │           CANVAS AREA                    │  │
│  │              │  │                                            │  │
│  │ ┌──────────┐ │  │  ┌──────────────────────────────────┐   │  │
│  │ │ SOURCE   │ │  │  │                                  │   │  │
│  │ └──────────┘ │  │  │                                  │   │  │
│  │              │  │  │                                  │   │  │
│  │ ┌──────────┐ │  │  │        Image Preview          │   │  │
│  │ │ PALETTE  │ │  │  │          420×420              │   │  │
│  │ └──────────┘ │  │  │        (or image size)         │   │  │
│  │              │  │  │                                  │   │  │
│  │ ┌──────────┐ │  │  │                                  │   │  │
│  │ │ADJUSTMTS │ │  │  └──────────────────────────────────┘   │  │
│  │ └──────────┘ │  │                                            │  │
│  │              │  │  Status: Ready / Processing... / Done      │  │
│  │ ┌──────────┐ │  │                                            │  │
│  │ │DITHERING │ │  │  [Process] [Undo] [Download PNG]          │  │
│  │ └──────────┘ │  │                                            │  │
│  │              │  └──────────────────────────────────────────┘  │
│  └──────────────┘                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile/Portrait Layout (<800px)

```
┌───────────────────────────┐
│ COLOUR QUANTIZER    [← ] │
├───────────────────────────┤
│                           │
│  ┌─────────────────────┐ │
│  │                     │ │
│  │   Image Preview   │ │
│  │     420×420       │ │
│  │                     │ │
│  └─────────────────────┘ │
│                           │
│  Status: Ready            │
│                           │
│  [Process] [Undo] [⬇]    │
│                           │
├───────────────────────────┤
│       SIDEBAR BELOW       │
│                           │
│  ┌─────────────────────┐ │
│  │ ▼ SOURCE            │ │
│  ├─────────────────────┤ │
│  │ ▼ PALETTE           │ │
│  ├─────────────────────┤ │
│  │ ▼ ADJUSTMENTS       │ │
│  ├─────────────────────┤ │
│  │ ▼ DITHERING         │ │
│  └─────────────────────┘ │
│                           │
└───────────────────────────┘
```

---

## Component Hierarchy

### Visual Tree Structure

```
ColourQuantizer (Tool Instance)
│
├─ ToolBase (Framework)
│  │
│  ├─ Sidebar (Left/Below)
│  │  │
│  │  ├─ Tab: SOURCE
│  │  │  └─ Block: Upload
│  │  │     └─ FileInput (imageFile)
│  │  │
│  │  ├─ Tab: PALETTE
│  │  │  └─ Block: Selection
│  │  │     └─ Dropdown (palettePreset)
│  │  │        ├─ Custom
│  │  │        ├─ 1-bit
│  │  │        ├─ 2-bit
│  │  │        ├─ 3-bit
│  │  │        ├─ 3-bit Grayscale
│  │  │        ├─ NES
│  │  │        ├─ Game Boy
│  │  │        ├─ Primaries
│  │  │        ├─ Pastel
│  │  │        └─ Ggost
│  │  │
│  │  ├─ Tab: ADJUSTMENTS
│  │  │  └─ Block: Image
│  │  │     ├─ Slider (gamma: 0.2–2.2)
│  │  │     ├─ Slider (contrast: 0–200%)
│  │  │     ├─ Slider (saturation: 0–200%)
│  │  │     └─ Button (resetAdjustments)
│  │  │
│  │  └─ Tab: DITHERING
│  │     └─ Block: Algorithm
│  │        └─ Dropdown (ditherAlgorithm)
│  │           ├─ None
│  │           ├─ Blue Noise ⭐
│  │           ├─ Floyd-Steinberg
│  │           ├─ Atkinson
│  │           ├─ Jarvis-Judice-Ninke
│  │           ├─ Stucki
│  │           ├─ Burkes
│  │           ├─ Sierra-3
│  │           ├─ Bayer 2×2
│  │           ├─ Bayer 4×4
│  │           ├─ Bayer 8×8
│  │           └─ Halftone
│  │
│  ├─ Canvas (Center/Top)
│  │  ├─ HTMLCanvasElement (420×420 default)
│  │  └─ ImageData Display
│  │     ├─ originalImage (uploaded)
│  │     ├─ previewImage (with adjustments)
│  │     └─ processedImage (quantized+dithered)
│  │
│  └─ Status Bar
│     └─ Text Display (status messages)
│
└─ Custom Action Buttons (Below Canvas)
   ├─ Button: Process
   ├─ Button: Undo
   └─ Button: Download PNG
```

### Component Data Flow

```
┌────────────────┐
│  File Input    │
└───────┬────────┘
        │ FileReader
        ↓
┌────────────────┐
│ originalImage  │──────────┐
│  (ImageData)   │          │
└────────────────┘          │
                            │ Apply adjustments
┌────────────────┐          │ (gamma/contrast/sat)
│   Sliders:     │          │
│   - Gamma      │──────────┤
│   - Contrast   │          │
│   - Saturation │          │
└────────────────┘          ↓
                   ┌────────────────┐
                   │ previewImage   │
                   │  (ImageData)   │
                   └────────┬───────┘
                            │
    ┌─────────────┐         │ Process Button
    │  Palette    │         │ (quantize + dither)
    │  Dropdown   │─────────┤
    └─────────────┘         │
                            │
    ┌─────────────┐         │
    │  Dithering  │         │
    │  Dropdown   │─────────┤
    └─────────────┘         ↓
                   ┌────────────────┐
                   │processedImage  │
                   │  (ImageData)   │
                   └────────┬───────┘
                            │
                            ↓
                   ┌────────────────┐
                   │ Canvas Display │
                   └────────────────┘
                            │
                            ↓
                   ┌────────────────┐
                   │ Download PNG   │
                   └────────────────┘
```

---

## User Flow

### Primary User Journey

```
┌─────────────┐
│   START     │
│  Load Tool  │
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│  Upload Image    │ ← File selector opens
│  (PNG/JPG/WebP)  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Image Displayed  │ ← originalImage → previewImage
│   on Canvas      │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐        ┌──────────────────┐
│ Adjust Settings? │───YES──→│  Move Sliders    │
└──────┬───────────┘        │  - Gamma         │
       │                    │  - Contrast      │
       NO                   │  - Saturation    │
       │                    └──────┬───────────┘
       │                           │ Real-time preview
       │                           │ updates on canvas
       │                           │
       │←──────────────────────────┘
       ↓
┌──────────────────┐
│ Select Palette   │ ← Dropdown: 17 options
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│Select Dithering  │ ← Dropdown: 12 algorithms
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Click "Process"  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   Processing...  │ ← Status shows elapsed time
│  (0.5–3 seconds) │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│Result Displayed  │ ← processedImage on canvas
│   on Canvas      │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐        ┌──────────────────┐
│   Satisfied?     │───NO───→│  Click "Undo"    │
└──────┬───────────┘        │  Try Different   │
       │                    │  Settings        │
       YES                  └──────┬───────────┘
       │                           │
       │←──────────────────────────┘
       ↓
┌──────────────────┐
│Download PNG File │ ← Descriptive filename
└──────┬───────────┘
       │
       ↓
┌──────────────┐
│   COMPLETE   │
└──────────────┘
```

### Alternative Flows

#### Flow: Quick Test (No Adjustments)
```
Upload → Select Palette → Select Dither → Process → Download
```

#### Flow: Fine-tune Multiple Times
```
Upload → Adjust → Process → Undo → Re-adjust → Process → Download
```

#### Flow: Compare Algorithms
```
Upload → Process (Algorithm A) → Undo → 
Change Algorithm → Process (Algorithm B) → Compare → Download
```

---

## State Machine

### Tool States

```
┌─────────────┐
│   INITIAL   │ ← Tool loaded, no image
└──────┬──────┘
       │ Upload image
       ↓
┌─────────────┐
│   LOADED    │ ← Image displayed, ready for adjustments
└──────┬──────┘
       │ Adjust sliders
       ↓
┌─────────────┐
│  PREVIEW    │ ← Adjustments applied, ready to process
└──────┬──────┘
       │ Click "Process"
       ↓
┌─────────────┐
│ PROCESSING  │ ← Quantizing + dithering (0.5–3s)
└──────┬──────┘
       │ Complete
       ↓
┌─────────────┐
│ PROCESSED   │ ← Result displayed, can undo/download
└──────┬──────┘
       │
       ├─ Click "Undo" ────→ PREVIEW
       ├─ Click "Download" → PROCESSED (stays)
       └─ Upload new ─────→ LOADED
```

### State Transition Table

| Current State | Action | Next State | Side Effects |
|---------------|--------|------------|--------------|
| INITIAL | Upload image | LOADED | `originalImage` set, canvas displays |
| LOADED | Adjust slider | PREVIEW | `previewImage` updated, canvas redraws |
| PREVIEW | Click "Process" | PROCESSING | Status: "Processing..." |
| PROCESSING | Algorithm complete | PROCESSED | `processedImage` set, show time |
| PROCESSED | Click "Undo" | PREVIEW | `processedImage` cleared, show preview |
| PROCESSED | Click "Download" | PROCESSED | PNG file downloads |
| PROCESSED | Upload new image | LOADED | All images cleared, reset |
| ANY | Change palette | (same) | (no immediate effect until process) |
| ANY | Change dither | (same) | Status shows algorithm description |

---

## Interaction Patterns

### File Upload Interaction

```
┌─────────────────────────────┐
│  Click "Image" file input   │
│  in SOURCE tab              │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  OS file picker opens       │
│  Filter: PNG, JPEG, WebP    │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  User selects file          │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  FileReader.readAsDataURL() │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  Image object loads         │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  Draw to temp canvas        │
│  Extract ImageData          │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  Store as originalImage     │
│  Copy to previewImage       │
└───────────┬─────────────────┘
            │
            ↓
┌─────────────────────────────┐
│  Display on canvas          │
│  Status: "Image loaded"     │
└─────────────────────────────┘
```

### Slider Adjustment Interaction

```
User drags slider
    │
    ↓
Input event fires ─────→ onUpdate(key, value, allValues)
    │                            │
    │                            ↓
    │                   Check if gamma/contrast/saturation
    │                            │
    │                            ↓
    │                   Call _updatePreview(allValues)
    │                            │
    │                            ↓
    │                   ImageAdjustments.applyAllAdjustments()
    │                            │
    │                            ↓
    │                   previewImage = adjusted ImageData
    │                            │
    │                            ↓
    └────────────────→ tool.draw() ← Canvas redraws
                                │
                                ↓
                       User sees real-time update
```

### Process Button Interaction

```
Click "Process"
    │
    ↓
_processImage() called
    │
    ├─ Check imageData exists
    │  └─ If none → Status: "No image loaded", return
    │
    ├─ setStatus("Processing...")
    │
    ├─ setTimeout(() => { ... }, 50) ← Allow UI update
    │      │
    │      ├─ Get active palette (hexes)
    │      ├─ Convert palette to LAB space
    │      ├─ Get dither algorithm
    │      │
    │      ├─ Switch (algorithm):
    │      │  ├─ "Blue Noise" → Dither.ditherBlueNoiseBracketing()
    │      │  ├─ "Floyd-Steinberg" → Dither.floydSteinberg()
    │      │  ├─ "Bayer 4×4" → Dither.bayer4x4()
    │      │  └─ etc...
    │      │
    │      ├─ processedImage = result
    │      ├─ tool.draw()
    │      └─ setStatus("Processed in X.XXs")
    │
    └─ User sees result
```

### Download Interaction

```
Click "Download PNG"
    │
    ↓
Check processedImage exists
    │
    ├─ None → Status: "No image to download"
    │
    └─ Exists:
        │
        ├─ Create temp canvas
        ├─ Put ImageData on canvas
        ├─ canvas.toDataURL('image/png')
        │
        ├─ Generate filename:
        │  "quantized_[palette]_[algorithm]_[timestamp].png"
        │  Example: "quantized_nes_blue-noise_1736932800000.png"
        │
        ├─ Create <a> element
        ├─ Set href = dataURL
        ├─ Set download = filename
        ├─ Click <a>
        │
        └─ Status: "Downloaded: [filename]"
```

---

## Feature Specifications

### 1. SOURCE Tab

#### Upload Control

**Component:** `ToolBase.FileInput`

**Properties:**
- Label: "Image"
- Accept: `image/png,image/jpeg,image/webp`
- Key: `imageFile`

**Behaviour:**
- Opens OS file picker
- Validates file type
- Converts to ImageData
- Updates canvas immediately
- Clears any previous processed image

**Supported Formats:**
| Format | Extension | Notes |
|--------|-----------|-------|
| PNG | `.png` | Best for pixel art/screenshots |
| JPEG | `.jpg`, `.jpeg` | Lossy, good for photos |
| WebP | `.webp` | Modern format, good compression |

**Size Limits:**
- No hard limit (browser-dependent)
- Performance tested up to 4000×3000px
- Warning recommended for >8000×6000px

---

### 2. PALETTE Tab

#### Palette Dropdown

**Component:** `ToolBase.Dropdown`

**Properties:**
- Label: "Preset"
- Key: `palettePreset`
- Default: "Custom"

**Available Palettes:**

| Palette | Colours | Description | Use Case |
|---------|---------|-------------|----------|
| **Custom** | 2 | Black + White | Future: User-editable |
| **1-bit** | 2 | `#000000`, `#FFFFFF` | Pure black & white |
| **2-bit** | 4 | 4 grays | Grayscale with 4 levels |
| **3-bit** | 8 | RGB corners | Classic 8-colour CGA |
| **3-bit Grayscale** | 8 | 8 grays | Smooth grayscale |
| **NES** | 16 | NES palette | Retro gaming aesthetic |
| **Game Boy** | 4 | Green shades | Classic Game Boy look |
| **Primaries** | 5 | Black/White + RGB | Bold primary colours |
| **Pastel** | 6 | Soft pastels | Gentle, soft aesthetic |
| **Ggost** | 17 | Custom palette | Curated colour set |

**Palette Visualization:**

```
1-bit:     ████ ████
           Black White

2-bit:     ████ ████ ████ ████
           Black Dark Gray Light Gray White

3-bit:     ████ ████ ████ ████ ████ ████ ████ ████
           Blk  Red  Grn  Yel  Blu  Mag  Cya  Wht

Game Boy:  ████ ████ ████ ████
           Darkest Dark Light Lightest
```

---

### 3. ADJUSTMENTS Tab

#### Gamma Slider

**Component:** `ToolBase.Slider`

**Properties:**
- Label: "Gamma"
- Range: 0.2 – 2.2
- Step: 0.1
- Default: 1.0
- Key: `gamma`
- Show Number: Yes

**Effect:**
- < 1.0: Brightens image (gamma correction)
- = 1.0: No change (linear)
- > 1.0: Darkens image

**Formula:** `output = (input/255)^(1/γ) × 255`

**Visual Effect:**
```
Gamma 0.5 (Brighten):        Gamma 1.0 (Normal):         Gamma 2.0 (Darken):
████████                      ████████                    ████████
██████▓▓                      ████▓▓▓▓                    ██▓▓▒▒░░
████▓▓▒▒                      ▓▓▓▓▒▒▒▒                    ▓▓▒▒░░  
▓▓▓▓▒▒░░                      ▒▒▒▒░░░░                    ▒▒░░    
```

---

#### Contrast Slider

**Component:** `ToolBase.Slider`

**Properties:**
- Label: "Contrast"
- Range: 0 – 200 (%)
- Step: 5
- Default: 100
- Key: `contrast`
- Show Number: Yes

**Effect:**
- 0%: Completely flat (all mid-gray)
- 100%: No change
- 200%: Double contrast (very punchy)

**Formula:** `output = ((input/255 - 0.5) × c + 0.5) × 255`

**Visual Effect:**
```
Contrast 50% (Low):          Contrast 100% (Normal):     Contrast 150% (High):
████████                      ████████                    ████████
██████▓▓                      ████▓▓▓▓                    ████░░░░
████▓▓▓▓                      ▓▓▓▓▒▒▒▒                    ░░░░    
▓▓▓▓▓▓▓▓                      ▒▒▒▒░░░░                            
```

---

#### Saturation Slider

**Component:** `ToolBase.Slider`

**Properties:**
- Label: "Saturation"
- Range: 0 – 200 (%)
- Step: 5
- Default: 100
- Key: `saturation`
- Show Number: Yes

**Effect:**
- 0%: Complete desaturation (grayscale)
- 100%: Original colours
- 200%: Hyper-saturated (very vibrant)

**Formula:** `output = gray + s × (input - gray)`  
Where `gray = 0.2126R + 0.7152G + 0.0722B` (ITU-R BT.709)

**Visual Effect:**
```
Saturation 0% (Gray):        Saturation 100% (Normal):   Saturation 200% (Vibrant):
████████████                  ████▓▓▓▓████                ████░░░░████
████████████                  ▓▓▓▓▓▓▓▓▓▓▓▓                ░░░░░░░░░░░░
████████████                  ▓▓▓▓████▓▓▓▓                ░░░░████░░░░
```

---

#### Reset Button

**Component:** `ToolBase.Button`

**Properties:**
- Label: "Reset"
- Key: `resetAdjustments`

**Behaviour:**
- Gamma → 1.0
- Contrast → 100
- Saturation → 100
- Triggers preview update
- Status: "Adjustments reset"

---

### 4. DITHERING Tab

#### Algorithm Dropdown

**Component:** `ToolBase.Dropdown`

**Properties:**
- Label: "Method"
- Key: `ditherAlgorithm`
- Default: "Blue Noise"

**Available Algorithms:**

| Algorithm | Category | Pattern | Quality | Speed | Best For |
|-----------|----------|---------|---------|-------|----------|
| **None** | Quantization | Solid blocks | Posterized | Fastest | Simple colour reduction |
| **Blue Noise** ⭐ | Stochastic | Organic | Highest | Slow | Photographs, smooth gradients |
| **Floyd-Steinberg** | Error Diffusion | Diagonal grain | High | Medium | General purpose |
| **Atkinson** | Error Diffusion | High contrast | High | Medium | 1-bit images, text |
| **Jarvis-Judice-Ninke** | Error Diffusion | Smooth | High | Slow | Gradients |
| **Stucki** | Error Diffusion | Very smooth | High | Slow | Organic patterns |
| **Burkes** | Error Diffusion | Balanced | Good | Fast | Quick processing |
| **Sierra-3** | Error Diffusion | Three-row | Good | Medium | General purpose |
| **Bayer 2×2** | Ordered | Checkerboard | Low | Fastest | Retro aesthetic |
| **Bayer 4×4** | Ordered | Crosshatch | Medium | Fastest | Classic dither look |
| **Bayer 8×8** | Ordered | Fine crosshatch | Good | Fastest | Fine detail |
| **Halftone** | Ordered | Dots | Good | Fastest | Newspaper style |

**Pattern Examples:**

```
None (Solid):               Blue Noise:                 Floyd-Steinberg:
████████████████            ████▓███▓███████            ████▓▓▓▓▓▓▓▓▓▓▓▓
████████████████            █▓██▓▓██▓▓█████▓            ██▓▓▓▓▓▒▒▒▒▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            ▓▓▓▓▒▓▓▓▒▓▓▓▓▓▓▓            ▓▓▓▓▒▒▒▒▒▒░░░░░░
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            ▓▓▒▓▒▒▓▒▒▓▒▓▓▓▓▒            ▓▓▒▒▒▒░░░░░░░░  

Bayer 4×4:                  Halftone:                   Atkinson:
████▓▓▓▓████▓▓▓▓            ████  ▓▓  ████  ▓▓          ████████▓▓▓▓▓▓▓▓
▓▓▓▓  ▓▓▓▓  ▓▓▓▓            ▓▓  ░░  ▓▓  ░░  ▓▓          ████▓▓▓▓▓▓▓▓▒▒▒▒
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            ▓▓▓▓  ▒▒▒▒  ▒▒▒▒            ▓▓▓▓▓▓▓▓▒▒▒▒░░░░
▓▓  ▓▓▓▓  ▓▓▓▓              ▒▒  ░░  ▒▒  ░░  ▒▒          ▓▓▓▓▒▒▒▒░░░░    
```

**Status Messages:**

When algorithm changes, status bar shows:
- "Nearest colour only, no dithering"
- "Geometric bracketing with blue noise (best quality)"
- "Classic error diffusion, diagonal grain"
- "High contrast, reduced bleed (1-bit style)"
- "Wide diffusion, smooth gradients"
- etc.

---

### 5. Canvas Area

#### Display Canvas

**Component:** `ToolBase.Canvas`

**Default Size:** 420×420px (30F in F-system)

**Display Modes:**
- **Fit:** Scale to fit container (maintains aspect ratio)
- **Actual:** Display at 1:1 pixel ratio

**Content Priority:**
1. **processedImage** (if exists) ← After processing
2. **previewImage** (if exists) ← After adjustments
3. **originalImage** (if exists) ← After upload
4. **Placeholder** ← "Upload an image to begin"

**Rendering Logic:**
```javascript
if (processedImage) {
    display(processedImage);  // Show quantized result
} else if (previewImage) {
    display(previewImage);    // Show adjusted original
} else if (originalImage) {
    display(originalImage);   // Show raw upload
} else {
    displayPlaceholder();     // Show message
}
```

**Centring:**
- Image centred on canvas
- Padding if image smaller than canvas
- No cropping if image larger (may need scroll)

---

### 6. Action Buttons

#### Process Button

**Label:** "Process"

**Behaviour:**
1. Validate image exists
2. Show status: "Processing..."
3. Get palette + convert to LAB
4. Apply selected dithering algorithm
5. Store result in `processedImage`
6. Redraw canvas
7. Show status: "Processed in X.XXs"

**Processing Time (1920×1080):**
- None: < 0.5s
- Blue Noise: 2–3s
- Floyd-Steinberg: 1–2s
- Bayer 4×4: 0.5–1s

---

#### Undo Button

**Label:** "Undo"

**Behaviour:**
1. Clear `processedImage`
2. Redraw canvas (shows `previewImage`)
3. Status: "Reverted to preview"

**Use Case:**
- Try different algorithms without re-processing adjustments
- Quick A/B comparison

---

#### Download PNG Button

**Label:** "Download PNG"

**Behaviour:**
1. Get current displayed image (processed or preview)
2. Create temp canvas
3. Put ImageData on canvas
4. Generate PNG data URL
5. Create download link
6. Trigger download

**Filename Format:**
```
quantized_[palette]_[algorithm]_[timestamp].png

Examples:
- quantized_nes_blue-noise_1736932800000.png
- quantized_1-bit_floyd-steinberg_1736932850000.png
- quantized_gameboy_bayer-4x4_1736932900000.png
```

---

### 7. Status Bar

**Location:** Below canvas, above action buttons

**Display:** Single line text

**Messages:**

| State | Message Example |
|-------|----------------|
| Initial | "Upload an image to begin" |
| Image loaded | "Image loaded: 1920×1080" |
| Adjusting | "Gamma 0.8" / "Contrast 120%" |
| Algorithm change | "Blue noise: Geometric bracketing (best quality)" |
| Processing | "Processing..." |
| Complete | "Processed in 2.34s" |
| Undo | "Reverted to preview" |
| Download | "Downloaded: quantized_nes_blue-noise_1736932800.png" |
| Error | "No image loaded" / "Blue noise texture failed" |

---

## Visual Examples

### Example 1: Upload Flow

```
Step 1: Initial State
┌─────────────────────────────────────┐
│ COLOUR QUANTIZER              [← ] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │                             │   │
│  │  "Upload an image to       │   │
│  │   begin"                    │   │
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Status: Upload an image to begin  │
│                                     │
└─────────────────────────────────────┘

Step 2: After Upload
┌─────────────────────────────────────┐
│ COLOUR QUANTIZER              [← ] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ██████████████████████████ │   │
│  │ ██████████████████████████ │   │
│  │ ██████████████████████████ │   │
│  │ ██████████████████████████ │   │
│  │ ██████████████████████████ │   │
│  │ ██████████████████████████ │   │
│  └─────────────────────────────┘   │
│                                     │
│  Status: Image loaded: 1920×1080   │
│  [Process] [Undo] [Download PNG]   │
│                                     │
└─────────────────────────────────────┘
```

---

### Example 2: Processing States

```
Before Processing (Preview):
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │ ██████████████████████████ │   │  Full colour
│  │ ████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │  photograph
│  │ ▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │   │
│  │ ▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────┘   │
│  Status: Ready to process          │
│  [Process] [Undo] [Download PNG]   │
└─────────────────────────────────────┘

During Processing:
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │ ██████████████████████████ │   │
│  │ ████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │
│  │ ▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │   │
│  │ ▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────┘   │
│  Status: Processing...             │
│  [Process] [Undo] [Download PNG]   │
└─────────────────────────────────────┘

After Processing (8-colour palette):
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │ ██████████████████████████ │   │  Reduced to
│  │ ████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │   │  8 colours
│  │ ▓▓▓▓▒▒▓▒▒▒▓▒▒▒▒▓▒▒▒▓▒▒▒▒▒▓ │   │  with dither
│  │ ▒▒░▒░▒░▒░░▒░░▒░░░▒░░░▒░░░ │   │  pattern
│  └─────────────────────────────┘   │
│  Status: Processed in 1.87s        │
│  [Process] [Undo] [Download PNG]   │
└─────────────────────────────────────┘
```

---

### Example 3: Dithering Comparison

```
Original (Full Colour):
████████████████████████████████████
████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░

None (No Dithering):
████████████████████████████████████
████████████████████████████████████
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

Blue Noise:
████▓███▓███████████▓███████████████
███▓▓███▓▓████████▓▓████████▓███████
▓▓▓▓▓▒▓▓▓▒▓▓▓▓▓▓▓▓▓▒▓▓▓▓▓▓▓▓▒▓▓▓▓▓▓▓
▒▓▒▒▒▒▒▓▒▒░▒▒▒▒▒▒▒▒▒░▒▒▒░▒░▒░░▒░░▒░

Floyd-Steinberg:
████████████████████████████████████
████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▒▓▒▓▒▓▒▒▒▓▒▒▒▒▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓
▒▓▒▒░▒░▒░▒░░▒░░▒░░░▒░░░░░░░░░░░░░░░

Bayer 4×4:
████▓▓▓▓████▓▓▓▓████▓▓▓▓████▓▓▓▓████
▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  ▓▓▓▓  
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▓▓▒▒▒▒▒▒▓▓▒▒▒▒▒▒▒▒
▓▓  ▒▒▓▓  ▒▒▒▒  ░░▒▒  ░░░░▒▒  ░░░░

Atkinson:
████████████████████████████████████
████████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
▓▓▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░      
```

---

## Appendix: Technical Details

### State Object Structure

```javascript
{
    originalImage: ImageData | null,      // 1920×1080×4 = 8,294,400 bytes
    previewImage: ImageData | null,       // Same size as original
    processedImage: ImageData | null,     // Same size as original
    blueNoiseTexture: ImageData | null,   // 64×64×4 = 16,384 bytes (typical)
    customPalette: ['#000000', '#FFFFFF'] // Future: User-editable
}
```

### Performance Characteristics

**Memory Usage (1920×1080 image):**
- originalImage: ~8.3 MB
- previewImage: ~8.3 MB
- processedImage: ~8.3 MB
- blueNoiseTexture: ~16 KB
- **Total:** ~25 MB per loaded image

**Processing Time (1920×1080, approximate):**
- LAB conversion: 50-100ms
- Blue Noise: 2000-3000ms
- Floyd-Steinberg: 1000-2000ms
- Bayer 4×4: 500-1000ms
- None: 300-500ms

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| File input | ✅ | ✅ | ✅ | ✅ |
| Canvas 2D | ✅ | ✅ | ✅ | ✅ |
| ImageData | ✅ | ✅ | ✅ | ✅ |
| FileReader | ✅ | ✅ | ✅ | ✅ |
| Download link | ✅ | ✅ | ✅ | ✅ |

**Minimum Versions:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## End of Document

**Document Version:** 1.0  
**Last Updated:** 2026-01-16  
**Maintainer:** SiteBoy Development Team  
**Related Files:**
- Implementation: `assets/js/tools/processors/color-quantizer.js`
- Algorithms: `assets/js/shared/algorithms/color/`, `algorithms/dither/`, `algorithms/image/`
- Phase Reports: `blog/docs/temp/color-quantizer-phase1-completion-report.md`, `phase-2-3-completion-report.md`

