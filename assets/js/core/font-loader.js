/**
 * Font Loading & Detection Utility
 * 
 * ARCHITECTURE EXCEPTION: This module is explicitly permitted to use DOM operations
 * for font loading and detection. All operations are off-screen/measurement only.
 * 
 * Permitted operations:
 * - document.createElement('canvas') for measurement
 * - document.createElement('link') for Google Fonts
 * - document.head.appendChild() for font injection
 * 
 * @module core/font-loader
 */

/**
 * Comprehensive font list to test (fallback if API unavailable)
 * Expanded to cover most common system fonts across platforms
 */
const COMMON_FONTS = [
    // ═══════════════════════════════════════════════════════════════
    // MONOSPACE (most important for ASCII art)
    // ═══════════════════════════════════════════════════════════════
    'Courier New', 'Courier', 'Consolas', 'Monaco', 'Menlo', 
    'Lucida Console', 'DejaVu Sans Mono', 'Liberation Mono',
    'Andale Mono', 'Ubuntu Mono', 'Droid Sans Mono', 'Fira Mono',
    'Source Code Pro', 'Roboto Mono', 'IBM Plex Mono', 'Inconsolata',
    'SF Mono', 'Cascadia Code', 'JetBrains Mono', 'Hack',
    
    // ═══════════════════════════════════════════════════════════════
    // SANS-SERIF
    // ═══════════════════════════════════════════════════════════════
    'Arial', 'Helvetica', 'Helvetica Neue', 'Verdana', 'Tahoma', 
    'Trebuchet MS', 'Arial Black', 'Impact', 'Gill Sans', 'Geneva',
    'Calibri', 'Candara', 'Segoe UI', 'Roboto', 'Open Sans',
    'Lato', 'Montserrat', 'Source Sans Pro', 'Raleway', 'Ubuntu',
    'PT Sans', 'Noto Sans', 'Droid Sans', 'Fira Sans', 'Nunito',
    'Franklin Gothic Medium', 'Century Gothic', 'Futura', 'Optima',
    
    // ═══════════════════════════════════════════════════════════════
    // SERIF
    // ═══════════════════════════════════════════════════════════════
    'Times New Roman', 'Times', 'Georgia', 'Palatino', 'Garamond',
    'Bookman', 'Baskerville', 'Didot', 'Bodoni', 'Cambria',
    'Constantia', 'Hoefler Text', 'Perpetua', 'Rockwell',
    'Courier', 'New Century Schoolbook', 'Goudy Old Style',
    'Palatino Linotype', 'Book Antiqua', 'Bembo', 'Caslon',
    
    // ═══════════════════════════════════════════════════════════════
    // DISPLAY/DECORATIVE
    // ═══════════════════════════════════════════════════════════════
    'Comic Sans MS', 'Papyrus', 'Brush Script MT', 'Copperplate',
    'Marker Felt', 'Chalkboard', 'Signpainter', 'Trattatello',
    'Bradley Hand', 'Luminari', 'Snell Roundhand', 'Zapfino',
    'American Typewriter', 'Herculanum', 'Hobo Std', 'Stencil',
    
    // ═══════════════════════════════════════════════════════════════
    // SYMBOL/SPECIALTY
    // ═══════════════════════════════════════════════════════════════
    'Wingdings', 'Wingdings 2', 'Wingdings 3', 'Webdings', 'Symbol',
    'Zapf Dingbats', 'Marlett', 'MT Extra',
    
    // ═══════════════════════════════════════════════════════════════
    // SYSTEM FONTS (macOS)
    // ═══════════════════════════════════════════════════════════════
    'San Francisco', 'SF Pro Display', 'SF Pro Text', 'New York',
    'Apple Chancery', 'Apple Symbols', 'Apple Color Emoji',
    
    // ═══════════════════════════════════════════════════════════════
    // SYSTEM FONTS (Windows)
    // ═══════════════════════════════════════════════════════════════
    'Segoe UI', 'Segoe UI Symbol', 'Segoe UI Emoji', 'MS Gothic',
    'MS Mincho', 'Yu Gothic', 'Meiryo', 'Malgun Gothic',
    
    // ═══════════════════════════════════════════════════════════════
    // LINUX FONTS
    // ═══════════════════════════════════════════════════════════════
    'DejaVu Sans', 'DejaVu Serif', 'Liberation Sans', 'Liberation Serif',
    'Noto Sans', 'Noto Serif', 'Ubuntu', 'Cantarell', 'Droid Sans',
    
    // Site default
    'Atkinson Hyperlegible'
];

/**
 * Measure font width for detection
 * @private
 */
function measureFontWidth(ctx, fontFamily) {
    ctx.font = `14px ${fontFamily}`;
    // Use string with varied widths
    return ctx.measureText('mmmmmmmmmmlli').width;
}

/**
 * Detect available system fonts
 * 
 * Uses modern Font Access API if available, falls back to canvas measurement.
 * 
 * @returns {Promise<string[]>} Sorted array of available font family names
 */
export async function detectSystemFonts() {
    window.debugLog('INIT', 'Detecting available system fonts...');
    
    // Try modern Font Access API first (returns ALL fonts, no limit)
    if ('queryLocalFonts' in window) {
        try {
            const fonts = await window.queryLocalFonts();
            const fontFamilies = [...new Set(fonts.map(f => f.family))].sort();
            window.debugLog('INIT', `Font Access API: ${fontFamilies.length} fonts detected`);
            return fontFamilies;
        } catch (err) {
            window.debugLog('INIT', 'Font Access API failed, using fallback detection');
        }
    }
    
    // Fallback: Test comprehensive font list (100+ fonts)
    window.debugLog('INIT', `Testing ${COMMON_FONTS.length} common fonts...`);
    
    const available = [];
    
    // ARCHITECTURE EXCEPTION: Off-screen canvas for measurement only
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Baseline measurements with fallback fonts
    const baselines = {
        monospace: measureFontWidth(ctx, 'monospace'),
        serif: measureFontWidth(ctx, 'serif'),
        sansSerif: measureFontWidth(ctx, 'sans-serif')
    };
    
    // Test all fonts in parallel batches for speed
    const batchSize = 10;
    for (let i = 0; i < COMMON_FONTS.length; i += batchSize) {
        const batch = COMMON_FONTS.slice(i, i + batchSize);
        
        for (const font of batch) {
            // Determine appropriate fallback
            const testGeneric = 
                font.includes('Mono') || font.includes('Courier') || font.includes('Console') ? 'monospace' :
                font.includes('Times') || font.includes('Georgia') || font.includes('Serif') ? 'serif' :
                'sans-serif';
            
            const withFont = measureFontWidth(ctx, `"${font}", ${testGeneric}`);
            const baseline = baselines[testGeneric];
            
            // If width differs from baseline, font is available
            if (Math.abs(withFont - baseline) > 0.1) {
                available.push(font);
            }
        }
        
        // Yield to browser between batches (prevent UI freeze)
        if (i + batchSize < COMMON_FONTS.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    window.debugLog('INIT', `Fallback detection: ${available.length} fonts detected`);
    return available.sort();
}

/**
 * Load Google Font dynamically
 * 
 * @param {string} fontName - Font family name (e.g., "Roboto Mono")
 * @returns {Promise<string>} Resolves with font name when loaded
 * @throws {Error} If font fails to load or is not available
 */
export async function loadGoogleFont(fontName) {
    if (!fontName || fontName.trim() === '') {
        throw new Error('Font name required');
    }
    
    window.debugLog('TOOLS', `Loading Google Font: ${fontName}`);
    
    // ARCHITECTURE EXCEPTION: Font loading requires link injection
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    
    return new Promise((resolve, reject) => {
        link.onload = () => {
            // Verify font loaded by testing render
            // ARCHITECTURE EXCEPTION: Off-screen canvas for verification
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            ctx.font = `14px "${fontName}", sans-serif`;
            const withFont = ctx.measureText('test').width;
            
            ctx.font = '14px sans-serif';
            const withoutFont = ctx.measureText('test').width;
            
            if (Math.abs(withFont - withoutFont) > 0.1) {
                window.debugLog('TOOLS', `✅ Google Font loaded: ${fontName}`);
                resolve(fontName);
            } else {
                reject(new Error(`Font "${fontName}" may not be available on Google Fonts`));
            }
        };
        
        link.onerror = () => {
            reject(new Error(`Failed to load Google Font: ${fontName}`));
        };
        
        document.head.appendChild(link);
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Font load timeout')), 10000);
    });
}

/**
 * Check if a font is monospace by testing character widths
 * 
 * @param {string} font - Font family name
 * @param {number} fontSize - Font size in pixels
 * @returns {boolean} True if font is monospace
 */
export function isMonospaceFont(font, fontSize) {
    // ARCHITECTURE EXCEPTION: Off-screen canvas for measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px "${font}", monospace`;
    
    // Test various character widths
    const widths = ['i', 'l', 'm', 'W', '@'].map(char => ctx.measureText(char).width);
    
    // If all widths are similar (within 1px tolerance), it's monospace
    const maxWidth = Math.max(...widths);
    const minWidth = Math.min(...widths);
    
    return (maxWidth - minWidth) <= 1;
}

/**
 * Filter font list to only monospace fonts
 * 
 * @param {string[]} fontList - Array of font family names
 * @returns {string[]} Filtered array of monospace fonts
 */
export function getMonospaceFonts(fontList) {
    return fontList.filter(font => isMonospaceFont(font, 14));
}

/**
 * Measure exact pixel dimensions of a character in given font
 * Returns actual rendered dimensions for pixel-perfect mapping
 * 
 * @param {string} font - Font family name
 * @param {number} fontSize - Font size in pixels
 * @returns {{width: number, height: number, baseline: number}}
 */
export function measureCharacterMetrics(font, fontSize) {
    // ARCHITECTURE EXCEPTION: Off-screen canvas for measurement
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Render a dense character to get maximum bounds
    ctx.font = `${fontSize}px "${font}", monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    
    // Measure multiple characters to ensure we get true monospace dimensions
    const testChars = ['M', 'W', '@', '#', 'i', 'l', '|'];
    let maxWidth = 0;
    let maxHeight = 0;
    
    for (const char of testChars) {
        const metrics = ctx.measureText(char);
        const width = Math.ceil(metrics.width);
        
        // Height estimation (approximation for monospace)
        const height = Math.ceil(fontSize * 1.2); // Typical monospace ratio
        
        maxWidth = Math.max(maxWidth, width);
        maxHeight = Math.max(maxHeight, height);
    }
    
    // Ensure we have valid dimensions
    const charWidth = Math.max(1, Math.ceil(maxWidth));
    const charHeight = Math.max(1, Math.ceil(maxHeight));
    
    window.debugLog('TOOLS', `Character metrics: ${charWidth}×${charHeight}px (font: ${font}, size: ${fontSize})`);
    
    return {
        width: charWidth,
        height: charHeight,
        baseline: Math.ceil(fontSize * 0.8) // Approximate baseline position
    };
}

export default {
    detectSystemFonts,
    loadGoogleFont,
    isMonospaceFont,
    getMonospaceFonts,
    measureCharacterMetrics
};

