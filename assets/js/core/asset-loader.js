/**
 * AssetLoader - Dynamic Script and Library Loading
 * 
 * Lazy loads tools, libraries, and sections on demand.
 * Caches loaded assets to prevent duplicate loading.
 * 
 * @version 1.0.0
 */

const AssetLoader = {
    version: '1.0.0',
    
    // Track loaded scripts to prevent duplicates
    loadedScripts: new Set(),
    loadingPromises: new Map(),
    
    // ═══════════════════════════════════════════════════════════════════════════
    // TOOL REGISTRY - Maps tool IDs to script paths
    // ═══════════════════════════════════════════════════════════════════════════
    
    toolRegistry: {
        // ═══════════════════════════════════════════════════════════════════
        // CORE - Infrastructure tools
        // ═══════════════════════════════════════════════════════════════════
        'tool-test': {
            script: '/assets/js/tools/core/tool-test-ui.js',
            className: 'ToolTestUI',
            dependencies: []
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // GENERATORS - Generative art tools
        // ═══════════════════════════════════════════════════════════════════
        'circles': {
            script: '/assets/js/tools/generators/circles-tool.js',
            className: 'CirclesTool',
            dependencies: []
        },
        'torus': {
            script: '/assets/js/tools/generators/torus-tool.js',
            className: 'TorusTool',
            dependencies: []
        },
        'harmonics': {
            script: '/assets/js/tools/generators/harmonics-tool.js',
            className: 'HarmonicsTool',
            dependencies: []
        },
        'lissajous': {
            script: '/assets/js/tools/generators/lissajous-tool.js',
            className: 'LissajousTool',
            dependencies: ['mathjs']
        },
        'squares': {
            script: '/assets/js/tools/generators/squares-tool.js',
            className: 'SquaresTool',
            dependencies: []
        },
        'cymatics': {
            script: '/assets/js/tools/generators/cymatics-tool.js',
            className: 'CymaticsTool',
            dependencies: []
        },
        'wave-interference': {
            script: '/assets/js/tools/generators/wave-interference-tool.js',
            className: 'WaveInterferenceTool',
            dependencies: ['mathjs']
        },
        'generative-pattern': {
            script: '/assets/js/tools/generators/generative-pattern.js',
            className: 'GenerativePatternTool',
            dependencies: []
        },
        'unified-pattern': {
            script: '/assets/js/tools/generators/unified-pattern.js',
            className: 'UnifiedPatternTool',
            dependencies: []
        },
        'moire-generator': {
            script: '/assets/js/tools/generators/moire-generator.js',
            className: 'MoireGeneratorTool',
            dependencies: []
        },
        'interference-figure': {
            script: '/assets/js/tools/generators/interference-figure.js',
            className: 'InterferenceFigureTool',
            dependencies: []
        },
        'ribbon-breeze': {
            script: '/assets/js/tools/generators/ribbon-breeze.js',
            className: 'RibbonBreezeTool',
            dependencies: []
        },
        'tile-mosaic': {
            script: '/assets/js/tools/generators/tile-mosaic.js',
            className: 'TileMosaicTool',
            dependencies: []
        },
        'wave-equation-synth': {
            script: '/assets/js/tools/generators/wave-equation-synth.js',
            className: 'WaveEquationSynthTool',
            dependencies: []
        },
        'clock': {
            script: '/assets/js/tools/generators/solar-system-tool.js',
            className: 'SolarSystemTool',
            dependencies: []
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // PROCESSORS - Image manipulation tools
        // ═══════════════════════════════════════════════════════════════════
        'ascii-art-generator': {
            script: '/assets/js/tools/processors/ascii-art-generator.js',
            className: 'AsciiArtGeneratorTool',
            dependencies: []
        },
        'smart-halftone': {
            script: '/assets/js/tools/processors/smart-halftone.js',
            className: 'SmartHalftoneTool',
            dependencies: []
        },
        'topographic-dot-halftone': {
            script: '/assets/js/tools/processors/topographic-dot-halftone.js',
            className: 'TopographicDotHalftoneTool',
            dependencies: []
        },
        'colour-quantizer': {
            script: '/assets/js/tools/processors/colour-quantizer-toolbase.js',
            className: 'ColourQuantizerTool',
            dependencies: []  // No algorithms dependency yet (will add when using algorithm library)
        },
        'pixel-tiler': {
            script: '/assets/js/tools/processors/pixel-tiler.js',
            className: 'PixelTiler',
            dependencies: []
        },
        'image23d': {
            script: '/assets/js/tools/processors/image23d.js',
            className: 'Image23DTool',
            dependencies: []
        },
        'p5-to-video': {
            script: '/assets/js/tools/processors/p5-to-video.js',
            className: 'P5ToVideoTool',
            dependencies: []
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // FABRICATION - Physical making tools
        // ═══════════════════════════════════════════════════════════════════
        'multifilament-print': {
            script: '/assets/js/tools/fabrication/multifilament-print-tool.js',
            className: 'MultifilamentPrintTool',
            dependencies: []
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // UTILITIES - Support tools
        // ═══════════════════════════════════════════════════════════════════
        'font-analysis': {
            script: '/assets/js/tools/utilities/font-analysis-tool.js',
            className: 'FontAnalysisTool',
            dependencies: ['google-fonts-loader']
        },
        'polygon-calculator': {
            script: '/assets/js/tools/utilities/polygon-calculator.js',
            className: 'PolygonCalculator',
            dependencies: []
        },
        'about-you': {
            script: '/assets/js/tools/utilities/about-you-tool.js',
            className: 'AboutYouTool',
            dependencies: []
        },
        'algorithms-test-lab': {
            script: '/assets/js/tools/utilities/algorithms-test-lab.js',
            className: 'AlgorithmsTestLab',
            dependencies: []
        },
        'media-manager': {
            script: '/assets/js/tools/utilities/media-manager.js',
            className: 'MediaManagerTool',
            dependencies: []
        },
        'cursive-glyph-builder': {
            script: '/assets/js/tools/utilities/cursive-glyph-builder.js',
            className: 'CursiveGlyphBuilderTool',
            dependencies: []
        }
    },
    
    // Shared dependencies (loaded once, cached)
    sharedDependencies: {
        'google-fonts-loader': {
            script: '../tools/utilities/google-fonts-loader.js',
            module: true,  // ES module
            check: () => !!window.GoogleFontsLoader
        },
        'mathjs': {
            script: 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.0/math.min.js',
            check: () => !!window.math
        },
        'algorithms': {
            script: '../shared/algorithms/index.js',
            module: true,  // ES module
            check: () => true  // ES module - no global check needed, import handles dependency
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // EXPORT LIBRARIES - Lazy loaded only when export is triggered
    // ═══════════════════════════════════════════════════════════════════════════
    
    exportLibraries: {
        'jszip': {
            script: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
            check: () => !!window.JSZip
        },
        'recordrtc': {
            script: 'https://cdn.webrtc-experiment.com/RecordRTC.js',
            check: () => !!window.RecordRTC
        }
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // CORE LOADING METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Load a script dynamically
     * @param {string} src - Script URL or path
     * @param {Object} options - { module: boolean, id: string }
     * @returns {Promise<void>}
     */
    loadScript(src, options = {}) {
        // Return cached promise if already loading/loaded
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }
        
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }
        
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src + '?v=' + Date.now();
            
            if (options.module) {
                script.type = 'module';
            }
            
            if (options.id) {
                script.id = options.id;
            }
            
            script.onload = () => {
                this.loadedScripts.add(src);
                this.loadingPromises.delete(src);
                window.debugLog('INIT', `✅ Loaded: ${src}`);
                resolve();
            };
            
            script.onerror = (err) => {
                this.loadingPromises.delete(src);
                console.error(`❌ Failed to load: ${src}`, err);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });
        
        this.loadingPromises.set(src, promise);
        return promise;
    },
    
    /**
     * Load a shared dependency
     * @param {string} depId - Dependency ID from sharedDependencies
     * @returns {Promise<void>}
     */
    async loadDependency(depId) {
        const dep = this.sharedDependencies[depId];
        if (!dep) {
            console.warn(`Unknown dependency: ${depId}`);
            return;
        }

        // Already loaded?
        if (dep.check && dep.check()) {
            return;
        }

        // Load the script (with module flag if needed)
        if (dep.module) {
            // Use dynamic import for ES modules to preserve relative import resolution
            await import(/* @vite-ignore */ dep.script);
        } else {
            // For non-module dependencies, try dynamic import first, fall back to script loading
            try {
                await import(/* @vite-ignore */ dep.script);
            } catch (error) {
                // Fall back to script loading for external scripts (CDNs, etc.)
                await this.loadScript(dep.script, { module: false });
            }
        }
        
        // For async modules that dispatch an event when ready
        if (dep.waitEvent) {
            // Already ready?
            if (dep.check && dep.check()) {
                return;
            }
            // Wait for event
            await new Promise((resolve) => {
                const handler = () => {
                    window.removeEventListener(dep.waitEvent, handler);
                    resolve();
                };
                window.addEventListener(dep.waitEvent, handler);
                // Also poll as backup
                const poll = setInterval(() => {
                    if (dep.check && dep.check()) {
                        clearInterval(poll);
                        window.removeEventListener(dep.waitEvent, handler);
                        resolve();
                    }
                }, 50);
                // Timeout after 5s
                setTimeout(() => {
                    clearInterval(poll);
                    window.removeEventListener(dep.waitEvent, handler);
                    resolve(); // Resolve anyway to not block forever
                }, 5000);
            });
        } else {
            // Wait for global to be available
            await this.waitFor(dep.check, 50, 10);
        }
    },
    
    /**
     * Load a tool and its dependencies
     * @param {string} toolId - Tool ID from registry
     * @returns {Promise<Function>} - The tool class
     */
    async loadTool(toolId) {
        const tool = this.toolRegistry[toolId];
        if (!tool) {
            throw new Error(`Unknown tool: ${toolId}`);
        }

        // Check if already loaded
        if (window[tool.className]) {
            return window[tool.className];
        }

        window.debugLog('INIT', `📦 Loading tool: ${toolId}`);

        // Load dependencies first
        if (tool.dependencies && tool.dependencies.length > 0) {
            await Promise.all(tool.dependencies.map(dep => this.loadDependency(dep)));
        }

        try {
            // Use ES module dynamic import instead of script loading
            const module = await import(/* @vite-ignore */ tool.script);
            window.debugLog('INIT', `🔍 Module loaded: ${tool.script}, keys:`, Object.keys(module));
            window.debugLog('INIT', `🔍 Looking for class: ${tool.className}`);
            const ToolClass = module[tool.className] || module.default;

            if (!ToolClass) {
                console.error(`🔍 Available in module:`, Object.keys(module));
                throw new Error(`Tool class ${tool.className} not found in module ${tool.script}`);
            }

            // Make globally available for backward compatibility
            window[tool.className] = ToolClass;

            window.debugLog('INIT', `✅ Tool ready: ${toolId} (${tool.className})`);
            return ToolClass;
        } catch (error) {
            console.error(`❌ Failed to load tool module: ${tool.script}`, error);
            throw new Error(`Failed to load tool: ${toolId} - ${error.message}`);
        }
    },
    
    /**
     * Load export libraries (JSZip, RecordRTC) on demand
     * @param {string} libId - 'jszip' or 'recordrtc'
     * @returns {Promise<any>}
     */
    async loadExportLibrary(libId) {
        const lib = this.exportLibraries[libId];
        if (!lib) {
            throw new Error(`Unknown export library: ${libId}`);
        }
        
        // Already loaded?
        if (lib.check && lib.check()) {
            return libId === 'jszip' ? window.JSZip : window.RecordRTC;
        }
        
        window.debugLog('INIT', `📦 Loading export library: ${libId}`);
        await this.loadScript(lib.script);
        
        // Wait for global
        await this.waitFor(lib.check, 50, 10);
        
        window.debugLog('INIT', `✅ Export library ready: ${libId}`);
        return libId === 'jszip' ? window.JSZip : window.RecordRTC;
    },
    
    /**
     * Ensure JSZip is loaded (convenience method for export)
     */
    async ensureJSZip() {
        return this.loadExportLibrary('jszip');
    },
    
    /**
     * Ensure RecordRTC is loaded (convenience method for export)
     */
    async ensureRecordRTC() {
        return this.loadExportLibrary('recordrtc');
    },
    
    /**
     * Ensure math.js is loaded
     */
    async ensureMathJS() {
        return this.loadDependency('mathjs');
    },
    
    // ═══════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Wait for a condition to be true
     * @param {Function} check - Function that returns true when ready
     * @param {number} interval - Check interval in ms
     * @param {number} maxAttempts - Maximum attempts before giving up
     */
    waitFor(check, interval = 50, maxAttempts = 20) {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const checkLoop = () => {
                if (check()) {
                    resolve();
                    return;
                }
                
                attempts++;
                if (attempts >= maxAttempts) {
                    reject(new Error('Timeout waiting for condition'));
                    return;
                }
                
                setTimeout(checkLoop, interval);
            };
            
            checkLoop();
        });
    },
    
    /**
     * Check if a tool is already loaded
     * @param {string} toolId
     * @returns {boolean}
     */
    isToolLoaded(toolId) {
        const tool = this.toolRegistry[toolId];
        return tool && !!window[tool.className];
    },
    
    /**
     * Get loading status
     * @returns {Object}
     */
    getStatus() {
        return {
            loadedScripts: Array.from(this.loadedScripts),
            pendingLoads: Array.from(this.loadingPromises.keys()),
            toolsLoaded: Object.keys(this.toolRegistry).filter(id => this.isToolLoaded(id))
        };
    },
    
    /**
     * Preload tools for a section (background loading)
     * @param {string[]} toolIds - Array of tool IDs to preload
     */
    preloadTools(toolIds) {
        // Load in background without blocking
        toolIds.forEach(toolId => {
            if (!this.isToolLoaded(toolId)) {
                this.loadTool(toolId).catch(err => {
                    console.warn(`Preload failed for ${toolId}:`, err);
                });
            }
        });
    }
};

// Global registration
window.AssetLoader = AssetLoader;

window.debugLog('INIT', `📦 AssetLoader v${AssetLoader.version} ready - Lazy loading enabled`);

