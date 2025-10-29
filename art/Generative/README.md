# Generative Art Gallery - Technical Guide

## Overview
This directory contains generative art pieces displayed as a mix of:
- **Interactive Canvas Elements** (P5.js sketches)
- **Video Files** (pre-rendered animations)

## Performance Optimization Strategy

### Canvas vs Video Decision Matrix

| Factor | Use Canvas/JS | Use Video File |
|--------|--------------|----------------|
| **Interactivity** | ✅ User controls needed | ❌ Pure display only |
| **CPU Usage** | < 15% sustained | > 15% sustained |
| **Duration** | < 10 seconds loop | > 10 seconds |
| **Complexity** | Simple 2D/particles <1000 | Complex 3D/heavy particles |
| **File Size** | N/A | < 5MB for <30s preferred |
| **Real-time Updates** | ✅ Parameter changes | ❌ Fixed animation |

### Performance Rules
1. **Single Page Load**: Max 3-4 active canvas elements at once
2. **Viewport Optimization**: Canvas auto-pauses when not visible (implemented via IntersectionObserver)
3. **Memory Management**: Canvas instances cleaned up on page navigation
4. **Video Compression**: Use H.264, target 2-4 Mbps bitrate, VGA color palette when possible

### CPU Benchmarking
To decide canvas vs video, test your sketch:
```javascript
// Add to your p5.js sketch
let frameCount = 0;
let startTime = Date.now();

function draw() {
  frameCount++;
  if (frameCount === 300) { // After 5 seconds at 60fps
    let elapsed = Date.now() - startTime;
    console.log(`Avg FPS: ${(frameCount / (elapsed/1000)).toFixed(1)}`);
  }
  // your drawing code
}
```
- If FPS < 45 consistently → **record to video**
- If FPS > 55 consistently → **keep as canvas**

## Video Hosting Strategy

### Local Hosting (On-Site)
**Use when:**
- Total gallery size < 50MB
- Development/testing phase
- You control bandwidth costs
- Files are well-compressed (<5MB each)

**Structure:**
```
art/Generative/
  ├── videos/          # Full videos
  ├── thumbs/          # Poster frames (JPG, <100KB each)
  └── README.md
```

### External Hosting
**Use when:**
- Individual files > 10MB
- 50+ video pieces total
- Want CDN performance
- Limited hosting bandwidth

**Recommended Services:**
- **YouTube (Unlisted)**: Free, reliable, good compression
- **Vimeo**: Better quality control, portfolio-friendly
- **Cloudflare Stream**: ~$5/month, full control
- **AWS S3 + CloudFront**: Pay-per-use, scalable

### Hybrid Approach (Recommended)
```javascript
{
  id: 'complex-animation',
  type: 'video',
  src: 'https://youtube.com/embed/YOUR_ID?autoplay=1&mute=1&loop=1',
  poster: '/art/Generative/thumbs/complex-animation.jpg', // Local
  externalHost: 'youtube'
}
```

## Adding New Pieces

### Canvas Sketch
1. Create your P5.js sketch in `projects/[YourProject]/`
2. Test performance (see benchmarking above)
3. Add entry to `art_section.js` `generativeWorks` array:

```javascript
{
  id: 'your-sketch-id',
  title: 'Your Sketch Title',
  type: 'canvas',
  scriptPath: '/projects/YourProject/your-sketch.js',
  description: 'Brief description',
  width: 600,
  height: 600
}
```

### Video File

#### Local Video
1. Export video (H.264, 30-60fps, VGA colors if possible)
2. Create poster frame: `ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 poster.jpg`
3. Place files:
   - Video → `art/Generative/videos/your-video.mp4`
   - Poster → `art/Generative/thumbs/your-video.jpg`
4. Add entry to `art_section.js`:

```javascript
{
  id: 'your-video-id',
  title: 'Your Video Title',
  type: 'video',
  src: '/art/Generative/videos/your-video.mp4',
  poster: '/art/Generative/thumbs/your-video.jpg',
  description: 'Brief description',
  width: 800,
  height: 800
}
```

#### External Video (YouTube Example)
```javascript
{
  id: 'youtube-video',
  title: 'External Video',
  type: 'video',
  src: 'https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=VIDEO_ID',
  poster: '/art/Generative/thumbs/youtube-video.jpg',
  description: 'Hosted on YouTube',
  width: 1920,
  height: 1080
}
```

## Video Compression Guide

### FFmpeg Commands

**Compress for Web:**
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k output.mp4
```

**VGA Color Quantization:**
```bash
# Use your existing quantizer tool first, then encode:
ffmpeg -i quantized-frames/%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p output.mp4
```

**Create Poster Frame:**
```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -q:v 2 poster.jpg
```

**Optimize Size (Target 2Mbps):**
```bash
ffmpeg -i input.mp4 -b:v 2M -maxrate 2M -bufsize 4M output.mp4
```

## Current Pieces

### Canvas Sketches
- **Phyllotaxis Sweep**: Interactive phyllotaxis pattern (600×600)
- **Phyllotaxis Manual**: Manual control exploration (600×600)

### Videos
*None yet - add your first video!*

## Performance Monitoring

The gallery implements automatic performance optimization:
- ✅ **Lazy Loading**: Canvas only initializes when scrolled into view
- ✅ **Auto-Pause**: Canvas pauses when off-screen (IntersectionObserver)
- ✅ **Memory Cleanup**: All instances destroyed on navigation
- ✅ **Viewport Margin**: 100px buffer for smooth transitions

Monitor performance in browser console:
```
▶️ Starting canvas: phyllotaxis-sweep
⏸️ Pausing canvas: phyllotaxis-sweep
```

## Troubleshooting

**Canvas not loading?**
- Check console for script path errors
- Verify p5.js library loads correctly
- Ensure sketch exports properly

**Video not playing?**
- Check file path and format (MP4/H.264 preferred)
- Verify poster image exists
- Check browser video codec support

**Performance issues?**
- Too many active canvases → convert some to videos
- Check CPU usage in DevTools Performance tab
- Reduce particle counts or simplify draw() loops

## Best Practices

1. **Test on Multiple Devices**: Mobile vs desktop performance varies greatly
2. **VGA Aesthetics**: Maintain color palette consistency
3. **File Naming**: Use kebab-case: `spiral-animation.mp4`
4. **Descriptions**: Brief, technical, focused on the algorithm
5. **Aspect Ratios**: Prefer square (1:1) or 16:9 for consistency

