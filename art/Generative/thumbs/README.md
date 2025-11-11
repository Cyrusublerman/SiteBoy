# Generative Art Thumbnails

This directory contains thumbnail images for the generative art gallery index.

## Generating Thumbnails

### Method 1: Automated (Recommended)
1. Navigate to: `http://localhost:3000/?generate-thumbnails`
2. Open browser console
3. The `ThumbnailGenerator` will automatically capture mid-frames
4. Download each generated image
5. Place downloaded JPGs in this directory

### Method 2: Manual
1. Navigate to individual animation pages
2. Let animation run to a visually interesting state
3. Use "SAVE FRAME" button to export current frame
4. Rename file to match animation ID (e.g., `circles.jpg`)
5. Place in this directory

### Method 3: Console
```javascript
const gen = new ThumbnailGenerator();
await gen.generateAll();
```

## Required Thumbnails
- [ ] phyllotaxis-sweep.jpg
- [ ] phyllotaxis-manual.jpg
- [ ] circles.jpg
- [ ] torus.jpg
- [ ] tiles.jpg
- [ ] harmonics.jpg
- [ ] wave-interference.jpg
- [ ] cymatics.jpg
- [ ] lissajous.jpg
- [ ] musical-harmonics.jpg

## Dimensions
All thumbnails should be **600x600 pixels** (square) to match animation canvas sizes.

## Format
- Format: JPEG
- Quality: 90%
- Naming: `{animation-id}.jpg` (lowercase, hyphenated)

