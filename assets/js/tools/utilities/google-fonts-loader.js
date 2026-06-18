/**
 * Google Fonts Loader - SiteBoy Framework
 * 
 * Dynamic Google Fonts loading utility for font analysis tools
 * Handles on-demand font loading with proper fallbacks and error handling
 * 
 * @version 1.0.0
 * @dependencies None (vanilla JavaScript)
 */

class GoogleFontsLoader {
    constructor() {
        this.loadedFonts = new Set();
        this.loadingPromises = new Map();
        this.baseUrl = 'https://fonts.googleapis.com/css2';
        this.fallbackFonts = [
            'Space Mono',
            'Atkinson Hyperlegible',
            'Atkinson Hyperlegible Mono'
        ];
    }

    /**
     * Load a Google Font dynamically
     * @param {string} fontFamily - The font family name (e.g. 'Roboto', 'Open Sans')
     * @param {Array} weights - Array of weights to load (e.g. ['400', '700'])
     * @param {Array} styles - Array of styles to load (e.g. ['normal', 'italic'])
     * @returns {Promise} - Resolves when font is loaded
     */
    async loadFont(fontFamily, weights = ['400'], styles = ['normal']) {
        const fontKey = this.createFontKey(fontFamily, weights, styles);
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(fontKey)) {
            return this.loadingPromises.get(fontKey);
        }
        
        // Return immediately if already loaded
        if (this.loadedFonts.has(fontKey)) {
            return Promise.resolve(fontFamily);
        }

        const loadPromise = this.performFontLoad(fontFamily, weights, styles);
        this.loadingPromises.set(fontKey, loadPromise);
        
        return loadPromise;
    }

    /**
     * Get list of popular Google Fonts for the font selector
     * @returns {Array} - Array of font family names
     */
    getPopularFonts() {
        return [
            // Monospace fonts (ideal for coding/analysis)
            'Atkinson Hyperlegible',
            'Roboto Mono',
            'Source Code Pro',
            'JetBrains Mono',
            'Fira Code',
            'Ubuntu Mono',
            'Inconsolata',
            'Noto Sans Mono',
            
            // Sans-serif fonts
            'Roboto',
            'Open Sans',
            'Lato',
            'Montserrat',
            'Nunito',
            'Poppins',
            'Inter',
            'Playfair Display',
            'Merriweather',
            
            // Serif fonts
            'Playfair Display',
            'Merriweather',
            'Crimson Text',
            'Libre Baskerville',
            'Lora',
            'PT Serif',
            
            // Display fonts
            'Oswald',
            'Raleway',
            'Bebas Neue',
            'Pacifico',
            'Dancing Script'
        ];
    }

    /**
     * Check if a font is available (either loaded or system font)
     * @param {string} fontFamily - The font family name
     * @returns {boolean} - True if font is available
     */
    isFontAvailable(fontFamily) {
        // Check if it's a fallback font (always available)
        if (this.fallbackFonts.includes(fontFamily)) {
            return true;
        }

        // Check if we've loaded it
        const fontKey = this.createFontKey(fontFamily);
        if (this.loadedFonts.has(fontKey)) {
            return true;
        }

        // Test if font is actually available using canvas
        return this.testFontAvailability(fontFamily);
    }

    /**
     * Get the font display name for UI
     * @param {string} fontFamily - The font family name
     * @returns {string} - Display-friendly name
     */
    getFontDisplayName(fontFamily) {
        // Handle special cases
        if (fontFamily === 'Atkinson Hyperlegible Mono') {
            return 'Atkinson Hyperlegible Mono (System)';
        }
        if (fontFamily === 'Space Mono') {
            return 'Space Mono (System)';
        }
        
        return fontFamily;
    }

    /**
     * Create a unique key for font tracking
     * @private
     */
    createFontKey(fontFamily, weights = ['400'], styles = ['normal']) {
        return `${fontFamily}:${weights.join(',')}:${styles.join(',')}`;
    }

    /**
     * Perform the actual font loading
     * @private
     */
    async performFontLoad(fontFamily, weights, styles) {
        try {
            // Create Google Fonts URL
            const url = this.buildGoogleFontsUrl(fontFamily, weights, styles);
            
            // Load the CSS
            await this.loadFontCSS(url);
            
            // Wait for font to be available
            await this.waitForFontLoad(fontFamily);
            
            // Mark as loaded
            const fontKey = this.createFontKey(fontFamily, weights, styles);
            this.loadedFonts.add(fontKey);
            this.loadingPromises.delete(fontKey);
            
            window.debugLog('TOOLS', `✅ Google Font loaded: ${fontFamily}`);
            return fontFamily;
            
        } catch (error) {
            console.warn(`❌ Failed to load Google Font: ${fontFamily}`, error);
            const fontKey = this.createFontKey(fontFamily, weights, styles);
            this.loadingPromises.delete(fontKey);
            
            // Return a fallback font
            return this.fallbackFonts[0];
        }
    }

    /**
     * Build Google Fonts URL
     * @private
     */
    buildGoogleFontsUrl(fontFamily, weights, styles) {
        const params = new URLSearchParams();
        
        // Build family parameter
        let familyParam = fontFamily.replace(/ /g, '+');
        
        // Add weights and styles
        if (weights.length > 0 || styles.includes('italic')) {
            const variants = [];
            
            styles.forEach(style => {
                weights.forEach(weight => {
                    if (style === 'italic') {
                        variants.push(`1,${weight}`);
                    } else {
                        variants.push(`0,${weight}`);
                    }
                });
            });
            
            familyParam += ':ital,wght@' + variants.join(';');
        }
        
        params.set('family', familyParam);
        params.set('display', 'swap');
        
        return `${this.baseUrl}?${params.toString()}`;
    }

    /**
     * Load font CSS into document
     * @private
     */
    loadFontCSS(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
            
            document.head.appendChild(link);
        });
    }

    /**
     * Wait for font to be loaded and available
     * @private
     */
    waitForFontLoad(fontFamily) {
        return new Promise((resolve, reject) => {
            // Use FontFace API if available
            if ('fonts' in document) {
                document.fonts.load(`12px "${fontFamily}"`).then(() => {
                    if (this.testFontAvailability(fontFamily)) {
                        resolve();
                    } else {
                        reject(new Error(`Font not available: ${fontFamily}`));
                    }
                }).catch(reject);
                return;
            }

            // Fallback: polling method
            const startTime = Date.now();
            const timeout = 5000; // 5 seconds
            
            const checkFont = () => {
                if (this.testFontAvailability(fontFamily)) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Font load timeout: ${fontFamily}`));
                } else {
                    setTimeout(checkFont, 100);
                }
            };
            
            checkFont();
        });
    }

    /**
     * Test if font is actually available using canvas
     * @private
     */
    testFontAvailability(fontFamily) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Test string that should render differently in different fonts
        const testString = 'mmmmmmmmmmlli';
        const testSize = 72;
        
        // Measure with fallback font
        ctx.font = `${testSize}px monospace`;
        const fallbackWidth = ctx.measureText(testString).width;
        
        // Measure with target font
        ctx.font = `${testSize}px "${fontFamily}", monospace`;
        const targetWidth = ctx.measureText(testString).width;
        
        // If widths are different, font is available
        return Math.abs(targetWidth - fallbackWidth) > 1;
    }

    /**
     * Clear all loaded fonts (useful for testing)
     */
    clearLoadedFonts() {
        this.loadedFonts.clear();
        this.loadingPromises.clear();
        
        // Remove all Google Fonts link elements
        const links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        links.forEach(link => {
            if (!link.href.includes('Atkinson+Hyperlegible+Mono')) {
                link.remove();
            }
        });
    }
}

// ES Module export
export { GoogleFontsLoader };

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.GoogleFontsLoader = GoogleFontsLoader;
    window.googleFontsLoader = new GoogleFontsLoader();

    window.debugLog('TOOLS', '🔤 Google Fonts Loader ready - Dynamic font loading available');
}

