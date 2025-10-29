/**
 * MediaAssetManager - SiteBoy Framework
 * 
 * Dual-mode asset management: local dev → cloud production
 * Automatically switches between local files and cloud CDN based on environment
 * 
 * @version 1.0.0
 * @architecture Single Source of Truth for all media paths
 */

class MediaAssetManager {
    constructor() {
        this.isLocalDev = this.detectLocalEnvironment();
        this.manifest = null;
        this.baseUrl = '';
        this.fallbackToLocal = false;
        this.initialized = false;
    }
    
    /**
     * Detect if running in local development environment
     * @returns {boolean} True if localhost/local IP
     */
    detectLocalEnvironment() {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || 
                       hostname === '127.0.0.1' || 
                       hostname.startsWith('192.168.') ||
                       hostname.startsWith('10.0.') ||
                       hostname === '';  // File protocol
        
        console.log(`🔍 Environment detection: ${hostname} → ${isLocal ? 'LOCAL' : 'PRODUCTION'}`);
        return isLocal;
    }
    
    /**
     * Initialize asset manager (load manifest in production)
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        
        if (this.isLocalDev) {
            console.log('📂 Local development mode - using local assets');
            console.log('   All media paths will resolve to local files');
            this.initialized = true;
            return;
        }
        
        // Production: Load manifest
        console.log('☁️ Production mode - loading media manifest...');
        
        try {
            const response = await fetch('/assets/media-manifest.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            this.manifest = await response.json();
            this.baseUrl = this.manifest.baseUrl;
            
            console.log(`✅ Media manifest loaded`);
            console.log(`   Provider: ${this.manifest.cloudProvider}`);
            console.log(`   Base URL: ${this.baseUrl}`);
            console.log(`   Assets: ${this.manifest.totalAssets || Object.keys(this.manifest.assets).length}`);
            
        } catch (err) {
            console.warn('⚠️ Failed to load media manifest:', err.message);
            console.warn('   Falling back to local asset paths');
            this.fallbackToLocal = true;
        }
        
        this.initialized = true;
    }
    
    /**
     * Resolve asset path: local → cloud (if in production)
     * 
     * @param {string} localPath - Local file path (e.g., 'art/Photos/FILM/Life1/photo.jpg')
     * @param {string} size - Size variant: 'thumb', 'display', 'full' (default: 'display')
     * @returns {string} Resolved path (local or cloud URL)
     * 
     * @example
     * // Local dev:  '/art/Photos/FILM/Life1/photo.jpg'
     * // Production: 'https://cdn.yourdomain.com/art/photos/film/life1/photo-display.jpg'
     */
    resolveAssetPath(localPath, size = 'display') {
        // Always use local in dev mode or if manifest failed to load
        if (this.isLocalDev || this.fallbackToLocal) {
            return this.normalizeLocalPath(localPath);
        }
        
        // Production: Look up in manifest
        if (this.manifest && this.manifest.assets && this.manifest.assets[localPath]) {
            const asset = this.manifest.assets[localPath];
            
            // Return specific size if available
            if (asset.sizes && asset.sizes[size]) {
                return `${this.baseUrl}/${asset.sizes[size]}`;
            }
            
            // Fallback to cloudPath
            if (asset.cloudPath) {
                return `${this.baseUrl}/${asset.cloudPath}`;
            }
        }
        
        // Fallback: construct URL from local path (best guess)
        console.warn(`⚠️ Asset not in manifest: ${localPath}`);
        const cloudPath = localPath.toLowerCase().replace(/\s+/g, '-');
        return `${this.baseUrl}/${cloudPath}`;
    }
    
    /**
     * Batch resolve multiple asset paths
     * @param {string[]} localPaths - Array of local paths
     * @param {string} size - Size variant
     * @returns {string[]} Array of resolved paths
     */
    resolveAssetPaths(localPaths, size = 'display') {
        return localPaths.map(path => this.resolveAssetPath(path, size));
    }
    
    /**
     * Resolve asset with multiple size variants
     * @param {string} localPath - Local file path
     * @returns {Object} Object with thumb, display, full URLs
     * 
     * @example
     * {
     *   thumb: 'https://cdn.../photo-thumb.jpg',
     *   display: 'https://cdn.../photo-display.jpg',
     *   full: 'https://cdn.../photo.jpg'
     * }
     */
    resolveAssetSizes(localPath) {
        return {
            thumb: this.resolveAssetPath(localPath, 'thumb'),
            display: this.resolveAssetPath(localPath, 'display'),
            full: this.resolveAssetPath(localPath, 'full')
        };
    }
    
    /**
     * Get asset metadata (dimensions, size, etc.)
     * @param {string} localPath - Local file path
     * @returns {Object|null} Metadata object or null
     */
    getAssetMetadata(localPath) {
        if (this.manifest && this.manifest.assets && this.manifest.assets[localPath]) {
            return this.manifest.assets[localPath].metadata;
        }
        return null;
    }
    
    /**
     * Check if asset exists in manifest
     * @param {string} localPath - Local file path
     * @returns {boolean}
     */
    hasAsset(localPath) {
        if (!this.manifest || !this.manifest.assets) {
            return false;
        }
        return localPath in this.manifest.assets;
    }
    
    /**
     * Normalize local path (ensure leading slash, forward slashes)
     * @param {string} path - Path to normalize
     * @returns {string} Normalized path
     * @private
     */
    normalizeLocalPath(path) {
        // Ensure forward slashes
        path = path.replace(/\\/g, '/');
        
        // Ensure leading slash for absolute paths
        if (!path.startsWith('/') && !path.startsWith('http')) {
            path = '/' + path;
        }
        
        return path;
    }
    
    /**
     * Get all assets for a directory
     * @param {string} directory - Directory path (e.g., 'art/Photos/FILM/Life1')
     * @returns {string[]} Array of asset paths
     */
    getAssetsInDirectory(directory) {
        if (!this.manifest || !this.manifest.assets) {
            return [];
        }
        
        // Normalize directory path
        directory = directory.replace(/\\/g, '/').replace(/^\//, '').replace(/\/$/, '');
        
        return Object.keys(this.manifest.assets)
            .filter(path => path.startsWith(directory + '/'));
    }
    
    /**
     * Get statistics about loaded assets
     * @returns {Object} Stats object
     */
    getStats() {
        if (!this.manifest || !this.manifest.assets) {
            return {
                mode: this.isLocalDev ? 'local' : 'production',
                manifestLoaded: false,
                totalAssets: 0
            };
        }
        
        const assets = Object.values(this.manifest.assets);
        const totalSize = assets.reduce((sum, asset) => sum + (asset.metadata?.size || 0), 0);
        
        return {
            mode: this.isLocalDev ? 'local' : 'production',
            manifestLoaded: true,
            totalAssets: assets.length,
            totalSizeGB: (totalSize / (1024**3)).toFixed(2),
            provider: this.manifest.cloudProvider,
            version: this.manifest.version
        };
    }
    
    /**
     * Debug info (useful for troubleshooting)
     */
    debug() {
        console.group('🔍 MediaAssetManager Debug Info');
        console.log('Mode:', this.isLocalDev ? 'LOCAL DEV' : 'PRODUCTION');
        console.log('Initialized:', this.initialized);
        console.log('Manifest loaded:', !!this.manifest);
        console.log('Fallback to local:', this.fallbackToLocal);
        console.log('Base URL:', this.baseUrl || 'N/A');
        
        if (this.manifest) {
            console.log('Total assets:', Object.keys(this.manifest.assets).length);
            console.log('Provider:', this.manifest.cloudProvider);
        }
        
        console.groupEnd();
    }
}

// Create global singleton instance
window.MediaAssetManager = new MediaAssetManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MediaAssetManager;
}

console.log('✅ MediaAssetManager loaded');

