/**
 * R2 Integration Example for SiteBoy Components
 * 
 * This file demonstrates how to integrate R2 URLs into existing SiteBoy components.
 * Copy these patterns into your actual components as needed.
 */

import R2Helper from './r2-url-helper.js';

// ============================================================================
// EXAMPLE 1: Simple Image Component with R2
// ============================================================================

export class R2ImageComponent {
  constructor(galleryName, imageName, size = 'web') {
    this.galleryName = galleryName;
    this.imageName = imageName;
    this.size = size;
  }
  
  render() {
    const url = R2Helper.getPhotoUrl(this.galleryName, this.imageName, this.size);
    
    return `
      <img 
        src="${url}" 
        alt="${this.imageName}"
        loading="lazy"
      />
    `;
  }
}

// ============================================================================
// EXAMPLE 2: Responsive Image with srcset
// ============================================================================

export class ResponsiveR2Image {
  constructor(galleryName, imageName) {
    this.galleryName = galleryName;
    this.imageName = imageName;
  }
  
  render() {
    const urls = R2Helper.getPhotoUrlSet(this.galleryName, this.imageName);
    const srcset = R2Helper.getPhotoSrcSet(this.galleryName, this.imageName);
    
    return `
      <img 
        src="${urls.web}"
        srcset="${srcset}"
        sizes="(max-width: 600px) 300px, (max-width: 1200px) 1200px, 2400px"
        alt="${this.imageName}"
        loading="lazy"
      />
    `;
  }
}

// ============================================================================
// EXAMPLE 3: Gallery Component with Manifest Loading
// ============================================================================

export class R2GalleryComponent {
  constructor(galleryName) {
    this.galleryName = galleryName;
    this.manifest = null;
    this.images = [];
  }
  
  async loadManifest() {
    try {
      this.manifest = await R2Helper.fetchGalleryManifest(this.galleryName);
      this.images = this.manifest.images || [];
      return true;
    } catch (error) {
      console.error('Failed to load gallery:', error);
      return false;
    }
  }
  
  render() {
    if (!this.images.length) {
      return '<div class="gallery-loading">Loading gallery...</div>';
    }
    
    const imageHtml = this.images.map(img => `
      <div class="gallery-item" data-image-id="${img.id}">
        <img 
          src="${img.urls.thumb}" 
          data-web="${img.urls.web}"
          data-zoom="${img.urls.zoom}"
          alt="${img.filename}"
          loading="lazy"
        />
      </div>
    `).join('');
    
    return `
      <div class="r2-gallery" data-gallery="${this.galleryName}">
        <div class="gallery-grid">
          ${imageHtml}
        </div>
      </div>
    `;
  }
}

// ============================================================================
// EXAMPLE 4: Converting Existing Photo Gallery Section to R2
// ============================================================================

/**
 * Before: Gallery using local paths
 * 
 * const imagePath = `./art/Photos/FILM/Life1/web/${imageName}`;
 * 
 * After: Gallery using R2
 */

export class ModernizedGallerySection {
  constructor(config) {
    this.galleryName = config.galleryName || 'life1';
    this.useR2 = config.useR2 !== false; // Default to true
  }
  
  getImageUrl(imageName, size = 'web') {
    if (this.useR2) {
      return R2Helper.getPhotoUrl(this.galleryName, imageName, size);
    } else {
      // Fallback to local paths
      return `./art/Photos/FILM/${this.galleryName}/${size}/${imageName}`;
    }
  }
  
  renderImage(imageName) {
    const thumbUrl = this.getImageUrl(imageName, 'thumbs');
    const webUrl = this.getImageUrl(imageName, 'web');
    const zoomUrl = this.getImageUrl(imageName, 'zoom');
    
    return `
      <div class="photo-item">
        <img 
          src="${thumbUrl}" 
          data-web="${webUrl}"
          data-zoom="${zoomUrl}"
          alt="${imageName}"
          loading="lazy"
        />
      </div>
    `;
  }
}

// ============================================================================
// EXAMPLE 5: Preloading Gallery Images for Better UX
// ============================================================================

export class PreloadingGallery {
  constructor(galleryName) {
    this.galleryName = galleryName;
    this.manifest = null;
  }
  
  async init() {
    // Load manifest
    this.manifest = await R2Helper.fetchGalleryManifest(this.galleryName);
    
    // Preload first few thumbnails
    const firstImages = this.manifest.images.slice(0, 6);
    const thumbUrls = firstImages.map(img => img.urls.thumb);
    
    const results = await R2Helper.preloadImages(thumbUrls);
    
    const successCount = results.filter(r => r.success).length;
    window.debugLog('INIT', `Preloaded ${successCount}/${thumbUrls.length} thumbnails`);
  }
}

// ============================================================================
// EXAMPLE 6: Migrating Existing Section Code
// ============================================================================

/**
 * Step-by-step migration guide:
 * 
 * 1. Import R2Helper
 *    import R2Helper from './shared/r2-url-helper.js';
 * 
 * 2. Replace hardcoded paths with R2Helper calls
 *    OLD: const url = `./art/Photos/Life1/web/${imageName}`;
 *    NEW: const url = R2Helper.getPhotoUrl('life1', imageName, 'web');
 * 
 * 3. Use manifests instead of hardcoded image lists
 *    OLD: const images = ['img1.jpg', 'img2.jpg', ...];
 *    NEW: const manifest = await R2Helper.fetchGalleryManifest('life1');
 *         const images = manifest.images;
 * 
 * 4. Add fallback configuration for local development
 *    R2Helper.configureR2({
 *      useFallback: true,  // During migration/testing
 *      localBasePath: './art'
 *    });
 * 
 * 5. Test with both R2 and local paths
 * 
 * 6. Deploy and switch to R2 URLs
 *    R2Helper.configureR2({ useFallback: false });
 */

// ============================================================================
// EXAMPLE 7: Configuration for Development vs Production
// ============================================================================

export function configureR2ForEnvironment() {
  const isDevelopment = window.location.hostname === 'localhost' 
                     || window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // Use local paths during development
    R2Helper.configureR2({
      useFallback: true,
      localBasePath: './art',
    });
    window.debugLog('INIT', 'R2 Helper: Using local fallback paths');
  } else {
    // Use R2 in production
    R2Helper.configureR2({
      useFallback: false,
      baseUrl: 'https://media.einoder.net',
    });
    window.debugLog('INIT', 'R2 Helper: Using Cloudflare R2');
  }
}

// ============================================================================
// EXAMPLE 8: Health Check on App Init
// ============================================================================

export async function initR2() {
  const isHealthy = await R2Helper.checkR2Health();
  
  if (!isHealthy) {
    console.warn('R2 health check failed, falling back to local paths');
    R2Helper.configureR2({ useFallback: true });
  } else {
    window.debugLog('INIT', '✓ R2 is healthy and accessible');
  }
}

// ============================================================================
// EXAMPLE 9: Integration with Existing ComponentLibrary
// ============================================================================

/**
 * Add R2-aware image block to ComponentLibrary:
 * 
 * In component-library.js, add:
 * 
 * import R2Helper from './r2-url-helper.js';
 * 
 * class R2ImageBlock extends BaseComponent {
 *   constructor(config) {
 *     super(config);
 *     this.galleryName = config.galleryName;
 *     this.imageName = config.imageName;
 *     this.size = config.size || 'web';
 *   }
 *   
 *   render() {
 *     const url = R2Helper.getPhotoUrl(
 *       this.galleryName, 
 *       this.imageName, 
 *       this.size
 *     );
 *     
 *     this.element.innerHTML = `
 *       <img src="${url}" alt="${this.imageName}" />
 *     `;
 *   }
 * }
 * 
 * export const ComponentLibrary = {
 *   // ... existing components ...
 *   R2ImageBlock,
 * };
 */

// ============================================================================
// EXAMPLE 10: JSON Page Definition with R2
// ============================================================================

/**
 * Example page JSON using R2 images:
 * 
 * {
 *   "header": "Photo Gallery",
 *   "subheader": "Life in Film",
 *   "url": "/photos/life1",
 *   "blocks": [
 *     {
 *       "type": "R2Gallery",
 *       "props": {
 *         "galleryName": "life1",
 *         "layout": "grid"
 *       }
 *     },
 *     {
 *       "type": "R2ImageBlock",
 *       "props": {
 *         "galleryName": "life1",
 *         "imageName": "237040610016.jpg",
 *         "size": "web"
 *       }
 *     }
 *   ]
 * }
 */

export default {
  R2ImageComponent,
  ResponsiveR2Image,
  R2GalleryComponent,
  ModernizedGallerySection,
  PreloadingGallery,
  configureR2ForEnvironment,
  initR2,
};

