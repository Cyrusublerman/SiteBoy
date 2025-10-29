/**
 * R2 URL Helper
 * Utility for generating Cloudflare R2 URLs for media assets.
 * Provides consistent URL generation across all SiteBoy components.
 */

const R2Config = {
  baseUrl: 'https://media.einoder.net',
  bucketName: 'assetts-einoder',
  
  // Fallback to local paths during development
  useFallback: false,
  localBasePath: './art',
};

/**
 * Generate R2 URL for a photo gallery image.
 * 
 * @param {string} galleryName - Gallery name (e.g., 'life1', 'morocco')
 * @param {string} imageName - Image filename
 * @param {string} size - Size variant: 'thumbs', 'web', 'zoom', 'originals'
 * @returns {string} Full URL to image
 */
export function getPhotoUrl(galleryName, imageName, size = 'web') {
  if (R2Config.useFallback) {
    return `${R2Config.localBasePath}/Photos/FILM/${galleryName}/${size}/${imageName}`;
  }
  
  return `${R2Config.baseUrl}/art/photos/${galleryName}/${size}/${imageName}`;
}

/**
 * Generate R2 URL for digital art.
 * 
 * @param {string} category - Category: 'illustration', 'portrait', 'poster', etc.
 * @param {string} imageName - Image filename
 * @returns {string} Full URL to image
 */
export function getArtUrl(category, imageName) {
  if (R2Config.useFallback) {
    return `${R2Config.localBasePath}/Digital/${category}/${imageName}`;
  }
  
  return `${R2Config.baseUrl}/art/digital/${category}/${imageName}`;
}

/**
 * Generate R2 URL for project assets.
 * 
 * @param {string} projectName - Project name (kebab-case)
 * @param {string} assetPath - Path to asset within project
 * @returns {string} Full URL to asset
 */
export function getProjectUrl(projectName, assetPath) {
  if (R2Config.useFallback) {
    return `${R2Config.localBasePath}/../projects/${projectName}/${assetPath}`;
  }
  
  return `${R2Config.baseUrl}/projects/${projectName}/${assetPath}`;
}

/**
 * Fetch and parse gallery manifest from R2.
 * 
 * @param {string} galleryName - Gallery name
 * @returns {Promise<Object>} Gallery manifest object
 */
export async function fetchGalleryManifest(galleryName) {
  const manifestUrl = `${R2Config.baseUrl}/art/photos/${galleryName}/manifest.json`;
  
  try {
    const response = await fetch(manifestUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to load gallery manifest: ${galleryName}`, error);
    throw error;
  }
}

/**
 * Get all available photo URLs for an image.
 * 
 * @param {string} galleryName - Gallery name
 * @param {string} imageName - Image filename
 * @returns {Object} Object with all size variants
 */
export function getPhotoUrlSet(galleryName, imageName) {
  return {
    thumb: getPhotoUrl(galleryName, imageName, 'thumbs'),
    web: getPhotoUrl(galleryName, imageName, 'web'),
    zoom: getPhotoUrl(galleryName, imageName, 'zoom'),
    original: getPhotoUrl(galleryName, imageName, 'originals'),
  };
}

/**
 * Generate srcset attribute for responsive images.
 * 
 * @param {string} galleryName - Gallery name
 * @param {string} imageName - Image filename
 * @returns {string} srcset attribute value
 */
export function getPhotoSrcSet(galleryName, imageName) {
  const urls = getPhotoUrlSet(galleryName, imageName);
  
  // Approximate widths based on processing script
  return [
    `${urls.thumb} 300w`,
    `${urls.web} 1200w`,
    `${urls.zoom} 2400w`,
  ].join(', ');
}

/**
 * Configure R2 helper settings.
 * 
 * @param {Object} config - Configuration options
 * @param {string} config.baseUrl - R2 public URL
 * @param {boolean} config.useFallback - Use local fallback paths
 * @param {string} config.localBasePath - Local base path for fallback
 */
export function configureR2(config) {
  Object.assign(R2Config, config);
}

/**
 * Get current R2 configuration.
 * 
 * @returns {Object} Current configuration
 */
export function getR2Config() {
  return { ...R2Config };
}

/**
 * Check if R2 is accessible (health check).
 * 
 * @returns {Promise<boolean>} True if R2 is accessible
 */
export async function checkR2Health() {
  try {
    const response = await fetch(`${R2Config.baseUrl}/health-check.txt`, {
      method: 'HEAD',
      cache: 'no-store',
    });
    
    return response.ok || response.status === 404; // 404 is ok, means R2 is reachable
  } catch (error) {
    console.warn('R2 health check failed:', error);
    return false;
  }
}

/**
 * Batch preload images for better performance.
 * 
 * @param {Array<string>} urls - Array of image URLs to preload
 * @returns {Promise<Array>} Array of load results
 */
export function preloadImages(urls) {
  return Promise.all(
    urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ url, success: true });
        img.onerror = () => resolve({ url, success: false });
        img.src = url;
      });
    })
  );
}

/**
 * Get optimized image URL with transformations (if using Cloudflare Images).
 * For now, just returns the regular URL, but can be extended.
 * 
 * @param {string} url - Original image URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.fit - Fit mode: 'scale-down', 'contain', 'cover', 'crop', 'pad'
 * @param {string} options.format - Output format: 'auto', 'webp', 'avif', 'jpeg', 'png'
 * @returns {string} Transformed image URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  // For now, just return the original URL
  // In the future, could integrate Cloudflare Image Resizing:
  // https://developers.cloudflare.com/images/image-resizing/
  
  // Example with Image Resizing (when enabled):
  // const params = new URLSearchParams();
  // if (options.width) params.set('width', options.width);
  // if (options.height) params.set('height', options.height);
  // if (options.fit) params.set('fit', options.fit);
  // if (options.format) params.set('format', options.format);
  // 
  // return `/cdn-cgi/image/${params.toString()}/${url}`;
  
  return url;
}

export default {
  getPhotoUrl,
  getArtUrl,
  getProjectUrl,
  fetchGalleryManifest,
  getPhotoUrlSet,
  getPhotoSrcSet,
  configureR2,
  getR2Config,
  checkR2Health,
  preloadImages,
  getOptimizedImageUrl,
};

