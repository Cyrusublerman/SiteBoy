# Image23D Tool - Comprehensive Functionality Guide

## Overview

The Image23D tool transforms 2D images into pseudo-3D visualizations using depth mapping and perspective transformations. It creates 3D-like effects by manipulating image pixels based on depth information, without performing actual 3D rendering or color quantization.

**Key Distinction:** This tool does NOT perform image quantization (color palette reduction) like the Color Quantizer tool. Instead, it uses depth maps to create 3D visual effects on 2D images.

---

## Tool Architecture

### Core Processing Pipeline

```
Source Image + Depth Map → Depth Processing → 3D Projection → Lighting → Canvas Output
       ↓              ↓              ↓              ↓              ↓
   User Upload    Grayscale        Rotation/     Depth-based    Real-time
   (.png/.jpg)    Conversion       Scale/Perspective Modulation   Rendering
```

### State Management

**Global State Variables:**
- `sourceImage`: Loaded source image (Image object)
- `depthMap`: Optional depth information (Image object)
- `processedImage`: Cached processed result (Canvas)
- `toolInstance`: Reference to ToolBase instance
- `animator`: Animation controller for rotation

**Parameter State:**
- `rotationX/Y/Z`: 3D rotation angles (-180° to +180°)
- `scale`: Image scaling factor (0.1x to 3.0x)
- `depth`: Depth effect strength (0.0 to 1.0)
- `perspective`: Perspective distance (100 to 2000)
- `lighting`: Directional lighting parameters

---

## Tab-by-Tab Functionality Breakdown

## TAB 1: SOURCE

### Purpose
Handles input image loading and basic setup for 3D transformation pipeline.

### Block: Input
**File Upload Components:**
- **Source Image**: Primary 2D image to transform
  - Accepts: `image/*` (PNG, JPEG, GIF, WebP)
  - Processing: Loads as Image object, stores in `sourceImage`
  - Triggers: Resolution display update, automatic processing

- **Depth Map (Optional)**: Grayscale image defining depth
  - Accepts: `image/*` (typically grayscale PNG)
  - Processing: Loads as Image object, stores in `depthMap`
  - Purpose: Controls which pixels appear "closer" or "farther" in 3D space

**Logic Flow:**
```javascript
loadSourceImage(file) → FileReader → Image.onload → sourceImage = img
loadDepthMap(file) → FileReader → Image.onload → depthMap = img
→ updateResolution() → processAndDraw()
```

### Block: Transform
**Basic 3D Transformation Controls:**
- **X/Y/Z Rotation**: Independent axis rotation (-180° to +180°)
- **Scale**: Overall image size multiplier (0.1x to 3.0x)

**Feature Connections:**
- Rotations affect final `render3DImage()` canvas transformations
- Scale modifies the `ctx.scale()` applied to the projected image
- All parameters trigger immediate redraw via `processAndDraw()`

---

## TAB 2: 3D EFFECTS

### Purpose
Advanced 3D visualization controls for depth perception and spatial effects.

### Block: Depth & View
**Spatial Effect Parameters:**
- **Depth Strength**: Multiplier for depth map influence (0.0 to 1.0)
  - Logic: `depthValue = grayscaleDepth * depthStrength`
  - Effect: Controls how much depth map affects lighting/displacement

- **Perspective**: Simulated camera distance (100 to 2000)
  - Current Implementation: Stored but not actively used in rendering
  - Future Use: Could control field-of-view or distance scaling

### Block: Lighting
**Depth-Based Lighting Simulation:**
- **Enable Lighting**: Toggle for lighting effects (On/Off)
- **Light Intensity**: Strength of depth-based darkening (0.0 to 2.0)
- **Light X/Y**: Normalized light direction vectors (-1.0 to +1.0)

**Lighting Algorithm:**
```javascript
// For each pixel in depth-processed image:
depth = getDepthValue(x, y) * depthStrength
lightingFactor = max(0.3, 1.0 - depth * lightIntensity)
pixel.r *= lightingFactor
pixel.g *= lightingFactor
pixel.b *= lightingFactor
```

**Visual Effect:** Creates illusion of depth by darkening pixels that appear "farther away" based on depth map values.

---

## TAB 3: ANIMATION

### Purpose
Real-time animation controls for interactive 3D visualization.

### Block: Controls
**Animation Parameters:**
- **FPS**: Animation frame rate (1-60 FPS)
- **Play Rotation**: Starts continuous Y-axis rotation
- **Stop**: Halts current animation
- **Reset View**: Returns all transforms to default values

**Animation Logic:**
```javascript
startRotationAnimation():
    animator = toolInstance.animate({
        duration: 1000/fps,
        loop: true,
        onFrame: () => {
            rotationY += 2°
            if (rotationY >= 360°) rotationY -= 360°
            toolInstance.redraw()
        }
    })
```

### Block: Export
**Animation & Image Export:**
- **Format**: Output format selection (PNG/JPEG/WebP)
- **Quality**: Compression quality for lossy formats (0.1 to 1.0)
- **Download Image**: Exports current static view
- **Download Animation**: Exports 360° rotation sequence

**Export Implementation:**
```javascript
downloadCurrentImage():
    canvas = toolInstance.getCanvas()
    canvas.toBlob(blob, mimeType, quality)
    downloadBlob(blob, filename)

downloadAnimation():
    toolInstance.exportAnimation({
        frameCount: 60,
        fps: currentFps,
        filename: 'image3d-rotation.gif'
    })
```

---

## TAB 4: STATUS

### Purpose
Real-time feedback and information display.

### Block: Info
**Status Indicators:**
- **Status Message**: Current operation feedback
  - "Upload an image to begin 3D transformation"
  - "Source image loaded. Upload depth map for better 3D effect."
  - "Depth map loaded. Adjust parameters for 3D effect."

- **Resolution Display**: Image dimensions
  - Format: "Resolution: {width}x{height}"
  - Updates: Automatically on image load

---

## Core Processing Functions

### Depth Processing Pipeline

#### `getDepthData(depthImg, targetWidth, targetHeight)`
**Purpose:** Converts depth map image to usable depth values

**Algorithm:**
1. Create temporary canvas sized to target dimensions
2. Draw depth image with scaling
3. Extract RGBA image data
4. Convert RGB to grayscale: `(R + G + B) / (255 * 3)`
5. Return Float32Array of normalized depth values [0,1]

**Output:** `Float32Array[width × height]` containing depth values

#### `applyDepthTransformation(ctx, canvas, depthImg, params)`
**Purpose:** Apply depth-based lighting effects to processed image

**Algorithm:**
1. Get processed image data from canvas
2. Extract depth data using `getDepthData()`
3. For each pixel:
   - Calculate depth-adjusted lighting factor
   - Multiply RGB channels by lighting factor
   - Preserve alpha channel
4. Put modified image data back to canvas

### 3D Rendering Pipeline

#### `create3DProjection(sourceImg, depthImg, params)`
**Purpose:** Create depth-processed version of source image

**Algorithm:**
1. Create new canvas matching source image dimensions
2. Draw source image to canvas
3. If depth map provided, apply `applyDepthTransformation()`
4. Return processed canvas

#### `render3DImage(ctx, canvas, sourceImg, depthImg, params)`
**Purpose:** Apply 3D transformations and render to display canvas

**Algorithm:**
1. Clear display canvas with VGA black
2. Create 3D projection using `create3DProjection()`
3. Save canvas context
4. Translate to canvas center
5. Apply Z-axis rotation: `ctx.rotate(params.rotationZ * π/180)`
6. Apply scaling: `ctx.scale(params.scale, params.scale)`
7. Draw projected image centered: `ctx.drawImage(projected, -w/2, -h/2)`
8. Restore context

---

## Feature Interconnections

### Parameter Flow
```
User Input → Parameter Update → processAndDraw() → render3DImage()
     ↓              ↓              ↓              ↓
  Sliders      transformParams  create3DProjection  Canvas Display
  Toggles      State Object     applyDepthTransform Animation Loop
  Files        Validation       getDepthData        exportAnimation()
```

### Animation Integration
```
Animation Frame → Update rotationY → render3DImage() → Canvas Update
        ↓              ↓              ↓              ↓
    toolInstance.animate()  transformParams  Real-time Display  60fps Loop
    FPS Control         State Sync      Depth/Lighting     Smooth Rotation
```

### Export Pipeline
```
Static Export: Current State → Canvas → toBlob() → Download
     ↓              ↓              ↓              ↓
  render3DImage()  getCanvas()    PNG/JPEG/WebP  Browser Download

Animation Export: Frame Loop → render3DImage() → GIF Sequence
     ↓              ↓              ↓              ↓
  exportAnimation()  onRenderFrame()  60 Frames  ToolBase Encoder
  360° Rotation     Per-Frame Render  FPS Control  File Download
```

---

## Output Characteristics

### Visual Output
- **Resolution**: Matches source image dimensions
- **Color Depth**: 32-bit RGBA (full color)
- **Real-time Performance**: 30-60 FPS animation capability
- **Visual Effects**: Depth-based lighting, 3D rotation, scaling

### File Outputs
- **Static Images**: PNG/JPEG/WebP with quality control
- **Animations**: GIF sequences with customizable frame rates
- **Naming Convention**: `image3d.{ext}` or `image3d-rotation.gif`

### Display Canvas
- **Size**: Fixed at 420px (30F units)
- **Background**: VGA black (`var(--vga-black)`)
- **Text Rendering**: Space Mono font for status messages
- **Real-time Updates**: Immediate parameter feedback

---

## UI/UX Design Principles

### Layout Structure
- **Sidebar Width**: 30F (420px) - consistent with other tools
- **Control Height**: 2F (28px) - standard component sizing
- **Tab Organization**: Logical grouping by function
- **Block Spacing**: F-unit gaps for visual hierarchy

### User Experience Flow
1. **Initial State**: Empty canvas with upload prompt
2. **Image Loading**: Immediate display and resolution feedback
3. **Parameter Adjustment**: Real-time visual feedback
4. **Animation**: Smooth 360° rotation with FPS control
5. **Export**: Multiple format options with quality control

### Error Handling
- **File Loading**: Graceful failure with user feedback
- **Missing Images**: Clear status messages and empty state display
- **Animation States**: Proper cleanup and state management
- **Export Errors**: User-friendly error reporting

### Performance Considerations
- **Lazy Processing**: Only re-renders when parameters change
- **Memory Management**: Proper cleanup of temporary canvases
- **Animation Frame Rate**: User-controllable FPS with smooth interpolation
- **Canvas Reuse**: Minimizes object creation during animation

---

## Technical Specifications

### Browser Compatibility
- **Canvas API**: Required for image processing
- **File API**: Required for file uploads
- **Blob API**: Required for image export
- **Modern ES6**: Arrow functions, destructuring, async/await

### Dependencies
- **ToolBase**: Declarative UI framework and animation system
- **ComponentLibrary**: UI components (sliders, buttons, dropdowns)
- **MathematicalFoundation**: Layout calculations (F-system)
- **AnimationFoundation**: Animation lifecycle management

### Memory Usage
- **Base State**: ~2-3 Image objects + parameter state
- **Processing**: Temporary canvases during transformation
- **Animation**: Minimal additional memory for animation state
- **Export**: Temporary blob objects during file generation

### Performance Metrics
- **Image Processing**: O(width × height) for depth/lighting effects
- **Rendering**: Real-time 30-60 FPS capability
- **Animation**: Smooth 2° per frame rotation updates
- **Export**: 60-frame animation generation with progress feedback

---

## Future Enhancement Possibilities

### Image Quantization Integration (Addressed in Assessment)
- **Posterization**: Add color level reduction before depth processing
- **Dithering**: Bayer matrix dithering for reduced banding
- **Color Space**: Lab color space quantization options

### Advanced 3D Features
- **True Perspective**: Implement proper 3D projection matrices
- **Multiple Light Sources**: Support for ambient + directional lighting
- **Normal Mapping**: Surface detail enhancement
- **Environment Mapping**: Reflection effects

### UI Improvements
- **Preset Management**: Save/load parameter combinations
- **Real-time Preview**: Live parameter adjustment feedback
- **Batch Processing**: Multiple image processing
- **Advanced Export**: Video format support

---

## Conclusion

The Image23D tool provides a focused, real-time 3D image manipulation experience that transforms 2D images using depth-based effects and perspective transformations. Unlike the Color Quantizer tool which performs color palette reduction and quantization, Image23D creates pseudo-3D visual effects through depth mapping and lighting simulation.

**Key Strengths:**
- Real-time 3D manipulation with immediate visual feedback
- Intuitive parameter controls with logical grouping
- Smooth animation capabilities with export functionality
- Clean integration with SiteBoy's architectural patterns

**Distinct Purpose:** 3D visual effects through depth processing, not color quantization or palette manipulation.

---

*Guide created: December 15, 2025*
*Tool version: 1.0.0*
*Architecture: ToolBase + Shared Utilities integration*