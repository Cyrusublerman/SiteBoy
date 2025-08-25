# Pixel Tiler - Advanced

A high-performance image tiling and animation tool optimized with WebAssembly for processing large datasets and complex mathematical equations.

## Overview

The Pixel Tiler creates animated mosaic arrangements from multiple input images. It supports two processing modes:

- **Classic Mode**: Fixed combinations (single, permutations, all combinations)
- **Equation Mode**: Mathematical expressions drive dynamic arrangements

## Key Features

### WebAssembly Optimization
- **5-10x faster** equation evaluation compared to pure JavaScript
- **2-3x faster** pixel operations and memory management
- Handles **high-resolution images** and **complex animations** smoothly
- Reduced memory usage and garbage collection

### Animation Modes
- **Single**: One arrangement  
- **Permutations**: n! combinations of your images
- **All Combinations**: n^4 arrangements exploring every possibility
- **Equation-Based**: Mathematical functions control image placement over time

### Mathematical Engine
Built-in functions for creative expression:
- Trigonometric: `sin`, `cos`, `tan`, `atan2`
- Noise generation: `noise(x, y, z)`
- Wave functions: `wave(phase, freq, amp)`
- Distance and mapping: `dist`, `map`, `lerp`, `clamp`
- Animation variables: `t` (time), `x`, `y` (position), `n` (image count)

### Export Options
- **PNG**: High-quality individual frames
- **GIF**: Optimized animations with quality control
- **Video**: MP4 export for professional workflows

## Usage

1. **Upload Images**: Add 2-8 images using the file picker
2. **Choose Mode**: Select Classic or Equation-based animation
3. **Configure Settings**: Set frame count, FPS, and quality options
4. **Process**: Generate your tiled animation
5. **Export**: Download as PNG sequence, GIF, or video

## Performance Notes

This tool uses WebAssembly for computationally intensive operations. Initial load may take a moment while the WASM module initializes, but processing will be significantly faster than pure JavaScript implementations.

**Recommended**: Use images under 1024px on the short side for optimal performance. The tool will automatically resize larger images.

## Technical Details

### WebAssembly Implementation
- **Rust-based core** for mathematical evaluation
- **Optimized pixel processing** with typed memory views  
- **Zero-copy data transfer** between JavaScript and WASM
- **Multi-threaded processing** where supported

### Mathematical Expressions
Example equations for dynamic animations:
- `floor(sin(x * 10 + t) * n)` - Sine wave pattern
- `floor(noise(x * 5, y * 5, t * 0.1) * n)` - Organic noise
- `floor(dist(x, y, 0.5, 0.5) * n + t) % n` - Radial expansion
- `floor((x + y + t) * n) % n` - Diagonal sweep

Variables available:
- `x`, `y`: Normalized coordinates (0-1)
- `px`, `py`: Pixel coordinates
- `t`: Animation time (0-1 over frame count)
- `n`: Number of input images
- `width`, `height`: Image dimensions

<div id="pixel-tiler-container">
    <!-- Tool interface will be inserted here by JavaScript -->
</div> 