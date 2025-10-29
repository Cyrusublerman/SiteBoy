# Generative Art - Quick Start

## 🚀 Test It Now
Server running at: **http://localhost:3000/#art/generative**

## 📊 Canvas vs Video - Quick Decision

### Use Canvas when:
- ✅ Interactive/user controls
- ✅ Simple animation < 10s
- ✅ CPU < 15%
- ✅ FPS > 55

### Use Video when:
- ✅ Pure display only
- ✅ Complex/long animation
- ✅ CPU > 15%
- ✅ FPS < 45

## 🎥 Video Hosting - Quick Decision

### Store Locally when:
- Gallery < 50MB total
- Files < 5MB each
- Development phase

### Use External when:
- Files > 10MB
- 50+ videos
- Need CDN
- Limited bandwidth

**Recommended**: Hybrid (thumbs local, big videos external)

## ➕ Add New Piece (30 seconds)

### Canvas:
Edit `assets/js/sections/art_section.js` line ~896:
```javascript
{
  id: 'my-sketch',
  title: 'My Sketch',
  type: 'canvas',
  scriptPath: '/projects/MyProject/sketch.js',
  description: 'What it does',
  width: 600,
  height: 600
}
```

### Video:
1. Place file: `art/Generative/videos/my-video.mp4`
2. Create poster: `art/Generative/thumbs/my-video.jpg`
3. Edit `assets/js/sections/art_section.js` line ~896:
```javascript
{
  id: 'my-video',
  title: 'My Video',
  type: 'video',
  src: '/art/Generative/videos/my-video.mp4',
  poster: '/art/Generative/thumbs/my-video.jpg',
  description: 'What it shows',
  width: 800,
  height: 800
}
```

## 🎬 Video Commands

Create poster:
```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 poster.jpg
```

Compress:
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 output.mp4
```

## ⚡ Performance Features

- ✅ Auto-pauses canvas when off-screen
- ✅ Only loads when visible
- ✅ Cleans up on navigation
- ✅ Watch console for status:
  ```
  ▶️ Starting canvas: my-sketch
  ⏸️ Pausing canvas: my-sketch
  ```

## 📚 Full Docs

- Technical guide: `art/Generative/README.md`
- Implementation details: `GENERATIVE_ART_IMPLEMENTATION.md`

