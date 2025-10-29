# MediaAssetManager Integration Examples

## How to Update Existing Code

### Before (Current Code):
```javascript
// In art_section.js - getPhotographyImages()
getPhotographyImages(photoSection) {
    const basePath = '/art/Photos/FILM';
    
    // Build image paths
    const images = [
        `${basePath}/Life1/photo-001.jpg`,
        `${basePath}/Life1/photo-002.jpg`,
        `${basePath}/Life1/photo-003.jpg`
    ];
    
    return images;
}
```

### After (With MediaAssetManager):
```javascript
// In art_section.js - getPhotographyImages()
getPhotographyImages(photoSection) {
    const basePath = '/art/Photos/FILM';
    
    // Build LOCAL paths (same as before)
    const localPaths = [
        `${basePath}/Life1/photo-001.jpg`,
        `${basePath}/Life1/photo-002.jpg`,
        `${basePath}/Life1/photo-003.jpg`
    ];
    
    // Resolve to cloud URLs if in production
    const resolvedPaths = window.MediaAssetManager.resolveAssetPaths(localPaths, 'display');
    
    return resolvedPaths;
}
```

**Result:**
- Local dev: Returns local paths (same as before)
- Production: Returns cloud CDN URLs automatically

---

## Pattern: Simple Path Resolution

### Use Case: Single image
```javascript
// Before
const imagePath = '/art/Digital/artwork-001.jpg';

// After
const imagePath = window.MediaAssetManager.resolveAssetPath(
    '/art/Digital/artwork-001.jpg',
    'display'  // or 'thumb', 'full'
);
```

---

## Pattern: Array of Images

### Use Case: Gallery, masonry, etc.
```javascript
// Before
const images = [
    '/art/Photos/photo1.jpg',
    '/art/Photos/photo2.jpg',
    '/art/Photos/photo3.jpg'
];

// After
const localPaths = [
    '/art/Photos/photo1.jpg',
    '/art/Photos/photo2.jpg',
    '/art/Photos/photo3.jpg'
];
const images = window.MediaAssetManager.resolveAssetPaths(localPaths, 'display');
```

---

## Pattern: Multiple Sizes (Responsive Images)

### Use Case: Responsive gallery with different sizes
```javascript
// Get all size variants
const imageSizes = window.MediaAssetManager.resolveAssetSizes(
    '/art/Photos/photo.jpg'
);

// Returns:
// {
//   thumb: '/art/Photos/photo-thumb.jpg',      // or cloud URL
//   display: '/art/Photos/photo-display.jpg',  // or cloud URL
//   full: '/art/Photos/photo.jpg'              // or cloud URL
// }

// Use in HTML
const img = document.createElement('img');
img.src = imageSizes.display;
img.srcset = `
    ${imageSizes.thumb} 400w,
    ${imageSizes.display} 800w,
    ${imageSizes.full} 1920w
`;
```

---

## Pattern: Dynamic Gallery (File System Scan)

### Current Problem:
Your galleries scan local file system, which won't work in production.

### Solution:
Use manifest to get asset list.

```javascript
// Before (only works locally)
renderPhotographyGallery(photoSection) {
    // Assumes files exist locally
    const images = this.scanLocalDirectory(`/art/Photos/FILM/${photoSection}/`);
    // ...
}

// After (works local + cloud)
renderPhotographyGallery(photoSection) {
    // Check if in local mode
    if (window.MediaAssetManager.isLocalDev) {
        // Local: scan directory (current method)
        const images = this.scanLocalDirectory(`/art/Photos/FILM/${photoSection}/`);
        return this.renderGallery(images);
    }
    
    // Production: get from manifest
    const directory = `art/Photos/FILM/${photoSection}`;
    const localPaths = window.MediaAssetManager.getAssetsInDirectory(directory);
    const resolvedPaths = window.MediaAssetManager.resolveAssetPaths(localPaths, 'display');
    
    return this.renderGallery(resolvedPaths);
}
```

---

## Pattern: Generative Art (Mixed Video/Canvas)

### Already Implemented in art_section.js!
```javascript
// Generative gallery with video
const generativeWorks = [
    {
        id: 'video-piece',
        type: 'video',
        src: '/art/Generative/videos/my-video.mp4',  // Local path
        poster: '/art/Generative/thumbs/my-video.jpg'
    }
];

// In render:
const videoSrc = window.MediaAssetManager.resolveAssetPath(work.src);
const posterSrc = window.MediaAssetManager.resolveAssetPath(work.poster, 'thumb');

const video = new ComponentLibrary.Video({
    src: videoSrc,
    poster: posterSrc
});
```

---

## Pattern: Lazy Loading with Intersection Observer

### Use Case: Load images as user scrolls
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const localPath = img.dataset.src;
            
            // Resolve to cloud URL if in production
            const resolvedPath = window.MediaAssetManager.resolveAssetPath(localPath, 'display');
            
            img.src = resolvedPath;
            observer.unobserve(img);
        }
    });
});

// Use data-src for lazy loading
images.forEach(localPath => {
    const img = document.createElement('img');
    img.dataset.src = localPath;  // Store local path
    img.src = '/assets/placeholder.png';  // Placeholder
    observer.observe(img);
});
```

---

## Complete Example: Update art_section.js

### File: `assets/js/sections/art_section.js`

Find this function:
```javascript
getPhotographyImages(photoSection) {
    const basePath = '/art/Photos/FILM';
    
    const photoSets = {
        'life1': [/* array of 44 images */],
        'life2': [/* array of 76 images */],
        'morocco': [/* array of 208 images */],
        // ...
    };
    
    const photos = photoSets[photoSection] || [];
    
    // OLD: Return local paths directly
    return photos.map(filename => `${basePath}/${photoSection}/${filename}`);
}
```

Update to:
```javascript
getPhotographyImages(photoSection) {
    const basePath = '/art/Photos/FILM';
    
    const photoSets = {
        'life1': [/* array of 44 images */],
        'life2': [/* array of 76 images */],
        'morocco': [/* array of 208 images */],
        // ...
    };
    
    const photos = photoSets[photoSection] || [];
    
    // Build local paths (same as before)
    const localPaths = photos.map(filename => `${basePath}/${photoSection}/${filename}`);
    
    // NEW: Resolve through MediaAssetManager
    // In local dev: returns local paths unchanged
    // In production: returns cloud CDN URLs
    return window.MediaAssetManager.resolveAssetPaths(localPaths, 'display');
}
```

**That's it!** One line change, works in both modes.

---

## Testing

### Test Local Mode (Default)
```javascript
// Open browser console on localhost
window.MediaAssetManager.debug();
// Should show: Mode: LOCAL DEV

const test = window.MediaAssetManager.resolveAssetPath('/art/Photos/test.jpg');
console.log(test);
// Should return: /art/Photos/test.jpg (unchanged)
```

### Test Production Mode (Before deploying)
```javascript
// Temporarily force production mode
// In media-asset-manager.js, line ~19:
detectLocalEnvironment() {
    return false;  // Force production mode for testing
}

// Reload page
window.MediaAssetManager.debug();
// Should show: Mode: PRODUCTION

const test = window.MediaAssetManager.resolveAssetPath('/art/Photos/test.jpg');
console.log(test);
// Should return: https://cdn.yourdomain.com/art/photos/test-display.jpg
```

---

## Migration Checklist for Each Section

### art_section.js
- [ ] Update `getPhotographyImages()` to use `resolveAssetPaths()`
- [ ] Update `renderGenerativeGallery()` video sources
- [ ] Update any hardcoded image paths

### blog_section.js
- [ ] Update markdown image paths (if any)
- [ ] Update featured image paths

### projects_section.js
- [ ] Update project image galleries
- [ ] Update project thumbnails

### tools_section.js
- [ ] Update tool example images
- [ ] Update any demo assets

---

## Performance Tip: Preload Manifest

In production, load manifest early for faster resolution:

```html
<!-- index.html -->
<link rel="preload" href="/assets/media-manifest.json" as="fetch" crossorigin>
```

---

## Debugging

### Check if asset exists in manifest
```javascript
const exists = window.MediaAssetManager.hasAsset('/art/Photos/test.jpg');
console.log('Asset in manifest:', exists);
```

### Get asset metadata
```javascript
const meta = window.MediaAssetManager.getAssetMetadata('/art/Photos/test.jpg');
console.log('Dimensions:', meta.width, 'x', meta.height);
console.log('Size:', meta.size / 1024, 'KB');
```

### Get stats
```javascript
const stats = window.MediaAssetManager.getStats();
console.log('Mode:', stats.mode);
console.log('Total assets:', stats.totalAssets);
console.log('Total size:', stats.totalSizeGB, 'GB');
```

---

## Common Pitfalls

### ❌ DON'T: Resolve paths in loops
```javascript
// BAD - Calls resolveAssetPath() 1000 times
images.forEach(path => {
    const resolved = window.MediaAssetManager.resolveAssetPath(path);
    // ...
});
```

### ✅ DO: Batch resolve
```javascript
// GOOD - Calls resolveAssetPaths() once
const resolvedPaths = window.MediaAssetManager.resolveAssetPaths(images);
resolvedPaths.forEach(path => {
    // ...
});
```

### ❌ DON'T: Hard-code cloud URLs
```javascript
// BAD - Breaks local dev
const image = 'https://cdn.yourdomain.com/art/photo.jpg';
```

### ✅ DO: Always use local paths + resolution
```javascript
// GOOD - Works in both modes
const localPath = '/art/photo.jpg';
const image = window.MediaAssetManager.resolveAssetPath(localPath);
```

---

## Summary

1. **Always store local paths** in your code
2. **Resolve at runtime** using MediaAssetManager
3. **Test both modes** before deploying
4. **Batch operations** for performance
5. **Use manifest** for production file listings

**The beauty:** Your code stays the same, just add one resolution step!

