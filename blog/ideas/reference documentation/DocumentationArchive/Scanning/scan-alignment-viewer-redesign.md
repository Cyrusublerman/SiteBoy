# Scan Alignment Viewer Redesign

## Overview
Redesigned the SCAN tab to function as a proper image viewer with precise grid overlay alignment.

## Key Changes

### 1. Full-Resolution Display
- Scan image displayed at **actual pixel size** (no downscaling)
- Canvas starts with image **fitted and centered**
- Pan and zoom to navigate full resolution

### 2. Mouse Controls
- **Mouse Wheel**: Zoom in/out (centered on cursor)
- **Left Mouse Drag**: Pan image
- **Corner Drag**: Reshape grid overlay (perspective transform)

### 3. Black 1px Grid Overlay
- Simple black grid with 1px lines
- Three density options: Every 10, Every 5, Full Grid
- Opacity control (default 0.8)
- No fill, no text, just clean lines

### 4. Corner Handle Transform
- 4 corner handles (visible squares)
- Drag to reshape grid (like Photoshop free transform)
- Allows perspective correction for camera distortion
- Auto-fit button calculates initial position

## Auto-Fit Calculation

```javascript
// 1. Scan displayed resolution
pxPerMm = scanImageDisplayWidth / scanWidth_mm

// 2. Grid physical size → display pixels
gridWidth_px = gridWidth_mm * pxPerMm
gridHeight_px = gridHeight_mm * pxPerMm

// 3. Initialize corner positions
corners[0] = { x: gridX, y: gridY }
corners[1] = { x: gridX + gridWidth_px, y: gridY }
corners[2] = { x: gridX, y: gridY + gridHeight_px }
corners[3] = { x: gridX + gridWidth_px, y: gridY + gridHeight_px }
```

## Grid Transform
Uses 4-point perspective transform:
- Map grid rectangle (in mm) to arbitrary quadrilateral
- Allows correction for scan perspective distortion
- Maintains grid structure while allowing reshape

## Benefits
1. **Precision**: See every pixel of scan at full resolution
2. **Flexibility**: Pan/zoom to any area of interest
3. **Accuracy**: Reshape grid to match actual printed position
4. **Simplicity**: Clean black grid, no visual clutter


