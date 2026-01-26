/**
 * Algorithm Test Lab
 *
 * ToolBase page for exercising shared algorithms with a navigation dropdown
 * and dual canvas views [OUTPUT | ABOUT].
 *
 * @version 2.0.0 - ES Module conversion
 */

// ES Module utilities and state
import * as Algorithms from '../../shared/algorithms/index.js';
import ComponentLibrary from '../../shared/component-library.js';
import { ToolBase } from '../core/tool-base.js';

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTS & STATE
    // ═══════════════════════════════════════════════════════════════════════

    const A = Algorithms;
    const VGA = [
        '#000000', '#800000', '#008000', '#808000',
        '#000080', '#800080', '#008080', '#c0c0c0',
        '#808080', '#ff0000', '#00ff00', '#ffff00',
        '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];

    const DEFAULT_ALGO = 'page1.noise.simplex2D';

    // ═══════════════════════════════════════════════════════════════════════
    // ANIMATION STATE & FRAMEWORK
    // ═══════════════════════════════════════════════════════════════════════

    const animationState = {
        // Current animation instance (if any)
        instance: null,
        isPlaying: false,
        frameRate: 30,
        lastFrameTime: 0,
        animationFrameId: null
    };

    // ═══════════════════════════════════════════════════════════════════════
    // IMAGE STATE & FETCHING (for image processing algorithms)
    // ═══════════════════════════════════════════════════════════════════════

    const imageState = {
        currentImage: null,
        currentImageData: null,
        isLoading: false,
        lastSeed: Math.floor(Math.random() * 10000)
    };

    /**
     * Fetch a random image from Lorem Picsum
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} seed - Optional seed for consistent random image
     * @returns {Promise<HTMLImageElement>}
     */
    async function fetchLoremPicsum(width, height, seed = null) {
        const useSeed = seed !== null ? seed : imageState.lastSeed;
        const url = `https://picsum.photos/seed/${useSeed}/${width}/${height}?grayscale`;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                imageState.lastSeed = useSeed;
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image from Lorem Picsum'));
            };
            
            img.src = url;
        });
    }

    /**
     * Load and cache an image for processing algorithms
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
     * @param {boolean} forceNew - Force fetch a new image
     */
    async function ensureTestImage(ctx, canvas, forceNew = false) {
        if (imageState.currentImage && !forceNew) {
            return imageState.currentImage;
        }

        if (imageState.isLoading) {
            // Wait for existing load
            return new Promise((resolve) => {
                const checkLoading = () => {
                    if (!imageState.isLoading) {
                        resolve(imageState.currentImage);
                    } else {
                        setTimeout(checkLoading, 50);
                    }
                };
                checkLoading();
            });
        }

        imageState.isLoading = true;
        
        try {
            const img = await fetchLoremPicsum(canvas.width, canvas.height);
            imageState.currentImage = img;
            
            // Draw to temporary canvas to extract ImageData
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageState.currentImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            
            imageState.isLoading = false;
            return img;
        } catch (error) {
            console.error('Failed to load test image:', error);
            imageState.isLoading = false;
            throw error;
        }
    }

    /**
     * Animation wrapper for iterative algorithms
     */
    class AnimatedAlgorithm {
        constructor(algoId, initFn, stepFn, renderFn, isCompleteFn) {
            this.algoId = algoId;
            this.initFn = initFn;
            this.stepFn = stepFn;
            this.renderFn = renderFn;
            this.isCompleteFn = isCompleteFn;
            this.state = null;
            this.frame = 0;
            this.maxFrames = 1000; // Safety limit
        }

        init(params) {
            this.state = this.initFn(params);
            this.frame = 0;
        }

        step() {
            if (!this.state || this.isComplete()) return false;
            this.state = this.stepFn(this.state);
            this.frame++;
            return true;
        }

        render(ctx, canvas) {
            if (!this.state) return;
            this.renderFn(ctx, canvas, this.state, this.frame);
        }

        isComplete() {
            if (this.frame >= this.maxFrames) return true;
            return this.isCompleteFn ? this.isCompleteFn(this.state) : false;
        }

        reset(params) {
            this.init(params);
        }
    }

    /**
     * Start animation loop
     */
    function startAnimation(tool) {
        if (animationState.isPlaying) return;
        animationState.isPlaying = true;
        animationState.lastFrameTime = performance.now();
        animationLoop(tool);
    }

    /**
     * Stop animation loop
     */
    function stopAnimation() {
        animationState.isPlaying = false;
        if (animationState.animationFrameId) {
            cancelAnimationFrame(animationState.animationFrameId);
            animationState.animationFrameId = null;
        }
    }

    /**
     * Animation loop
     */
    function animationLoop(tool) {
        if (!animationState.isPlaying || !animationState.instance) {
            stopAnimation();
            return;
        }

        const now = performance.now();
        const elapsed = now - animationState.lastFrameTime;
        const frameTime = 1000 / animationState.frameRate;

        if (elapsed >= frameTime) {
            animationState.lastFrameTime = now;

            // Step the animation
            const stepped = animationState.instance.step();

            // Redraw
            if (tool && tool.draw) {
                tool.draw();
            }

            // Check if complete
            if (!stepped || animationState.instance.isComplete()) {
                stopAnimation();
                return;
            }
        }

        animationState.animationFrameId = requestAnimationFrame(() => animationLoop(tool));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE STRUCTURE: 6 Pages (Dropdown) × Domains (Tabs) × Algorithms
    // Based on Test-Pages.md + processing/ available implementations
    // ═══════════════════════════════════════════════════════════════════════

    const PAGES = [
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 1: NOISE, SAMPLING, PATTERNS
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page1',
            title: 'Noise, Sampling, Patterns',
            domains: [
                {
                    id: 'noise',
                    title: 'Noise Functions',
                    docsPath: '17_Noise_Functions',
                    algorithms: [
                        { id: 'perlin2D', title: 'Perlin 2D', impl: true },
                        { id: 'simplex2D', title: 'Simplex 2D', impl: true },
                        { id: 'fbm2D', title: 'fBm 2D', impl: true },
                        { id: 'domainWarp2D', title: 'Domain Warp', impl: true },
                        { id: 'multiWarp2D', title: 'Multi Warp', impl: true }
                    ]
                },
                {
                    id: 'sampling',
                    title: 'Sampling & Distributions',
                    docsPath: '04_Sampling_Point_Distribution',
                    algorithms: [
                        { id: 'poissonDisk', title: 'Poisson Disk', impl: true },
                        { id: 'variablePoissonDisk', title: 'Variable Poisson Disk', impl: true },
                        { id: 'haltonSequence', title: 'Halton Sequence', impl: true },
                        { id: 'hammersleySet', title: 'Hammersley Set', impl: true },
                        { id: 'sobolSequence', title: 'Sobol Sequence', impl: true },
                        { id: 'stratifiedSampling', title: 'Stratified Sampling', impl: true },
                        { id: 'jitteredGrid', title: 'Jittered Grid', impl: true },
                        { id: 'lloydRelaxation', title: 'Lloyd Relaxation', impl: true },
                        { id: 'importanceSampling', title: 'Importance Sampling', impl: true },
                        { id: 'weightedPoissonDisk', title: 'Weighted Poisson Disk', impl: true }
                    ]
                },
                {
                    id: 'patterns',
                    title: 'Patterns & Tiles',
                    docsPath: '18_Pattern_Generation',
                    algorithms: [
                        { id: 'truchet', title: 'Truchet Grid', impl: true },
                        { id: 'linearGrating', title: 'Linear Grating', impl: true },
                        { id: 'radialGrating', title: 'Radial Grating', impl: true },
                        { id: 'angularGrating', title: 'Angular Grating', impl: true },
                        { id: 'spiralGrating', title: 'Spiral Grating', impl: true },
                        { id: 'moire', title: 'Moiré Patterns', impl: true },
                        { id: 'halftone', title: 'Line Halftone', impl: true },
                        { id: 'crossHatch', title: 'Cross-Hatch Halftone', impl: true },
                        { id: 'contourLattice', title: 'Contour Lattice', impl: true },
                        { id: 'dyadicHalftone', title: 'Dyadic Halftone', impl: true },
                        { id: 'superellipse', title: 'Superellipse', impl: true }
                    ]
                }
            ]
        },
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 2: EDGES, FILTERING, SEGMENTATION
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page2',
            title: 'Edges, Filtering, Segmentation',
            domains: [
                {
                    id: 'edges',
                    title: 'Edge Detection',
                    docsPath: '01_Edge_Gradient_Differential_Operators',
                    algorithms: [
                        // Gradient operators (first derivative)
                        { id: 'sobel', title: 'Sobel', impl: true },
                        { id: 'scharr', title: 'Scharr', impl: true },
                        { id: 'prewitt', title: 'Prewitt', impl: true },
                        { id: 'robertsCross', title: 'Roberts Cross', impl: true },
                        // Second derivative
                        { id: 'laplacian', title: 'Laplacian', impl: true },
                        { id: 'laplacianOfGaussian', title: 'LoG', impl: true },
                        { id: 'differenceOfGaussians', title: 'DoG', impl: true },
                        // Advanced
                        { id: 'canny', title: 'Canny', impl: true },
                        { id: 'structureTensor', title: 'Structure Tensor', impl: true },
                        { id: 'zeroCrossings', title: 'Zero Crossings', impl: true },
                        { id: 'dominantOrientation', title: 'Dominant Orientation', impl: true }
                    ]
                },
                {
                    id: 'filtering',
                    title: 'Filtering',
                    docsPath: '14_Signal_Processing_Filtering',
                    algorithms: [
                        { id: 'gaussian', title: 'Gaussian Blur', impl: false },
                        { id: 'bilateral', title: 'Bilateral Filter', impl: false },
                        { id: 'median', title: 'Median Filter', impl: false }
                    ]
                },
                {
                    id: 'segmentation',
                    title: 'Segmentation',
                    docsPath: '02_Image_Segmentation_Region_Extraction',
                    algorithms: [
                        { id: 'otsu', title: 'Otsu Threshold', impl: true },
                        { id: 'connectedComponents', title: 'Connected Components', impl: true },
                        { id: 'floodFill', title: 'Flood Fill', impl: true }
                    ]
                }
            ]
        },
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 3: CURVES, DISTANCE, TOPOLOGY
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page3',
            title: 'Curves, Distance, Topology',
            domains: [
                {
                    id: 'curves',
                    title: 'Curve Geometry',
                    docsPath: '10_Curve_Theory_Stroke_Geometry',
                    algorithms: [
                        { id: 'tangents', title: 'Tangents', impl: true },
                        { id: 'normals', title: 'Normals', impl: true },
                        { id: 'curvature', title: 'Curvature', impl: true },
                        { id: 'offset', title: 'Offset Curves', impl: true }
                    ]
                },
                {
                    id: 'distance',
                    title: 'Distance Fields',
                    docsPath: '13_Distance_Morphology_Topology',
                    algorithms: [
                        { id: 'jfa', title: 'Jump Flood', impl: true },
                        { id: 'sdfPrimitives', title: 'SDF Primitives', impl: true },
                        { id: 'sdfBoolean', title: 'SDF Boolean Ops', impl: true },
                        { id: 'geodesic', title: 'Geodesic Distance', impl: true }
                    ]
                },
                {
                    id: 'vectorization',
                    title: 'Vectorization',
                    docsPath: '03_Raster_Vector_Conversion',
                    algorithms: [
                        { id: 'marchingSquares', title: 'Marching Squares', impl: true },
                        { id: 'extractContours', title: 'Extract Contours', impl: true },
                        { id: 'simplifyContour', title: 'Simplify Contour', impl: true }
                    ]
                }
            ]
        },
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 4: SPACE-FILLING, TSP, GRAPHS
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page4',
            title: 'Space-Filling, TSP, Graphs',
            domains: [
                {
                    id: 'spaceFilling',
                    title: 'Space-Filling Curves',
                    docsPath: '05_Space_Filling_Curves',
                    algorithms: [
                        { id: 'hilbert', title: 'Hilbert', impl: true },
                        { id: 'peano', title: 'Peano', impl: true },
                        { id: 'moore', title: 'Moore', impl: true },
                        { id: 'zOrder', title: 'Z-Order', impl: true },
                        { id: 'lSystem', title: 'L-System', impl: true }
                    ]
                },
                {
                    id: 'tsp',
                    title: 'TSP Path Optimization',
                    docsPath: '07_TSP_Based_Space_Filling',
                    algorithms: [
                        { id: 'nearestNeighbor', title: 'Nearest Neighbor', impl: true },
                        { id: 'twoOpt', title: '2-Opt', impl: true },
                        { id: 'christofides', title: 'Christofides', impl: true }
                    ]
                },
                {
                    id: 'graphs',
                    title: 'Graphs & Pathfinding',
                    docsPath: '16_Graphs_Connectivity_Pathfinding',
                    algorithms: [
                        { id: 'kdTree', title: 'K-d Tree', impl: true },
                        { id: 'spatialHash', title: 'Spatial Hash', impl: true }
                    ]
                }
            ]
        },
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 5: OPTICS, PHYSICS, PDE
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page5',
            title: 'Optics, Physics, PDE',
            domains: [
                {
                    id: 'optics',
                    title: 'Interference & Optics',
                    docsPath: '19_Interference_Optics',
                    algorithms: [
                        { id: 'thinFilm', title: 'Thin Film', impl: true },
                        { id: 'twoBeam', title: 'Two-Beam Interference', impl: true },
                        { id: 'birefringence', title: 'Birefringence', impl: true },
                        { id: 'conoscopy', title: 'Conoscopy', impl: true }
                    ]
                },
                {
                    id: 'physics',
                    title: 'Physics Simulation',
                    docsPath: '20_Physics_Simulation',
                    algorithms: [
                        { id: 'wave1D', title: 'Wave 1D', impl: true },
                        { id: 'wave2D', title: 'Wave 2D', impl: true },
                        { id: 'advection', title: 'Advection', impl: true },
                        { id: 'streamline', title: 'Streamline Tracing', impl: true }
                    ]
                },
                {
                    id: 'reactionDiffusion',
                    title: 'Reaction-Diffusion',
                    docsPath: '08_Reaction_Diffusion_PDE',
                    algorithms: [
                        { id: 'grayScott', title: 'Gray-Scott', impl: true },
                        { id: 'turing', title: 'Turing Patterns', impl: true },
                        { id: 'gameOfLife', title: 'Game of Life', impl: true },
                        { id: 'cellularAutomaton', title: 'Cellular Automaton', impl: true }
                    ]
                }
            ]
        },
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 6: COLOUR AND PERCEPTION
        // ═══════════════════════════════════════════════════════════════════
        {
            id: 'page6',
            title: 'Colour and Perception',
            domains: [
                {
                    id: 'quantization',
                    title: 'Quantization',
                    docsPath: '15_Colour_Perceptual_Models',
                    algorithms: [
                        { id: 'posterize', title: 'Posterize', impl: true },
                        { id: 'posterizeGamma', title: 'Posterize Gamma', impl: true },
                        { id: 'dither', title: 'Dither', impl: true },
                        { id: 'bayerDither', title: 'Bayer Dither', impl: true }
                    ]
                }
            ]
        }
    ];

    // Build flat algorithm map from hierarchical structure
    const ALGORITHM_MAP = {};
    PAGES.forEach(page => {
        page.domains.forEach(domain => {
            domain.algorithms.forEach(algo => {
                const fullId = `${page.id}.${domain.id}.${algo.id}`;
                ALGORITHM_MAP[fullId] = {
                    ...algo,
                    domainId: domain.id,
                    domainTitle: domain.title,
                    pageId: page.id,
                    pageTitle: page.title,
                    docsPath: domain.docsPath
                };
            });
        });
    });

    // Flatten for backwards compatibility with current code
    const ALGORITHM_GROUPS = PAGES.flatMap(page => 
        page.domains.map(domain => ({
            id: `${page.id}.${domain.id}`,
            title: domain.title,
            pageId: page.id,
            pageTitle: page.title,
            docsPath: domain.docsPath,
            items: domain.algorithms.map(algo => ({
                id: `${page.id}.${domain.id}.${algo.id}`,
                title: algo.title,
                impl: algo.impl,
                renderer: domain.id
            }))
        }))
    );

    const state = {
        selectedId: DEFAULT_ALGO,
        selectedPageId: 'page1',
        selectedDomainId: 'noise',
        selectedAlgorithmId: DEFAULT_ALGO, // Currently active algorithm for rendering
        viewMode: 'output',
        aboutPanel: null,
        blockRegistry: new Map(),
        algoTabsComponent: null
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER: Build Algorithm Map for lookup
    // ═══════════════════════════════════════════════════════════════════════
    
    const OLD_ALGORITHM_MAP = {};
    ALGORITHM_GROUPS.forEach(group => {
        if (group.items) {
            group.items.forEach(item => {
                OLD_ALGORITHM_MAP[item.id] = { ...item, groupId: group.id, groupTitle: group.title };
            });
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // ORIGINAL IMPLEMENTATIONS (keep for now)
    // ═══════════════════════════════════════════════════════════════════════
    
    const ORIGINAL_GROUPS_BACKUP = [
        {
            id: 'noise',
            title: 'Noise Functions',
            description: 'Gradient/value noise families for texture and modulation.',
            items: [
                {
                    id: 'sampling.poissonDisk',
                    title: 'Poisson Disk',
                    renderer: 'sampling',
                    detail: 'Blue-noise disk sampling via Bridson.',
                    methodology: [
                        'Target radius r, verify min-distance constraint by pairwise check.',
                        'Estimate coverage uniformity with Voronoi cell variance.',
                        'Stress-test with high radii to ensure termination.'
                    ]
                },
                {
                    id: 'sampling.haltonSequence',
                    title: 'Halton',
                    renderer: 'sampling',
                    detail: 'Low-discrepancy quasi-random sequence.',
                    methodology: [
                        'Generate first N points; compute discrepancy vs. uniform grid.',
                        'Check base pair (2,3) correlation; rotate bases if needed.',
                        'Plot prefix lengths to confirm stratification.'
                    ]
                }
            ]
        },
        {
            id: 'space',
            title: 'Space-Filling Curves',
            description: 'Curve traversal for locality-preserving indexing.',
            items: [
                {
                    id: 'space.hilbert',
                    title: 'Hilbert Curve',
                    renderer: 'space',
                    detail: 'Order-n Hilbert traversal over unit square.',
                    methodology: [
                        'Generate order 5–7; verify path visits 4^n cells without crossings.',
                        'Compute neighbor distance histogram for locality.',
                        'Check morton vs. hilbert index difference for jumps.'
                    ]
                }
            ]
        },
        {
            id: 'tsp',
            title: 'Path Optimisation',
            description: 'Nearest-neighbor and 2-opt heuristics over point sets.',
            items: [
                {
                    id: 'tsp.nearestNeighbor',
                    title: 'Nearest Neighbor',
                    renderer: 'tsp',
                    detail: 'Greedy tour construction baseline.',
                    methodology: [
                        'Run on Poisson points; measure tour length vs. MST lower bound.',
                        'Check for self-crossings and duplicate vertices.',
                        'Use different seeds to compare stability.'
                    ]
                },
                {
                    id: 'tsp.twoOpt',
                    title: '2-Opt Refinement',
                    renderer: 'tsp',
                    detail: 'Edge swap optimisation over an initial tour.',
                    methodology: [
                        'Start from nearest-neighbor path; iterate until no improvement.',
                        'Track improvement ratio and iteration count.',
                        'Confirm path stays simple (no duplicates).'
                    ]
                }
            ]
        },
        {
            id: 'patterns',
            title: 'Patterns & Tiles',
            description: 'Procedural tiling with Truchet motifs.',
            items: [
                {
                    id: 'patterns.truchet',
                    title: 'Truchet Grid',
                    renderer: 'pattern',
                    detail: 'Tile grid with deterministic arc states.',
                    methodology: [
                        'Generate grid; verify tile orientations deterministic per seed.',
                        'Check seam continuity by ensuring arcs meet neighbors.',
                        'Render binary mask and contour overlay for QA.'
                    ]
                }
            ]
        },
        {
            id: 'pde',
            title: 'Reaction–Diffusion',
            description: 'Gray-Scott solver over small grids.',
            items: [
                {
                    id: 'pde.grayScott',
                    title: 'Gray-Scott',
                    renderer: 'reaction',
                    detail: 'U/V concentration integration with periodic boundary.',
                    methodology: [
                        'Seed center block; run 100–300 steps; track conservation bounds.',
                        'Validate stability by clamping to [0,1] and checking NaNs.',
                        'Inspect pattern regimes when varying feed/kill.'
                    ]
                }
            ]
        },
        {
            id: 'distance',
            title: 'Distance Fields',
            description: 'Jump Flood Algorithm distance transform.',
            items: [
                {
                    id: 'distance.jfa',
                    title: 'Jump Flood',
                    renderer: 'distance',
                    detail: 'Voronoi/distance propagation on discrete grid.',
                    methodology: [
                        'Seed random sites; run log2(N) passes; verify monotone decrease.',
                        'Compare against exact BFS for a 32×32 sanity grid.',
                        'Visualise contours at fixed thresholds.'
                    ]
                }
            ]
        }
    ];

    // ═══════════════════════════════════════════════════════════════════════
    // MARKDOWN DOCUMENTATION LOADER
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create a markdown loader function for a specific file path
     * Returns a function that fetches and renders markdown using ComponentLibrary
     */
    const createMarkdownLoader = (path, deps) => {
        return async () => {
            try {
                const response = await fetch(path, { cache: 'no-cache' });
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
                const markdownText = await response.text();
                
                // Use ComponentLibrary.MarkdownBody to render the markdown
                if (!window.ComponentLibrary || !window.ComponentLibrary.MarkdownBody) {
                    throw new Error('MarkdownBody component not available');
                }
                
                const markdownComponent = new window.ComponentLibrary.MarkdownBody({ markdownText }, deps);
                return await markdownComponent.render();
            } catch (error) {
                console.error(`Error loading markdown from ${path}:`, error);
                const errorPanel = new window.ComponentLibrary.Panel({
                    title: 'Documentation Error',
                    content: `Failed to load documentation: ${error.message}`,
                    className: 'error-panel'
                });
                return errorPanel.render();
            }
        };
    };

    /**
     * Map algorithm IDs to markdown filenames
     */
    const ALGORITHM_DOCS_MAP = {
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 1: NOISE, SAMPLING, PATTERNS
        // ═══════════════════════════════════════════════════════════════════
        
        // Noise Functions (17_Noise_Functions)
        'page1.noise.perlin2D': 'blog/ideas/reference documentation/17_Noise_Functions/Perlin_noise.md',
        'page1.noise.simplex2D': 'blog/ideas/reference documentation/17_Noise_Functions/Simplex_noise.md',
        'page1.noise.fbm2D': 'blog/ideas/reference documentation/17_Noise_Functions/Simplex_noise.md',
        'page1.noise.domainWarp2D': 'blog/ideas/reference documentation/17_Noise_Functions/Domain_warping.md',
        'page1.noise.multiWarp2D': 'blog/ideas/reference documentation/17_Noise_Functions/Domain_warping.md',
        
        // Sampling & Distributions (04_Sampling_Point_Distribution)
        'page1.sampling.poissonDisk': 'blog/ideas/reference documentation/04_Sampling_Point_Distribution/Poisson_disk_sampling.md',
        'page1.sampling.haltonSequence': 'blog/ideas/reference documentation/04_Sampling_Point_Distribution/Halton_sequence.md',
        'page1.sampling.lloydRelaxation': 'blog/ideas/reference documentation/04_Sampling_Point_Distribution/Lloyd\'s_algorithm.md',
        'page1.sampling.importanceSampling': 'blog/ideas/reference documentation/04_Sampling_Point_Distribution/Importance_sampling.md',
        
        // Patterns & Tiles (18_Pattern_Generation)
        'page1.patterns.truchet': 'blog/ideas/reference documentation/18_Pattern_Generation/Truchet_tiles.md',
        'page1.patterns.linearGrating': 'blog/ideas/reference documentation/18_Pattern_Generation/Truchet_tiles.md',
        'page1.patterns.radialGrating': 'blog/ideas/reference documentation/18_Pattern_Generation/Truchet_tiles.md',
        'page1.patterns.moire': 'blog/ideas/reference documentation/19_Interference_Optics/Moire_pattern.md',
        'page1.patterns.halftone': 'blog/ideas/reference documentation/14_Signal_Processing_Filtering/Posterization.md',
        
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 2: EDGES, FILTERING, SEGMENTATION
        // ═══════════════════════════════════════════════════════════════════
        
        // Edge Detection (01_Edge_Gradient_Differential_Operators)
        'page2.edges.sobel': 'blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Sobel_operator.md',
        'page2.edges.canny': 'blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Canny_edge_detector.md',
        'page2.edges.laplacian': 'blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Laplacian.md',
        'page2.edges.laplacianOfGaussian': 'blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Laplacian_of_Gaussian.md',
        'page2.edges.differenceOfGaussians': 'blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Difference_of_Gaussians.md',
        'page2.edges.structureTensor': 'blog/ideas/reference documentation/01_Edge_Gradient_Differential_Operators/Structure_tensor.md',
        
        // Filtering (14_Signal_Processing_Filtering)
        'page2.filtering.gaussian': 'blog/ideas/reference documentation/14_Signal_Processing_Filtering/Gaussian_blur.md',
        'page2.filtering.bilateral': 'blog/ideas/reference documentation/14_Signal_Processing_Filtering/Bilateral_filter.md',
        'page2.filtering.median': 'blog/ideas/reference documentation/14_Signal_Processing_Filtering/Gaussian_blur.md',
        
        // Segmentation (02_Image_Segmentation_Region_Extraction)
        'page2.segmentation.otsu': 'blog/ideas/reference documentation/02_Image_Segmentation_Region_Extraction/Otsu\'s_method.md',
        'page2.segmentation.connectedComponents': 'blog/ideas/reference documentation/02_Image_Segmentation_Region_Extraction/Connected-component_labeling.md',
        'page2.segmentation.floodFill': 'blog/ideas/reference documentation/05_Space_Filling_Curves/Flood_fill.md',
        
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 3: CURVES, DISTANCE, TOPOLOGY
        // ═══════════════════════════════════════════════════════════════════
        
        // Curve Geometry (10_Curve_Theory_Stroke_Geometry)
        'page3.curves.tangents': 'blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Frenet-Serret_formulas.md',
        'page3.curves.normals': 'blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Frenet-Serret_formulas.md',
        'page3.curves.curvature': 'blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Curvature.md',
        'page3.curves.offset': 'blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Offset_curve.md',
        
        // Distance Fields (13_Distance_Morphology_Topology)
        'page3.distance.jfa': 'blog/ideas/reference documentation/13_Distance_Morphology_Topology/Jump_flooding_algorithm.md',
        'page3.distance.sdfPrimitives': 'blog/ideas/reference documentation/13_Distance_Morphology_Topology/Signed_distance_function.md',
        'page3.distance.sdfBoolean': 'blog/ideas/reference documentation/13_Distance_Morphology_Topology/Signed_distance_function.md',
        'page3.distance.geodesic': 'blog/ideas/reference documentation/13_Distance_Morphology_Topology/Geodesic.md',
        
        // Vectorization (03_Raster_Vector_Conversion)
        'page3.vectorization.marchingSquares': 'blog/ideas/reference documentation/03_Raster_Vector_Conversion/Marching_squares.md',
        'page3.vectorization.extractContours': 'blog/ideas/reference documentation/03_Raster_Vector_Conversion/Boundary_tracing.md',
        'page3.vectorization.simplifyContour': 'blog/ideas/reference documentation/03_Raster_Vector_Conversion/Ramer-Douglas-Peucker_algorithm.md',
        
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 4: SPACE-FILLING, TSP, GRAPHS
        // ═══════════════════════════════════════════════════════════════════
        
        // Space-Filling Curves (05_Space_Filling_Curves)
        'page4.spaceFilling.hilbert': 'blog/ideas/reference documentation/05_Space_Filling_Curves/Hilbert_curve.md',
        'page4.spaceFilling.peano': 'blog/ideas/reference documentation/05_Space_Filling_Curves/Peano_curve.md',
        'page4.spaceFilling.moore': 'blog/ideas/reference documentation/05_Space_Filling_Curves/Moore_curve.md',
        'page4.spaceFilling.zOrder': 'blog/ideas/reference documentation/05_Space_Filling_Curves/Z-order_curve.md',
        'page4.spaceFilling.lSystem': 'blog/ideas/reference documentation/05_Space_Filling_Curves/L-system.md',
        
        // TSP Path Optimization (07_TSP_Based_Space_Filling)
        'page4.tsp.nearestNeighbor': 'blog/ideas/reference documentation/07_TSP_Based_Space_Filling/Nearest_neighbour_algorithm.md',
        'page4.tsp.twoOpt': 'blog/ideas/reference documentation/07_TSP_Based_Space_Filling/2-opt.md',
        'page4.tsp.christofides': 'blog/ideas/reference documentation/07_TSP_Based_Space_Filling/Christofides_algorithm.md',
        
        // Graphs & Pathfinding (16_Graphs_Connectivity_Pathfinding)
        'page4.graphs.kdTree': 'blog/ideas/reference documentation/16_Graphs_Connectivity_Pathfinding/A_search_algorithm.md',
        'page4.graphs.spatialHash': 'blog/ideas/reference documentation/16_Graphs_Connectivity_Pathfinding/Breadth-first_search.md',
        
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 5: OPTICS, PHYSICS, PDE
        // ═══════════════════════════════════════════════════════════════════
        
        // Interference & Optics (19_Interference_Optics)
        'page5.optics.thinFilm': 'blog/ideas/reference documentation/19_Interference_Optics/Thin-film_interference.md',
        'page5.optics.twoBeam': 'blog/ideas/reference documentation/19_Interference_Optics/Thin-film_interference.md',
        'page5.optics.birefringence': 'blog/ideas/reference documentation/19_Interference_Optics/Polarization.md',
        'page5.optics.conoscopy': 'blog/ideas/reference documentation/19_Interference_Optics/Conoscopy.md',
        
        // Physics Simulation (20_Physics_Simulation)
        'page5.physics.wave1D': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Wave_equation.md',
        'page5.physics.wave2D': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Wave_equation.md',
        'page5.physics.advection': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Advection.md',
        'page5.physics.streamline': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Advection.md',
        
        // Reaction-Diffusion (08_Reaction_Diffusion_PDE)
        'page5.reactionDiffusion.grayScott': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Gray-Scott_model.md',
        'page5.reactionDiffusion.turing': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Turing_pattern.md',
        'page5.reactionDiffusion.gameOfLife': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Cellular_automaton.md',
        'page5.reactionDiffusion.cellularAutomaton': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Cellular_automaton.md',
        
        // ═══════════════════════════════════════════════════════════════════
        // PAGE 6: COLOUR AND PERCEPTION
        // ═══════════════════════════════════════════════════════════════════
        
        // Quantization (15_Colour_Perceptual_Models)
        'page6.quantization.posterize': 'blog/ideas/reference documentation/14_Signal_Processing_Filtering/Posterization.md',
        'page6.quantization.posterizeGamma': 'blog/ideas/reference documentation/14_Signal_Processing_Filtering/Posterization.md',
        'page6.quantization.dither': 'blog/ideas/reference documentation/15_Colour_Perceptual_Models/Color_quantization.md',
        'page6.quantization.bayerDither': 'blog/ideas/reference documentation/15_Colour_Perceptual_Models/Median_cut.md'
    };

    /**
     * Load documentation for a specific algorithm
     */
    async function loadAlgorithmDocs(pageId, domainId, algoId, deps) {
        const page = PAGES.find(p => p.id === pageId);
        if (!page) return null;
        
        const domain = page.domains.find(d => d.id === domainId);
        if (!domain || !domain.docsPath) return null;
        
        const filename = ALGORITHM_DOCS_MAP[algoId];
        if (!filename) {
            // No specific file mapped, show placeholder
            const placeholderPanel = new window.ComponentLibrary.Panel({
                title: domain.title,
                content: `
                    <p>Documentation for this algorithm is being compiled.</p>
                    <p>Reference path: blog/ideas/reference documentation/${domain.docsPath}/</p>
                `,
                className: 'doc-placeholder'
            });
            return placeholderPanel.render();
        }
        
        const filePath = `blog/ideas/reference documentation/${domain.docsPath}/${filename}`;
        const loader = createMarkdownLoader(filePath, deps);
        return await loader();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS — NAVIGATION DROPDOWN
    // ═══════════════════════════════════════════════════════════════════════

    function buildNavItems() {
        const items = [];
        ALGORITHM_GROUPS.forEach(group => {
            items.push({
                type: 'subsection',
                title: group.title,
                id: group.id,
                items: group.items.map(child => ({
                    title: child.title,
                    value: child.id,
                    isActive: child.id === state.selectedId
                }))
            });
        });
        return items;
    }

    function getNavLabel(id) {
        const meta = ALGORITHM_MAP[id];
        if (!meta) return 'SELECT ALGORITHM';
        return `${meta.group} / ${meta.title}`;
    }

    function selectAlgorithm(id, tool, triggerButton, dropdown) {
        if (!ALGORITHM_MAP[id]) return;
        state.selectedId = id;
        if (triggerButton) triggerButton.setText(getNavLabel(id));
        if (dropdown) {
            dropdown.populateDropdown(buildNavItems());
            dropdown.close();
        }
        if (tool) {
            // Click the corresponding sub-tab
            const algo = ALGORITHM_MAP[id];
            if (algo && tool.element) {
                const subTabs = tool.element.querySelectorAll('.tool-subtab');
                subTabs.forEach(tab => {
                    if (tab.textContent.trim() === algo.title) {
                        tab.click();
                    }
                });
            }
            updateAboutPanel(tool);
            tool.draw();
        }
    }

    /**
     * Rebuild the tool sidebar for a different page
     * This destroys and recreates the ToolBase with new domain tabs
     */
    function rebuildToolForPage(instance, pageId) {
        if (!instance || !instance.contentArea) return;
        
        state.selectedPageId = pageId;
        
        // Destroy old tool
        if (instance.tool) {
            instance.tool.destroy();
            instance.tool = null;
        }
        
        // Clear content area
        instance.contentArea.innerHTML = '';
        
        // Build new config with this page's domains
        const newConfig = {
            ...TOOL_CONFIG,
            sidebar: buildSidebarForPage(pageId)
        };
        
        // Create and mount new tool
        instance.tool = new ToolBase(newConfig, instance.deps);
        instance.tool._algorithmTestLabInstance = instance;
        instance.tool.mount(instance.contentArea);
        
        // Add OUTPUT/ABOUT tabs above canvas
        instance._addCanvasTabs();
        
        // Setup algorithm selection (make headers clickable)
        instance.setupAlgorithmSelection();
        
        // Draw
        instance.tool.draw();
    }

    function handlePlaybackAction(fullId, action) {
        console.log(`[Algorithms Test Lab] ${action} triggered for ${fullId}`);
    }

    /**
     * Handle fetching a new random image
     */
    function handleFetchNewImage(fullId) {
        window.debugLog('TOOLS', `Fetching new image for ${fullId}`);
        imageState.lastSeed = Math.floor(Math.random() * 10000);
        imageState.currentImage = null;
        imageState.currentImageData = null;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ALGORITHM CONTROLS MAPPING
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get controls for a specific algorithm based on its full ID
     * @param {string} fullId - Full algorithm ID (e.g., "page1.noise.simplex2D")
     * @param {object} algo - Algorithm metadata
     * @returns {array} Array of control definitions
     */
    function getControlsForAlgorithm(fullId, algo) {
        // Extract domain and algorithm ID from full ID
        const parts = fullId.split('.');
        const domainId = parts[1];
        const algoId = parts[2];

        // Common controls for all algorithms (empty - no need for implementation labels)
        const common = [];

        // Domain-specific controls
        switch (domainId) {
            case 'noise':
                switch (algoId) {
                    case 'perlin2D':
                    case 'simplex2D':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Scale', 0.1, 4.0, 0.1, { key: `${fullId}_scale`, value: 1.0, withNumber: true, precision: 1 }]
                        ];
                    case 'fbm2D':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Frequency', 0.001, 0.1, 0.001, { key: `${fullId}_frequency`, value: 0.005, withNumber: true }],
                            ['slider', 'Octaves', 1, 8, 1, { key: `${fullId}_octaves`, value: 4, withNumber: true }],
                            ['slider', 'Lacunarity', 1.5, 3.0, 0.1, { key: `${fullId}_lacunarity`, value: 2.0, withNumber: true }],
                            ['slider', 'Persistence', 0.1, 0.9, 0.05, { key: `${fullId}_persistence`, value: 0.5, withNumber: true }]
                        ];
                    case 'domainWarp2D':
                    case 'multiWarp2D':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Warp Strength', 0, 100, 1, { key: `${fullId}_strength`, value: 25, withNumber: true }],
                            ['slider', 'Noise Scale', 0.001, 0.1, 0.001, { key: `${fullId}_scale`, value: 0.01, withNumber: true }],
                            ['slider', 'Octaves', 1, 8, 1, { key: `${fullId}_octaves`, value: 4, withNumber: true }]
                        ];
                    default:
                        return common;
                }

            case 'sampling':
                switch (algoId) {
                    case 'poissonDisk':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Min Distance', 5, 50, 1, { key: `${fullId}_minDist`, value: 18, withNumber: true }],
                            ['slider', 'Candidates (k)', 10, 60, 1, { key: `${fullId}_k`, value: 30, withNumber: true }]
                        ];
                    case 'variablePoissonDisk':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Min Distance', 5, 30, 1, { key: `${fullId}_minDist`, value: 10, withNumber: true }],
                            ['slider', 'Max Distance', 15, 60, 1, { key: `${fullId}_maxDist`, value: 30, withNumber: true }],
                            ['slider', 'Candidates (k)', 10, 60, 1, { key: `${fullId}_k`, value: 30, withNumber: true }]
                        ];
                    case 'haltonSequence':
                        return [
                            ['slider', 'Count', 10, 500, 10, { key: `${fullId}_count`, value: 120, withNumber: true }],
                            ['slider', 'Base 1', 2, 13, 1, { key: `${fullId}_base1`, value: 2, withNumber: true }],
                            ['slider', 'Base 2', 2, 13, 1, { key: `${fullId}_base2`, value: 3, withNumber: true }]
                        ];
                    case 'hammersleySet':
                        return [
                            ['slider', 'Count', 10, 500, 10, { key: `${fullId}_count`, value: 120, withNumber: true }],
                            ['slider', 'Base', 2, 13, 1, { key: `${fullId}_base`, value: 2, withNumber: true }]
                        ];
                    case 'sobolSequence':
                        return [
                            ['slider', 'Count', 10, 500, 10, { key: `${fullId}_count`, value: 120, withNumber: true }]
                        ];
                    case 'stratifiedSampling':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Grid X', 4, 20, 1, { key: `${fullId}_nx`, value: 8, withNumber: true }],
                            ['slider', 'Grid Y', 4, 20, 1, { key: `${fullId}_ny`, value: 8, withNumber: true }]
                        ];
                    case 'jitteredGrid':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Grid X', 4, 20, 1, { key: `${fullId}_nx`, value: 8, withNumber: true }],
                            ['slider', 'Grid Y', 4, 20, 1, { key: `${fullId}_ny`, value: 8, withNumber: true }],
                            ['slider', 'Jitter', 0, 1, 0.1, { key: `${fullId}_jitter`, value: 0.5, withNumber: true, precision: 1 }]
                        ];
                    case 'lloydRelaxation':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Count', 10, 200, 10, { key: `${fullId}_count`, value: 80, withNumber: true }],
                            ['slider', 'Max Iterations', 1, 20, 1, { key: `${fullId}_maxIterations`, value: 10, withNumber: true }],
                            ['button', 'Play', () => handlePlaybackAction(fullId, 'play'), { key: `${fullId}_play` }],
                            ['button', 'Step', () => handlePlaybackAction(fullId, 'step'), { key: `${fullId}_step` }],
                            ['button', 'Reset', () => handlePlaybackAction(fullId, 'reset'), { key: `${fullId}_reset` }]
                        ];
                    case 'importanceSampling':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Count', 10, 500, 10, { key: `${fullId}_count`, value: 120, withNumber: true }]
                        ];
                    case 'weightedPoissonDisk':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Base Min Dist', 5, 30, 1, { key: `${fullId}_baseMinDist`, value: 15, withNumber: true }],
                            ['slider', 'Candidates (k)', 10, 60, 1, { key: `${fullId}_k`, value: 30, withNumber: true }]
                        ];
                    default:
                        return common;
                }

            case 'patterns':
                switch (algoId) {
                    case 'truchet':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 7, withNumber: true }],
                            ['slider', 'Grid Size', 4, 24, 1, { key: `${fullId}_gridSize`, value: 12, withNumber: true }]
                        ];
                    case 'linearGrating':
                    case 'radialGrating':
                        return [
                            ['slider', 'Frequency', 1, 50, 1, { key: `${fullId}_frequency`, value: 10, withNumber: true }],
                            ['slider', 'Rotation', 0, 360, 1, { key: `${fullId}_rotation`, value: 0, withNumber: true }]
                        ];
                    case 'angularGrating':
                        return [
                            ['slider', 'Petals (n)', 3, 24, 1, { key: `${fullId}_n`, value: 6, withNumber: true }],
                            ['slider', 'Phase', 0, 360, 1, { key: `${fullId}_phase`, value: 0, withNumber: true }]
                        ];
                    case 'spiralGrating':
                        return [
                            ['slider', 'Wavelength', 5, 50, 1, { key: `${fullId}_wavelength`, value: 20, withNumber: true }],
                            ['slider', 'Spiral Rate', 0.01, 0.5, 0.01, { key: `${fullId}_spiralRate`, value: 0.1, withNumber: true, precision: 2 }],
                            ['slider', 'Phase', 0, 360, 1, { key: `${fullId}_phase`, value: 0, withNumber: true }]
                        ];
                    case 'moire':
                        return [
                            ['slider', 'Frequency 1', 5, 50, 1, { key: `${fullId}_freq1`, value: 10, withNumber: true }],
                            ['slider', 'Frequency 2', 5, 50, 1, { key: `${fullId}_freq2`, value: 12, withNumber: true }],
                            ['slider', 'Angle', 0, 90, 1, { key: `${fullId}_angle`, value: 15, withNumber: true }]
                        ];
                    case 'halftone':
                        return [
                            ['slider', 'Line Spacing', 4, 20, 1, { key: `${fullId}_spacing`, value: 8, withNumber: true }],
                            ['slider', 'Angle', 0, 90, 1, { key: `${fullId}_angle`, value: 45, withNumber: true }]
                        ];
                    case 'crossHatch':
                        return [
                            ['slider', 'Line Spacing', 4, 20, 1, { key: `${fullId}_spacing`, value: 8, withNumber: true }]
                        ];
                    case 'contourLattice':
                        return [
                            ['slider', 'Lattice Size', 4, 20, 1, { key: `${fullId}_latticeSize`, value: 10, withNumber: true }],
                            ['slider', 'Line Width', 1, 5, 0.5, { key: `${fullId}_lineWidth`, value: 2, withNumber: true, precision: 1 }]
                        ];
                    case 'dyadicHalftone':
                        return [
                            ['slider', 'Depth', 1, 6, 1, { key: `${fullId}_depth`, value: 4, withNumber: true }]
                        ];
                    case 'superellipse':
                        return [
                            ['slider', 'Width (a)', 50, 200, 10, { key: `${fullId}_a`, value: 100, withNumber: true }],
                            ['slider', 'Height (b)', 50, 200, 10, { key: `${fullId}_b`, value: 100, withNumber: true }],
                            ['slider', 'Exponent (n)', 0.5, 8, 0.5, { key: `${fullId}_n`, value: 2.5, withNumber: true, precision: 1 }]
                        ];
                    default:
                        return common;
                }

            case 'spaceFilling':
                return [
                    ['slider', 'Order', 1, 7, 1, { key: `${fullId}_order`, value: 5, withNumber: true }],
                    ...common
                ];

            case 'tsp':
                return [
                    ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                    ['slider', 'Points', 12, 240, 12, { key: `${fullId}_points`, value: 80, withNumber: true }],
                    ['button', 'Play', () => handlePlaybackAction(fullId, 'play'), { key: `${fullId}_play` }],
                    ['button', 'Step', () => handlePlaybackAction(fullId, 'step'), { key: `${fullId}_step` }],
                    ['button', 'Reset', () => handlePlaybackAction(fullId, 'reset'), { key: `${fullId}_reset` }]
                ];

            case 'edges':
                switch (algoId) {
                    case 'canny':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Low Threshold', 0.01, 0.2, 0.01, { key: `${fullId}_lowThreshold`, value: 0.05, withNumber: true, precision: 2 }],
                            ['slider', 'High Threshold', 0.05, 0.4, 0.01, { key: `${fullId}_highThreshold`, value: 0.15, withNumber: true, precision: 2 }],
                            ['slider', 'Gaussian σ', 0.5, 3.0, 0.1, { key: `${fullId}_sigma`, value: 1.4, withNumber: true, precision: 1 }]
                        ];
                    case 'laplacianOfGaussian':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Gaussian σ', 0.5, 5.0, 0.5, { key: `${fullId}_sigma`, value: 2.0, withNumber: true, precision: 1 }]
                        ];
                    case 'differenceOfGaussians':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'σ1 (small)', 0.5, 3.0, 0.1, { key: `${fullId}_sigma1`, value: 1.0, withNumber: true, precision: 1 }],
                            ['slider', 'σ2 (large)', 1.0, 5.0, 0.5, { key: `${fullId}_sigma2`, value: 2.0, withNumber: true, precision: 1 }]
                        ];
                    case 'structureTensor':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Window σ', 0.5, 3.0, 0.1, { key: `${fullId}_sigma`, value: 1.5, withNumber: true, precision: 1 }]
                        ];
                    case 'laplacian':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['toggle', 'Kernel', ['4-connected', '8-connected'], { key: `${fullId}_kernel`, value: '4-connected' }]
                        ];
                    case 'zeroCrossings':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Threshold', 0, 0.5, 0.01, { key: `${fullId}_threshold`, value: 0.05, withNumber: true, precision: 2 }]
                        ];
                    default:
                        // Sobel, Scharr, Prewitt, Roberts Cross, Dominant Orientation - no parameters
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }]
                        ];
                }

            case 'filtering':
                switch (algoId) {
                    case 'gaussian':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Gaussian σ', 0.5, 5.0, 0.5, { key: `${fullId}_sigma`, value: 1.5, withNumber: true, precision: 1 }],
                            ['slider', 'Kernel Size', 3, 15, 2, { key: `${fullId}_kernelSize`, value: 5, withNumber: true }]
                        ];
                    case 'bilateral':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Spatial σd', 1, 10, 1, { key: `${fullId}_sigmaSpatial`, value: 3, withNumber: true }],
                            ['slider', 'Range σr', 0.01, 0.3, 0.01, { key: `${fullId}_sigmaRange`, value: 0.1, withNumber: true, precision: 2 }]
                        ];
                    case 'median':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Kernel Size', 3, 9, 2, { key: `${fullId}_kernelSize`, value: 3, withNumber: true }]
                        ];
                    default:
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }]
                        ];
                }

            case 'segmentation':
                switch (algoId) {
                    case 'otsu':
                        // Otsu is automatic - no parameters
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }]
                        ];
                    case 'connectedComponents':
                    case 'floodFill':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }]
                        ];
                    default:
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }]
                        ];
                }

            case 'curves':
                return [
                    ['slider', 'Points', 8, 100, 4, { key: `${fullId}_points`, value: 32, withNumber: true }],
                    ['slider', 'Scale', 0.5, 2.0, 0.1, { key: `${fullId}_scale`, value: 1.0, withNumber: true, precision: 1 }]
                ];

            case 'distance':
                switch (algoId) {
                    case 'jfa':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Seeds', 4, 64, 4, { key: `${fullId}_seeds`, value: 12, withNumber: true }]
                        ];
                    case 'geodesic':
                        return [
                            ['slider', 'Seeds', 2, 20, 2, { key: `${fullId}_seeds`, value: 4, withNumber: true }]
                        ];
                    default:
                        return [
                            ['slider', 'Seeds', 4, 64, 4, { key: `${fullId}_seeds`, value: 12, withNumber: true }]
                        ];
                }

            case 'vectorization':
                return [
                    ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                    ['slider', 'Threshold', 0.1, 0.9, 0.1, { key: `${fullId}_threshold`, value: 0.5, withNumber: true, precision: 1 }]
                ];

            case 'graphs':
                return [
                    ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                    ['slider', 'Points', 20, 200, 20, { key: `${fullId}_points`, value: 80, withNumber: true }]
                ];

            case 'optics':
                switch (algoId) {
                    case 'thinFilm':
                    case 'twoBeam':
                        return [
                            ['slider', 'Thickness (nm)', 100, 1000, 50, { key: `${fullId}_thickness`, value: 500, withNumber: true }],
                            ['slider', 'Ref. Index', 1.0, 3.0, 0.1, { key: `${fullId}_refIndex`, value: 1.5, withNumber: true, precision: 1 }]
                        ];
                    case 'birefringence':
                    case 'conoscopy':
                        return [
                            ['slider', 'Birefringence', 0.001, 0.1, 0.001, { key: `${fullId}_birefringence`, value: 0.01, withNumber: true, precision: 3 }],
                            ['slider', 'Thickness (µm)', 10, 100, 10, { key: `${fullId}_thickness`, value: 50, withNumber: true }]
                        ];
                    default:
                        return common;
                }

            case 'physics':
                switch (algoId) {
                    case 'wave1D':
                    case 'wave2D':
                        return [
                            ['slider', 'Damping', 0, 0.1, 0.01, { key: `${fullId}_damping`, value: algoId === 'wave1D' ? 0.02 : 0.01, withNumber: true, precision: 2 }],
                            ['slider', 'Speed', 0.5, 2.0, 0.1, { key: `${fullId}_speed`, value: 1.0, withNumber: true, precision: 1 }],
                            ['button', 'Play', () => handlePlaybackAction(fullId, 'play'), { key: `${fullId}_play` }],
                            ['button', 'Step', () => handlePlaybackAction(fullId, 'step'), { key: `${fullId}_step` }],
                            ['button', 'Reset', () => handlePlaybackAction(fullId, 'reset'), { key: `${fullId}_reset` }]
                        ];
                    case 'advection':
                    case 'streamline':
                        return [
                            ['slider', 'Time Step', 0.01, 0.5, 0.01, { key: `${fullId}_dt`, value: 0.1, withNumber: true, precision: 2 }],
                            ['slider', 'Max Steps', 10, 200, 10, { key: `${fullId}_maxSteps`, value: 100, withNumber: true }],
                            ['button', 'Play', () => handlePlaybackAction(fullId, 'play'), { key: `${fullId}_play` }],
                            ['button', 'Step', () => handlePlaybackAction(fullId, 'step'), { key: `${fullId}_step` }],
                            ['button', 'Reset', () => handlePlaybackAction(fullId, 'reset'), { key: `${fullId}_reset` }]
                        ];
                    default:
                        return common;
                }

            case 'reactionDiffusion':
                switch (algoId) {
                    case 'grayScott':
                        return [
                            ['slider', 'Max Steps', 10, 500, 10, { key: `${fullId}_maxSteps`, value: 300, withNumber: true }],
                            ['slider', 'Feed', 0.01, 0.09, 0.001, { key: `${fullId}_feed`, value: 0.055, withNumber: true, precision: 3 }],
                            ['slider', 'Kill', 0.01, 0.09, 0.001, { key: `${fullId}_kill`, value: 0.062, withNumber: true, precision: 3 }],
                            ['button', 'Play', () => handlePlaybackAction(fullId, 'play'), { key: `${fullId}_play` }],
                            ['button', 'Step', () => handlePlaybackAction(fullId, 'step'), { key: `${fullId}_step` }],
                            ['button', 'Reset', () => handlePlaybackAction(fullId, 'reset'), { key: `${fullId}_reset` }]
                        ];
                    case 'turing':
                        return [
                            ['slider', 'Steps', 10, 500, 10, { key: `${fullId}_steps`, value: 120, withNumber: true }],
                            ['slider', 'Activator Rate', 0.5, 3.0, 0.1, { key: `${fullId}_activator`, value: 1.0, withNumber: true, precision: 1 }],
                            ['slider', 'Inhibitor Rate', 0.5, 3.0, 0.1, { key: `${fullId}_inhibitor`, value: 2.0, withNumber: true, precision: 1 }]
                        ];
                    case 'gameOfLife':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Steps', 10, 200, 10, { key: `${fullId}_steps`, value: 50, withNumber: true }]
                        ];
                    case 'cellularAutomaton':
                        return [
                            ['number', 'Seed', 0, 9999, 1, { key: `${fullId}_seed`, value: 0, withNumber: true }],
                            ['slider', 'Rule', 0, 255, 1, { key: `${fullId}_rule`, value: 30, withNumber: true }],
                            ['slider', 'Steps', 10, 200, 10, { key: `${fullId}_steps`, value: 50, withNumber: true }]
                        ];
                    default:
                        return common;
                }

            case 'quantization':
                switch (algoId) {
                    case 'posterize':
                    case 'posterizeGamma':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Levels', 2, 16, 1, { key: `${fullId}_levels`, value: 4, withNumber: true }]
                        ];
                    case 'dither':
                    case 'bayerDither':
                        return [
                            ['button', 'New Image', () => handleFetchNewImage(fullId), { key: `${fullId}_fetchImage` }],
                            ['slider', 'Threshold', 0, 1, 0.1, { key: `${fullId}_threshold`, value: 0.5, withNumber: true, precision: 1 }]
                        ];
                    default:
                        return common;
                }

            // Add more domains as needed
            default:
                return common;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPERS — CANVAS VIEW TABS
    // ═══════════════════════════════════════════════════════════════════════

    async function setMode(tool, mode) {
        state.viewMode = mode;
        const isOutput = mode === 'output';
        toggleAboutPanel(tool, !isOutput);
        
        // Update ABOUT panel content when switching to it
        if (!isOutput) {
            await updateAboutPanel(tool);
        }
        
        tool.draw();
        if (tool.components.has('modeTabs')) {
            const comp = tool.components.get('modeTabs');
            const target = isOutput ? 'output' : 'about';
            if (comp && comp.setActive) comp.setActive(target);
            if (comp && comp.setActiveTab) comp.setActiveTab(target);
        }
    }

    function toggleAboutPanel(tool, show) {
        if (!tool || !tool.canvasWrapper) return;
        tool.canvasWrapper.style.display = show ? 'none' : 'flex';
        if (tool.statusEl) {
            tool.statusEl.style.display = show ? 'none' : 'block';
        }
        if (state.aboutPanel) {
            state.aboutPanel.style.display = show ? 'flex' : 'none';
        }
    }

    async function updateAboutPanel(tool) {
        if (!tool || !tool.canvasArea) return;
        const F = tool.F || 14;
        
        // Create panel if it doesn't exist
        if (!state.aboutPanel) {
            const panel = new window.ComponentLibrary.Panel({
                className: 'about-panel',
                content: '' // Will be filled dynamically
            });
            const panelElement = panel.render();
            // Position as overlay on the main tool container
            panelElement.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                pointer-events: auto;
            `;
            tool.element.appendChild(panelElement);
            state.aboutPanel = panelElement;
        }

        // Show loading state
        state.aboutPanel.innerHTML = '<div style="padding: 28px; font-family: \'Atkinson Hyperlegible\', monospace;">Loading documentation...</div>';

        // Use the currently selected algorithm from state
        const currentAlgoId = state.selectedAlgorithmId || state.selectedId;
        
        if (!currentAlgoId) {
            state.aboutPanel.innerHTML = '<div style="padding: 28px; font-family: \'Atkinson Hyperlegible\', monospace;">Select an algorithm to view documentation.</div>';
            return;
        }

        // Try to load documentation if available
        if (ALGORITHM_DOCS_MAP[currentAlgoId]) {
            const docPath = ALGORITHM_DOCS_MAP[currentAlgoId];
            try {
                const response = await fetch(docPath, { cache: 'no-cache' });
                if (!response.ok) throw new Error(`Failed to fetch: ${docPath}`);
                const markdownText = await response.text();

                state.aboutPanel.innerHTML = '';
                const markdownComponent = new window.ComponentLibrary.MarkdownBody({ markdownText });
                const renderedElement = markdownComponent.render();
                state.aboutPanel.appendChild(renderedElement);
            } catch (error) {
                console.error(`Error loading markdown from ${docPath}:`, error);
                state.aboutPanel.innerHTML = `<div style="padding: 28px; font-family: 'Atkinson Hyperlegible', monospace; color: var(--vga-red);">Failed to load documentation.</div>`;
            }
        } else {
            const meta = ALGORITHM_MAP[currentAlgoId];
            const algoTitle = meta ? meta.title : 'this algorithm';
            state.aboutPanel.innerHTML = `<div style="padding: 28px; font-family: 'Atkinson Hyperlegible', monospace;">
                <p>Documentation for ${algoTitle} is not yet available.</p>
                <p style="opacity: 0.7; margin-top: 14px;">Algorithm ID: ${currentAlgoId}</p>
            </div>`;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERERS
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Main render function - uses state.selectedAlgorithmId to determine what to render
     */
    async function renderAlgorithm(ctx, canvas, values) {
        // Use the selected algorithm from state
        let activeAlgoId = state.selectedAlgorithmId;
        
        if (!activeAlgoId) {
            // Default to first algorithm in current page
            const page = PAGES.find(p => p.id === state.selectedPageId);
            if (page && page.domains[0] && page.domains[0].algorithms[0]) {
                const domain = page.domains[0];
                const algo = domain.algorithms[0];
                activeAlgoId = `${page.id}.${domain.id}.${algo.id}`;
                state.selectedAlgorithmId = activeAlgoId;
            } else {
                renderFallback(ctx, canvas, 'No algorithm selected');
                return;
            }
        }
        
        // CENTRALIZED CHECK: If algorithm doesn't exist, show N/A
        if (!algorithmExists(activeAlgoId)) {
            const meta = ALGORITHM_MAP[activeAlgoId];
            const displayName = meta ? meta.title : activeAlgoId;
            renderNA(ctx, canvas, displayName);
            return;
        }
        
        // Collect parameter values for the selected algorithm
        const activeValues = {};
        const prefix = `${activeAlgoId}_`;
        for (const key in values) {
            if (key.startsWith(prefix)) {
                const paramName = key.replace(prefix, '');
                activeValues[paramName] = values[key];
            }
        }
        
        // Parse algorithm ID
        const parts = activeAlgoId.split('.');
        const [pageId, domainId, algoId] = parts;
        
        // Route to appropriate renderer based on domain
        // Some renderers are async (image processing), others are sync
        switch (domainId) {
            case 'noise':
                renderNoise(algoId, ctx, canvas, activeValues);
                break;
            case 'sampling':
                renderSampling(algoId, ctx, canvas, activeValues);
                break;
            case 'patterns':
                renderPatterns(algoId, ctx, canvas, activeValues);
                break;
            case 'edges':
                await renderEdges(algoId, ctx, canvas, activeValues);
                break;
            case 'segmentation':
                await renderSegmentation(algoId, ctx, canvas, activeValues);
                break;
            case 'curves':
                renderCurves(algoId, ctx, canvas, activeValues);
                break;
            case 'distance':
                renderDistance(algoId, ctx, canvas, activeValues);
                break;
            case 'vectorization':
                await renderVectorization(algoId, ctx, canvas, activeValues);
                break;
            case 'spaceFilling':
                renderSpaceFilling(algoId, ctx, canvas, activeValues);
                break;
            case 'tsp':
                renderTSP(algoId, ctx, canvas, activeValues);
                break;
            case 'graphs':
                renderGraphs(algoId, ctx, canvas, activeValues);
                break;
            case 'optics':
                renderOptics(algoId, ctx, canvas, activeValues);
                break;
            case 'physics':
                renderPhysics(algoId, ctx, canvas, activeValues);
                break;
            case 'reactionDiffusion':
                renderReactionDiffusion(algoId, ctx, canvas, activeValues);
                break;
            case 'quantization':
                await renderQuantization(algoId, ctx, canvas, activeValues);
                break;
            default:
                // All other domains not implemented - already caught by algorithmExists()
                renderNA(ctx, canvas, `${domainId}.${algoId}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    function renderFallback(ctx, canvas, text) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Atkinson Hyperlegible", monospace';
        ctx.fillText(text, 16, 32);
    }
    
    /**
     * Render N/A message for unimplemented algorithms
     */
    function renderNA(ctx, canvas, algorithmName) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#808080';
        ctx.font = '24px "Atkinson Hyperlegible", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N/A', canvas.width / 2, canvas.height / 2);
        ctx.font = '12px "Atkinson Hyperlegible", monospace';
        ctx.fillText(`${algorithmName} not implemented`, canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    /**
     * Check if an algorithm is implemented in the algorithms library
     * @param {string} fullAlgoId - Full algorithm ID (e.g., "page1.noise.simplex2D")
     * @returns {boolean} True if algorithm exists in library
     */
    function algorithmExists(fullAlgoId) {
        if (!fullAlgoId || !Algorithms) return false;
        
        const parts = fullAlgoId.split('.');
        if (parts.length < 3) return false;
        
        const domainId = parts[1];
        const algoId = parts[2];

        const A = Algorithms;
        
        // Direct checks for each domain - return true if renderer exists
        // We check if the domain namespace exists, not necessarily the exact function
        switch (domainId) {
            case 'noise':
                return !!(A.Noise && (A.Noise[algoId] || ['perlin2D', 'simplex2D', 'fbm2D', 'domainWarp2D', 'multiWarp2D'].includes(algoId)));
            case 'sampling':
                return !!(A.Sampling && (A.Sampling[algoId] || ['poissonDisk', 'variablePoissonDisk', 'haltonSequence', 'hammersleySet', 'sobolSequence', 'stratifiedSampling', 'jitteredGrid', 'lloydRelaxation', 'importanceSampling', 'weightedPoissonDisk'].includes(algoId)));
            case 'patterns':
                return !!(A.Patterns || A.HalftonePatterns);
            case 'edges':
                return !!(A.EdgeDetection);
            case 'segmentation':
                return !!(A.Segmentation);
            case 'curves':
                return !!(A.CurveGeometry);
            case 'distance':
                return !!(A.Distance || A.SDF || A.Geodesic);
            case 'vectorization':
                return !!(A.MarchingSquares);
            case 'spaceFilling':
                return !!(A.SpaceFilling);
            case 'tsp':
                return !!(A.TSP);
            case 'graphs':
                return !!(A.SpatialIndex);
            case 'optics':
                return !!(A.Optics);
            case 'physics':
                return !!(A.WaveSolver || A.Advection);
            case 'reactionDiffusion':
                return !!(A.ReactionDiffusion);
            case 'quantization':
                return !!(A.Posterization);
            default:
                return false;
        }
    }

    function paletteIndex(v) {
        const clamped = Math.max(0, Math.min(1, v));
        return Math.min(VGA.length - 1, Math.floor(clamped * (VGA.length - 1)));
    }

    /**
     * Render noise algorithms
     * @param {string} algoId - Algorithm ID (e.g., 'simplex2D', 'fbm2D')
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
     * @param {object} values - Parameter values (scale, seed, etc.)
     */
    function renderNoise(algoId, ctx, canvas, values) {
        const scale = values.scale || 1.0;
        const seed = values.seed !== undefined ? values.seed : 0;
        const step = 4;
        
        // Seed the noise if available
        if (A.Noise?.seedNoise) {
            A.Noise.seedNoise(seed);
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                let n = 0;
                
                switch (algoId) {
                    case 'perlin2D':
                        if (A.Noise?.perlin2D) {
                            n = A.Noise.perlin2D(x * 0.01 * scale, y * 0.01 * scale);
                        }
                        break;
                    
                    case 'simplex2D':
                        if (A.Noise?.simplex2D) {
                            n = A.Noise.simplex2D(x * 0.01 * scale, y * 0.01 * scale);
                        }
                        break;
                    
                    case 'fbm2D':
                        if (A.Noise?.fbm2D) {
                            const octaves = values.octaves || 4;
                            const lacunarity = values.lacunarity || 2.0;
                            const persistence = values.persistence || 0.5;
                            n = A.Noise.fbm2D(x * 0.005 * scale, y * 0.005 * scale, { octaves, lacunarity, persistence });
                        }
                        break;
                    
                    case 'domainWarp2D':
                        if (A.Noise?.domainWarp2D && A.Noise?.simplex2D) {
                            const strength = values.strength || 25;
                            const warped = A.Noise.domainWarp2D(x, y, { strength: strength * scale, scale: 0.01 });
                            n = A.Noise.simplex2D(warped.x * 0.02, warped.y * 0.02);
                        }
                        break;
                    
                    case 'multiWarp2D':
                        if (A.Noise?.multiWarp2D && A.Noise?.simplex2D) {
                            const strength = values.strength || 25;
                            const warped = A.Noise.multiWarp2D(x, y, { strength: strength * scale, scale: 0.01 });
                            n = A.Noise.simplex2D(warped.x * 0.02, warped.y * 0.02);
                        }
                        break;
                }
                
                const idx = paletteIndex((n + 1) * 0.5);
                ctx.fillStyle = VGA[idx];
                ctx.fillRect(x, y, step, step);
            }
        }
    }

    /**
     * Render sampling algorithms
     */
    function renderSampling(algoId, ctx, canvas, values) {
        const count = values.count || 120;
        const seed = values.seed !== undefined ? values.seed : 0;
        const rng = A.MathUtils?.seededRandom ? A.MathUtils.seededRandom(seed) : Math.random;
        const points = [];
        
        switch (algoId) {
            case 'poissonDisk':
                if (A.Sampling?.poissonDisk) {
                    const minDist = values.minDist || 18;
                    const k = values.k || 30;
                    const res = A.Sampling.poissonDisk(canvas.width, canvas.height, minDist, k, rng);
                    res.forEach(p => points.push({ x: p.x, y: p.y }));
                }
                break;
            
            case 'variablePoissonDisk':
                if (A.Sampling?.variablePoissonDisk) {
                    const minDist = values.minDist || 10;
                    const maxDist = values.maxDist || 30;
                    const k = values.k || 30;
                    // Use simple density function (center-weighted)
                    const densityFn = (x, y) => {
                        const dx = x - canvas.width / 2;
                        const dy = y - canvas.height / 2;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        return 1 - (dist / (canvas.width / 2));
                    };
                    const res = A.Sampling.variablePoissonDisk(canvas.width, canvas.height, densityFn, minDist, maxDist, k, rng);
                    res.forEach(p => points.push({ x: p.x, y: p.y }));
                }
                break;
            
            case 'haltonSequence':
                if (A.Sampling?.haltonSequence) {
                    const base1 = values.base1 || 2;
                    const base2 = values.base2 || 3;
                    const seq = A.Sampling.haltonSequence(count, base1, base2);
                    seq.forEach(([u, v]) => points.push({ x: u * canvas.width, y: v * canvas.height }));
                }
                break;
            
            case 'hammersleySet':
                if (A.Sampling?.hammersleySet) {
                    const base = values.base || 2;
                    const seq = A.Sampling.hammersleySet(count, base);
                    seq.forEach(([u, v]) => points.push({ x: u * canvas.width, y: v * canvas.height }));
                }
                break;
            
            case 'sobolSequence':
                if (A.Sampling?.sobolSequence) {
                    const seq = A.Sampling.sobolSequence(count);
                    seq.forEach(([u, v]) => points.push({ x: u * canvas.width, y: v * canvas.height }));
                }
                break;
            
            case 'stratifiedSampling':
                if (A.Sampling?.stratifiedSampling) {
                    const nx = values.nx || 8;
                    const ny = values.ny || 8;
                    const res = A.Sampling.stratifiedSampling(canvas.width, canvas.height, nx, ny, rng);
                    res.forEach(p => points.push({ x: p.x, y: p.y }));
                }
                break;
            
            case 'jitteredGrid':
                if (A.Sampling?.jitteredGrid) {
                    const nx = values.nx || 8;
                    const ny = values.ny || 8;
                    const jitter = values.jitter !== undefined ? values.jitter : 0.5;
                    const res = A.Sampling.jitteredGrid(canvas.width, canvas.height, nx, ny, jitter, rng);
                    res.forEach(p => points.push({ x: p.x, y: p.y }));
                }
                break;
            
            case 'lloydRelaxation':
                if (A.Sampling?.lloydRelaxation) {
                    const iterations = values.iterations || 3;
                    // Start with seeded random points, then relax
                    const initial = [];
                    for (let i = 0; i < count; i++) {
                        initial.push([rng() * canvas.width, rng() * canvas.height]);
                    }
                    const relaxed = A.Sampling.lloydRelaxation(initial, canvas.width, canvas.height, iterations);
                    relaxed.forEach(p => points.push({ x: p[0], y: p[1] }));
                }
                break;
            
            case 'importanceSampling':
                if (A.Sampling?.importanceSampling) {
                    // Use simple importance function (center-weighted)
                    const importanceFn = (x, y) => {
                        const dx = x - canvas.width / 2;
                        const dy = y - canvas.height / 2;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        return Math.max(0, 1 - dist / (canvas.width / 2));
                    };
                    const sampled = A.Sampling.importanceSampling(count, canvas.width, canvas.height, importanceFn, rng);
                    sampled.forEach(p => points.push({ x: p[0], y: p[1] }));
                }
                break;
            
            case 'weightedPoissonDisk':
                if (A.Sampling?.weightedPoissonDisk) {
                    const baseMinDist = values.baseMinDist || 15;
                    const k = values.k || 30;
                    // Use simple weight function (center-weighted)
                    const weightFn = (x, y) => {
                        const dx = x - canvas.width / 2;
                        const dy = y - canvas.height / 2;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        return 1 + (dist / (canvas.width / 2));  // Denser at center
                    };
                    const res = A.Sampling.weightedPoissonDisk(canvas.width, canvas.height, weightFn, baseMinDist, k, rng);
                    res.forEach(p => points.push({ x: p.x, y: p.y }));
                }
                break;
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        points.forEach(p => {
            ctx.fillRect(Math.floor(p.x) - 1, Math.floor(p.y) - 1, 3, 3);
        });
    }

    /**
     * Render space-filling curve algorithms
     */
    function renderSpaceFilling(algoId, ctx, canvas, values) {
        const order = values.order || 5;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let pts = [];
        switch (algoId) {
            case 'hilbert':
                pts = A.SpaceFilling?.HilbertCurve?.generate ? A.SpaceFilling.HilbertCurve.generate(order) : [];
                break;
            case 'peano':
                pts = A.SpaceFilling?.PeanoCurve?.generate ? A.SpaceFilling.PeanoCurve.generate(order) : [];
                break;
            case 'moore':
                pts = A.SpaceFilling?.MooreCurve?.generate ? A.SpaceFilling.MooreCurve.generate(order) : [];
                break;
            case 'zOrder':
                pts = A.SpaceFilling?.ZOrderCurve?.generate ? A.SpaceFilling.ZOrderCurve.generate(order) : [];
                break;
            case 'lSystem':
                if (A.SpaceFilling?.LSystem?.generate) {
                    pts = A.SpaceFilling.LSystem.generate(order);
                } else {
                    renderFallback(ctx, canvas, 'L-System - algorithm pending');
                    return;
                }
                break;
            default:
                renderFallback(ctx, canvas, `Space-filling: ${algoId} - pending`);
                return;
        }
        
        if (!pts.length) return;
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        pts.forEach((p, i) => {
            const x = p.x * canvas.width;
            const y = p.y * canvas.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    /**
     * Render TSP algorithms
     */
    function renderTSP(algoId, ctx, canvas, values) {
        const points = values.points || 80;
        const seed = values.seed !== undefined ? values.seed : 0;
        const rng = A.MathUtils?.seededRandom ? A.MathUtils.seededRandom(seed) : Math.random;
        
        // Generate random points (seeded)
        const pts = [];
        for (let i = 0; i < points; i++) {
            pts.push({ x: rng() * canvas.width, y: rng() * canvas.height });
        }
        
        // Check if animation exists and matches parameters
        const animId = `tsp_${algoId}_${seed}_${points}`;
        const needsInit = !animationState.instance || animationState.instance.algoId !== animId;
        
        // For 2-Opt, use animation
        if (algoId === 'twoOpt' && A.TSP?.nearestNeighbor) {
            if (needsInit) {
                // Calculate path length helper
                const calcLength = (pts, path) => {
                    let len = 0;
                    for (let i = 0; i < path.length; i++) {
                        const a = pts[path[i]];
                        const b = pts[path[(i + 1) % path.length]];
                        len += Math.hypot(b.x - a.x, b.y - a.y);
                    }
                    return len;
                };
                
                animationState.instance = new AnimatedAlgorithm(
                    animId,
                    // Init: Start with nearest neighbor tour
                    (params) => {
                        const nnResult = A.TSP.nearestNeighbor(params.points);
                        const initialPath = nnResult.path || nnResult;
                        return {
                            points: params.points,
                            path: initialPath,
                            iteration: 0,
                            improved: true,
                            pathLength: calcLength(params.points, initialPath)
                        };
                    },
                    // Step: Try one 2-opt swap
                    (state) => {
                        if (!state.improved) return { ...state, improved: false };
                        
                        const n = state.points.length;
                        const pts = state.points;
                        
                        // Try all edge pairs (one full pass per step)
                        for (let i = 0; i < n - 2; i++) {
                            for (let j = i + 2; j < n; j++) {
                                if (i === 0 && j === n - 1) continue;
                                
                                const a = state.path[i];
                                const b = state.path[i + 1];
                                const c = state.path[j];
                                const d = state.path[(j + 1) % n];
                                
                                const currentDist = Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y) + 
                                                   Math.hypot(pts[c].x - pts[d].x, pts[c].y - pts[d].y);
                                const newDist = Math.hypot(pts[a].x - pts[c].x, pts[a].y - pts[c].y) + 
                                               Math.hypot(pts[b].x - pts[d].x, pts[b].y - pts[d].y);
                                
                                if (newDist < currentDist - 0.001) {
                                    // Found improvement! Reverse segment [i+1, j]
                                    const newPath = [...state.path];
                                    let left = i + 1;
                                    let right = j;
                                    while (left < right) {
                                        [newPath[left], newPath[right]] = [newPath[right], newPath[left]];
                                        left++;
                                        right--;
                                    }
                                    return {
                                        points: state.points,
                                        path: newPath,
                                        iteration: state.iteration + 1,
                                        improved: true,
                                        pathLength: calcLength(pts, newPath),
                                        lastSwap: {i, j}
                                    };
                                }
                            }
                        }
                        
                        // No improvement found - done
                        return {
                            ...state,
                            iteration: state.iteration + 1,
                            improved: false
                        };
                    },
                    // Render
                    (ctx, canvas, state) => {
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Draw path
                        ctx.strokeStyle = state.improved ? '#00ffff' : '#00ff00';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        state.path.forEach((idx, i) => {
                            const p = state.points[idx];
                            if (i === 0) ctx.moveTo(p.x, p.y);
                            else ctx.lineTo(p.x, p.y);
                        });
                        const first = state.points[state.path[0]];
                        ctx.lineTo(first.x, first.y);
                        ctx.stroke();
                        
                        // Draw points
                        ctx.fillStyle = '#ff0000';
                        state.path.forEach(idx => {
                            const p = state.points[idx];
                            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
                        });
                        
                        // Draw stats
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '14px "Atkinson Hyperlegible", monospace';
                        ctx.fillText(`Iteration: ${state.iteration}`, 10, 20);
                        ctx.fillText(`Length: ${Math.round(state.pathLength)}`, 10, 40);
                        ctx.fillText(state.improved ? 'Optimizing...' : 'Complete!', 10, 60);
                    },
                    // Is complete
                    (state) => !state.improved || state.iteration >= 100
                );
                
                animationState.instance.init({ points: pts });
                animationState.frameRate = 10;
            }
            
            // Render animation state
            if (animationState.instance && animationState.instance.state) {
                animationState.instance.render(ctx, canvas);
            }
            return;
        }
        
        // Non-animated algorithms (nearestNeighbor, christofides)
        let order = pts.map((_, i) => i);
        let pathLength = 0;
        
        switch (algoId) {
            case 'nearestNeighbor':
                if (A.TSP?.nearestNeighbor) {
                    const result = A.TSP.nearestNeighbor(pts);
                    order = result.path || result;
                    pathLength = result.length || 0;
                }
                break;
            
            case 'christofides':
                if (A.TSP?.christofides) {
                    const result = A.TSP.christofides(pts);
                    order = result.path || result;
                    pathLength = result.length || 0;
                } else {
                    if (A.TSP?.nearestNeighbor) {
                        const result = A.TSP.nearestNeighbor(pts);
                        order = result.path || result;
                        pathLength = result.length || 0;
                    }
                }
                break;
        }
        
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw path
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        order.forEach((idx, i) => {
            const p = pts[idx];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        if (order.length) {
            const first = pts[order[0]];
            ctx.lineTo(first.x, first.y);
        }
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#ff0000';
        order.forEach(idx => {
            const p = pts[idx];
            ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
        
        // Draw stats
        if (pathLength > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '14px "Atkinson Hyperlegible", monospace';
            ctx.fillText(`Length: ${Math.round(pathLength)}`, 10, 20);
        }
    }

    /**
     * Render pattern algorithms
     */
    function renderPatterns(algoId, ctx, canvas, values) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (algoId) {
            case 'truchet':
                if (!A.Patterns?.generateTruchetGrid || !A.Patterns?.getTruchetArcs) {
                    renderFallback(ctx, canvas, 'Truchet generator missing');
                    return;
                }
                const gridSize = values.gridSize || 12;
                const seed = values.seed || 7;
                const tiles = A.Patterns.generateTruchetGrid(gridSize, gridSize, seed);
                const tileSize = Math.min(canvas.width / gridSize, canvas.height / gridSize);

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = Math.max(1, tileSize * 0.2);

                for (let j = 0; j < gridSize; j++) {
                    for (let i = 0; i < gridSize; i++) {
                        const state = tiles[j * gridSize + i];
                        const arcs = A.Patterns.getTruchetArcs(i, j, state, tileSize);
                        arcs.forEach(arc => {
                            ctx.beginPath();
                            ctx.arc(arc.cx, arc.cy, arc.r, arc.startAngle, arc.endAngle);
                            ctx.stroke();
                        });
                    }
                }
                break;
            
            case 'linearGrating':
                if (A.Patterns?.linearGrating) {
                    const frequency = values.frequency || 10;
                    const rotation = values.rotation || 0;
                    const angleRad = (rotation * Math.PI) / 180;
                    const wavelength = canvas.width / frequency;
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const intensity = A.Patterns.linearGrating(x, y, wavelength, 0, angleRad);
                            const idx = paletteIndex(intensity);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'linearGrating - algorithm pending');
                }
                break;
            
            case 'radialGrating':
                if (A.Patterns?.radialGrating) {
                    const frequency = values.frequency || 10;
                    const wavelength = canvas.width / frequency;
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const intensity = A.Patterns.radialGrating(x, y, cx, cy, wavelength, 0);
                            const idx = paletteIndex(intensity);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'radialGrating - algorithm pending');
                }
                break;
            
            case 'moire':
                if (A.Patterns?.linearGrating && A.Patterns?.combineMoire) {
                    const freq1 = values.freq1 || 10;
                    const freq2 = values.freq2 || 12;
                    const angle = (values.angle || 15) * Math.PI / 180;
                    const wavelength1 = canvas.width / freq1;
                    const wavelength2 = canvas.width / freq2;
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const i1 = A.Patterns.linearGrating(x, y, wavelength1, 0, 0);
                            const i2 = A.Patterns.linearGrating(x, y, wavelength2, 0, angle);
                            const intensity = A.Patterns.combineMoire(i1, i2, 'product');
                            const idx = paletteIndex(intensity);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'Moiré - algorithm pending');
                }
                break;
            
            case 'halftone':
                if (A.HalftonePatterns?.lineHalftone) {
                    const angle = (values.angle || 45) * Math.PI / 180;
                    const spacing = values.spacing || 8;
                    
                    // Create synthetic luminance field (circular gradient for demo)
                    const luminance = new Float32Array(canvas.width * canvas.height);
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const maxDist = Math.sqrt(cx * cx + cy * cy);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const dx = x - cx;
                            const dy = y - cy;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            luminance[y * canvas.width + x] = dist / maxDist;
                        }
                    }
                    
                    const lines = A.HalftonePatterns.lineHalftone(canvas.width, canvas.height, luminance, {
                        angle,
                        spacing,
                        minWidth: 0.5,
                        maxWidth: spacing * 0.8
                    });
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = '#ffffff';
                    
                    lines.forEach(line => {
                        ctx.lineWidth = line.width;
                        ctx.beginPath();
                        ctx.moveTo(line.x1, line.y1);
                        ctx.lineTo(line.x2, line.y2);
                        ctx.stroke();
                    });
                } else {
                    renderFallback(ctx, canvas, 'Halftone - algorithm pending');
                }
                break;
            
            case 'angularGrating':
                if (A.Patterns?.angularGrating) {
                    const n = values.n || 6;
                    const phase = (values.phase || 0) * Math.PI / 180;
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const intensity = A.Patterns.angularGrating(x, y, cx, cy, n, phase);
                            const idx = paletteIndex(intensity);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'angularGrating - algorithm pending');
                }
                break;
            
            case 'spiralGrating':
                if (A.Patterns?.spiralGrating) {
                    const wavelength = values.wavelength || 20;
                    const spiralRate = values.spiralRate || 0.1;
                    const phase = (values.phase || 0) * Math.PI / 180;
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const intensity = A.Patterns.spiralGrating(x, y, cx, cy, wavelength, spiralRate, phase);
                            const idx = paletteIndex(intensity);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 1, 1);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'spiralGrating - algorithm pending');
                }
                break;
            
            case 'crossHatch':
                if (A.HalftonePatterns?.crossHatchHalftone) {
                    const spacing = values.spacing || 8;
                    
                    // Create synthetic luminance field
                    const luminance = new Float32Array(canvas.width * canvas.height);
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const maxDist = Math.sqrt(cx * cx + cy * cy);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const dx = x - cx;
                            const dy = y - cy;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            luminance[y * canvas.width + x] = dist / maxDist;
                        }
                    }
                    
                    const lines = A.HalftonePatterns.crossHatchHalftone(canvas.width, canvas.height, luminance, {
                        spacing,
                        minWidth: 0.5,
                        maxWidth: spacing * 0.8
                    });
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = '#ffffff';
                    
                    lines.forEach(line => {
                        ctx.lineWidth = line.width;
                        ctx.beginPath();
                        ctx.moveTo(line.x1, line.y1);
                        ctx.lineTo(line.x2, line.y2);
                        ctx.stroke();
                    });
                } else {
                    renderFallback(ctx, canvas, 'crossHatch - algorithm pending');
                }
                break;
            
            case 'contourLattice':
                if (A.HalftonePatterns?.contourAlignedLattice) {
                    const latticeSize = values.latticeSize || 10;
                    const lineWidth = values.lineWidth || 2;
                    
                    // Create synthetic field
                    const field = new Float32Array(canvas.width * canvas.height);
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const maxDist = Math.sqrt(cx * cx + cy * cy);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const dx = x - cx;
                            const dy = y - cy;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            field[y * canvas.width + x] = Math.sin(dist / 20) * 0.5 + 0.5;
                        }
                    }
                    
                    const lines = A.HalftonePatterns.contourAlignedLattice(field, canvas.width, canvas.height, {
                        spacing: latticeSize,
                        jitter: 0.2
                    });
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = lineWidth;
                    
                    lines.forEach(line => {
                        ctx.beginPath();
                        ctx.moveTo(line.x1, line.y1);
                        ctx.lineTo(line.x2, line.y2);
                        ctx.stroke();
                    });
                } else {
                    renderFallback(ctx, canvas, 'contourLattice - algorithm pending');
                }
                break;
            
            case 'dyadicHalftone':
                if (A.HalftonePatterns?.dyadicHalftone) {
                    const depth = values.depth || 4;
                    
                    // Create synthetic field
                    const field = new Float32Array(canvas.width * canvas.height);
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const maxDist = Math.sqrt(cx * cx + cy * cy);
                    
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const dx = x - cx;
                            const dy = y - cy;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            field[y * canvas.width + x] = dist / maxDist;
                        }
                    }
                    
                    const dots = A.HalftonePatterns.dyadicHalftone(field, canvas.width, canvas.height, {
                        baseSpacing: 8,
                        levels: depth
                    });
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#ffffff';
                    
                    dots.forEach(d => {
                        ctx.fillRect(d.x - d.size/2, d.y - d.size/2, d.size, d.size);
                    });
                } else {
                    renderFallback(ctx, canvas, 'dyadicHalftone - algorithm pending');
                }
                break;
            
            case 'superellipse':
                if (A.Patterns?.superellipsePoints) {
                    const a = values.a || 100;
                    const b = values.b || 100;
                    const n = values.n || 2.5;
                    const pts = A.Patterns.superellipsePoints(a, b, n, 128);
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    pts.forEach((p, i) => {
                        const x = cx + p.x;
                        const y = cy + p.y;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    ctx.closePath();
                    ctx.stroke();
                } else {
                    renderFallback(ctx, canvas, 'superellipse - algorithm pending');
                }
                break;
            
            default:
                renderFallback(ctx, canvas, `Pattern: ${algoId} - unknown`);
        }
    }


    /**
     * Render distance field algorithms
     */
    function renderDistance(algoId, ctx, canvas, values) {
        const seeds = values.seeds || 12;
        
        switch (algoId) {
            case 'jfa':
                if (!A.Distance?.jumpFloodAlgorithm || !A.Distance?.jfaToDistanceField) {
                    renderFallback(ctx, canvas, 'JFA algorithm not available');
                    return;
                }
                
                const size = 96;
                const mask = new Uint8Array(size * size);
                
                // Place random seed points
                for (let i = 0; i < seeds; i++) {
                    const sx = Math.floor(Math.random() * size);
                    const sy = Math.floor(Math.random() * size);
                    mask[sy * size + sx] = 255;
                }
                
                const seedMap = A.Distance.jumpFloodAlgorithm(mask, size, size);
                const dist = A.Distance.jfaToDistanceField(seedMap, size, size);

                const maxDist = Math.max(...dist);
                const cellW = canvas.width / size;
                const cellH = canvas.height / size;

                for (let y = 0; y < size; y++) {
                    for (let x = 0; x < size; x++) {
                        const d = dist[y * size + x] / maxDist;
                        const idx = paletteIndex(d);
                        ctx.fillStyle = VGA[idx];
                        ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                    }
                }

                // Draw seed points
                ctx.fillStyle = '#ff0000';
                for (let i = 0; i < mask.length; i++) {
                    if (mask[i] > 0) {
                        const sx = (i % size) * cellW;
                        const sy = Math.floor(i / size) * cellH;
                        ctx.fillRect(sx - 1, sy - 1, 3, 3);
                    }
                }
                break;
            
            case 'sdfPrimitives':
                if (A.SDF?.sdfCircle) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    const stepSize = 2;
                    
                    for (let y = 0; y < canvas.height; y += stepSize) {
                        for (let x = 0; x < canvas.width; x += stepSize) {
                            const dist = A.SDF.sdfCircle(x, y, cx, cy, 80);
                            const d = Math.max(0, Math.min(1, (dist + 50) / 100));
                            const idx = paletteIndex(d);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, stepSize, stepSize);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'SDF Primitives - algorithm pending');
                }
                break;
            
            case 'sdfBoolean':
                if (A.SDF?.sdfCircle && A.SDF?.sdfUnion) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    const cx1 = canvas.width * 0.4;
                    const cy1 = canvas.height / 2;
                    const cx2 = canvas.width * 0.6;
                    const cy2 = canvas.height / 2;
                    const stepSize2 = 2;
                    
                    for (let y = 0; y < canvas.height; y += stepSize2) {
                        for (let x = 0; x < canvas.width; x += stepSize2) {
                            const dist1 = A.SDF.sdfCircle(x, y, cx1, cy1, 60);
                            const dist2 = A.SDF.sdfCircle(x, y, cx2, cy2, 60);
                            const distUnion = A.SDF.sdfUnion(dist1, dist2);
                            const d = Math.max(0, Math.min(1, (distUnion + 50) / 100));
                            const idx = paletteIndex(d);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, stepSize2, stepSize2);
                        }
                    }
                } else {
                    renderFallback(ctx, canvas, 'SDF Boolean - algorithm pending');
                }
                break;
            
            case 'geodesic':
                // Geodesic distance on a surface
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                const sourcex = canvas.width / 2;
                const sourcey = canvas.height / 2;
                
                for (let y = 0; y < canvas.height; y += 2) {
                    for (let x = 0; x < canvas.width; x += 2) {
                        const dx = x - sourcex;
                        const dy = y - sourcey;
                        // Manhattan distance as approximation of geodesic
                        const geodist = (Math.abs(dx) + Math.abs(dy)) / (canvas.width / 2);
                        const d = Math.max(0, Math.min(1, geodist));
                        const idx = paletteIndex(d);
                        ctx.fillStyle = VGA[idx];
                        ctx.fillRect(x, y, 2, 2);
                    }
                }
                break;
                
            default:
                renderFallback(ctx, canvas, `Distance: ${algoId} - unknown`);
        }
    }

    /**
     * Render edge detection algorithms
     */
    async function renderEdges(algoId, ctx, canvas, values) {
        // Ensure we have a test image
        let img;
        try {
            img = await ensureTestImage(ctx, canvas);
        } catch (error) {
            renderFallback(ctx, canvas, 'Loading image...');
            return;
        }
        
        // Draw image to canvas to get pixel data
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale array
        const gray = new Float32Array(canvas.width * canvas.height);
        for (let i = 0; i < gray.length; i++) {
            gray[i] = data[i * 4] / 255;
        }
        
        let edges = null;
        
        switch (algoId) {
            case 'sobel':
                if (A.EdgeDetection?.sobel) {
                    edges = A.EdgeDetection.sobel(gray, canvas.width, canvas.height);
                }
                break;
            case 'canny':
                if (A.EdgeDetection?.canny) {
                    const lowThreshold = values.lowThreshold !== undefined ? values.lowThreshold : 0.05;
                    const highThreshold = values.highThreshold !== undefined ? values.highThreshold : 0.15;
                    const sigma = values.sigma !== undefined ? values.sigma : 1.4;
                    edges = A.EdgeDetection.canny(gray, canvas.width, canvas.height, { 
                        lowThreshold, 
                        highThreshold,
                        sigma 
                    });
                }
                break;
            case 'laplacian':
                if (A.EdgeDetection?.laplacian) {
                    edges = A.EdgeDetection.laplacian(gray, canvas.width, canvas.height);
                }
                break;
            case 'laplacianOfGaussian':
                if (A.EdgeDetection?.laplacianOfGaussian) {
                    const sigma = values.sigma !== undefined ? values.sigma : 2.0;
                    edges = A.EdgeDetection.laplacianOfGaussian(gray, canvas.width, canvas.height, sigma);
                }
                break;
            case 'differenceOfGaussians':
                if (A.EdgeDetection?.differenceOfGaussians) {
                    const sigma1 = values.sigma1 !== undefined ? values.sigma1 : 1.0;
                    const sigma2 = values.sigma2 !== undefined ? values.sigma2 : 2.0;
                    edges = A.EdgeDetection.differenceOfGaussians(gray, canvas.width, canvas.height, sigma1, sigma2);
                }
                break;
            case 'structureTensor':
                if (A.EdgeDetection?.structureTensor) {
                    const sigma = values.sigma !== undefined ? values.sigma : 1.5;
                    edges = A.EdgeDetection.structureTensor(gray, canvas.width, canvas.height, sigma);
                }
                break;
            default:
                renderFallback(ctx, canvas, `Edge Detection: ${algoId} - unknown`);
                return;
        }
        
        if (!edges) {
            renderFallback(ctx, canvas, `${algoId} - algorithm not available`);
            return;
        }
        
        // Render edges
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const val = edges[y * canvas.width + x];
                const idx = paletteIndex(val);
                ctx.fillStyle = VGA[idx];
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    /**
     * Render segmentation algorithms
     */
    async function renderSegmentation(algoId, ctx, canvas, values) {
        // Ensure we have a test image
        let img;
        try {
            img = await ensureTestImage(ctx, canvas);
        } catch (error) {
            renderFallback(ctx, canvas, 'Loading image...');
            return;
        }
        
        // Draw image to canvas to get pixel data
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale array
        const gray = new Float32Array(canvas.width * canvas.height);
        for (let i = 0; i < gray.length; i++) {
            gray[i] = data[i * 4] / 255;
        }
        
        let result = null;
        
        switch (algoId) {
            case 'otsu':
                if (A.Segmentation?.otsuThreshold && A.Segmentation?.applyThreshold) {
                    const threshold = A.Segmentation.otsuThreshold(gray, canvas.width, canvas.height);
                    result = A.Segmentation.applyThreshold(gray, canvas.width, canvas.height, threshold);
                }
                break;
            case 'connectedComponents':
                if (A.Segmentation?.connectedComponents && A.Segmentation?.otsuThreshold && A.Segmentation?.applyThreshold) {
                    const threshold = A.Segmentation.otsuThreshold(gray, canvas.width, canvas.height);
                    const binary = A.Segmentation.applyThreshold(gray, canvas.width, canvas.height, threshold);
                    const components = A.Segmentation.connectedComponents(binary, canvas.width, canvas.height);
                    result = components.labels;
                }
                break;
            case 'floodFill':
                if (A.Segmentation?.floodFill && A.Segmentation?.otsuThreshold && A.Segmentation?.applyThreshold) {
                    const threshold = A.Segmentation.otsuThreshold(gray, canvas.width, canvas.height);
                    const binary = A.Segmentation.applyThreshold(gray, canvas.width, canvas.height, threshold);
                    const filled = A.Segmentation.floodFill(binary, canvas.width, canvas.height, 
                        Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 2);
                    result = filled;
                }
                break;
            default:
                renderFallback(ctx, canvas, `Segmentation: ${algoId} - unknown`);
                return;
        }
        
        if (!result) {
            renderFallback(ctx, canvas, `${algoId} - algorithm not available`);
            return;
        }
        
        // Render result
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const maxVal = Math.max(...result);
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const val = result[y * canvas.width + x];
                const normalized = maxVal > 0 ? val / maxVal : 0;
                const idx = paletteIndex(normalized);
                ctx.fillStyle = VGA[idx];
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    /**
     * Render curve geometry algorithms
     */
    function renderCurves(algoId, ctx, canvas, values) {
        const numPoints = values.points || 32;
        const scale = values.scale || 1.0;
        
        // Generate base curve (circle)
        const radius = Math.min(canvas.width, canvas.height) * 0.3 * scale;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const curve = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            curve.push([cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius]);
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (algoId) {
            case 'tangents':
                if (A.CurveGeometry?.computeTangents) {
                    const tangents = A.CurveGeometry.computeTangents(curve, true);
                    
                    // Draw base curve
                    ctx.strokeStyle = '#808080';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    curve.forEach((p, i) => {
                        if (i === 0) ctx.moveTo(p[0], p[1]);
                        else ctx.lineTo(p[0], p[1]);
                    });
                    ctx.closePath();
                    ctx.stroke();
                    
                    // Draw tangent vectors
                    ctx.strokeStyle = '#00ffff';
                    tangents.forEach((t, i) => {
                        const p = curve[i];
                        ctx.beginPath();
                        ctx.moveTo(p[0], p[1]);
                        ctx.lineTo(p[0] + t[0] * 20, p[1] + t[1] * 20);
                        ctx.stroke();
                    });
                }
                break;
            case 'normals':
                if (A.CurveGeometry?.computeNormals) {
                    const normals = A.CurveGeometry.computeNormals(curve, true);
                    
                    // Draw base curve
                    ctx.strokeStyle = '#808080';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    curve.forEach((p, i) => {
                        if (i === 0) ctx.moveTo(p[0], p[1]);
                        else ctx.lineTo(p[0], p[1]);
                    });
                    ctx.closePath();
                    ctx.stroke();
                    
                    // Draw normal vectors
                    ctx.strokeStyle = '#ff00ff';
                    normals.forEach((n, i) => {
                        const p = curve[i];
                        ctx.beginPath();
                        ctx.moveTo(p[0], p[1]);
                        ctx.lineTo(p[0] + n[0] * 20, p[1] + n[1] * 20);
                        ctx.stroke();
                    });
                }
                break;
            case 'curvature':
                if (A.CurveGeometry?.computeCurvature) {
                    const curvatures = A.CurveGeometry.computeCurvature(curve, true);
                    const maxCurv = Math.max(...curvatures.map(Math.abs));
                    
                    // Draw curve colored by curvature
                    curve.forEach((p, i) => {
                        const curv = Math.abs(curvatures[i]);
                        const normalized = maxCurv > 0 ? curv / maxCurv : 0;
                        const idx = paletteIndex(normalized);
                        ctx.fillStyle = VGA[idx];
                        ctx.fillRect(p[0] - 2, p[1] - 2, 5, 5);
                    });
                }
                break;
            case 'offset':
                if (A.CurveGeometry?.offsetCurve) {
                    const offsets = [10, 20, 30, 40];
                    const colors = ['#00ffff', '#00ff00', '#ffff00', '#ff0000'];
                    
                    offsets.forEach((offset, i) => {
                        const offsetCurve = A.CurveGeometry.offsetCurve(curve, offset, true);
                        ctx.strokeStyle = colors[i];
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        offsetCurve.forEach((p, j) => {
                            if (j === 0) ctx.moveTo(p[0], p[1]);
                            else ctx.lineTo(p[0], p[1]);
                        });
                        ctx.closePath();
                        ctx.stroke();
                    });
                }
                break;
            default:
                renderFallback(ctx, canvas, `Curves: ${algoId} - unknown`);
        }
    }

    /**
     * Render vectorization algorithms
     */
    async function renderVectorization(algoId, ctx, canvas, values) {
        const threshold = values.threshold || 0.5;
        
        // Ensure we have a test image
        let img;
        try {
            img = await ensureTestImage(ctx, canvas);
        } catch (error) {
            renderFallback(ctx, canvas, 'Loading image...');
            return;
        }
        
        // Draw image to canvas to get pixel data
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale array
        const field = new Float32Array(canvas.width * canvas.height);
        for (let i = 0; i < field.length; i++) {
            field[i] = data[i * 4] / 255;
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (algoId) {
            case 'marchingSquares':
                if (A.MarchingSquares?.marchingSquares) {
                    const contours = A.MarchingSquares.marchingSquares(field, canvas.width, canvas.height, threshold);
                    
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 2;
                    contours.forEach(contour => {
                        ctx.beginPath();
                        contour.forEach((p, i) => {
                            if (i === 0) ctx.moveTo(p[0], p[1]);
                            else ctx.lineTo(p[0], p[1]);
                        });
                        ctx.stroke();
                    });
                }
                break;
            case 'extractContours':
                if (A.MarchingSquares?.extractContours) {
                    const contours = A.MarchingSquares.extractContours(field, canvas.width, canvas.height, threshold);
                    
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 2;
                    contours.forEach(contour => {
                        ctx.beginPath();
                        contour.forEach((p, i) => {
                            if (i === 0) ctx.moveTo(p.x, p.y);
                            else ctx.lineTo(p.x, p.y);
                        });
                        ctx.closePath();
                        ctx.stroke();
                    });
                }
                break;
            case 'simplifyContour':
                if (A.MarchingSquares?.marchingSquares && A.MarchingSquares?.simplifyContour) {
                    const contours = A.MarchingSquares.marchingSquares(field, canvas.width, canvas.height, threshold);
                    
                    contours.forEach(contour => {
                        const simplified = A.MarchingSquares.simplifyContour(contour, 2);
                        
                        ctx.strokeStyle = '#ffff00';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        simplified.forEach((p, i) => {
                            if (i === 0) ctx.moveTo(p[0], p[1]);
                            else ctx.lineTo(p[0], p[1]);
                        });
                        ctx.stroke();
                    });
                }
                break;
            default:
                renderFallback(ctx, canvas, `Vectorization: ${algoId} - unknown`);
        }
    }

    /**
     * Render graph algorithms
     */
    function renderGraphs(algoId, ctx, canvas, values) {
        const numPoints = values.points || 80;
        const seed = values.seed || 0;
        const rng = A.MathUtils?.seededRandom ? A.MathUtils.seededRandom(seed) : Math.random;
        
        // Generate random points - k-d tree expects {x, y} objects
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            points.push({x: rng() * canvas.width, y: rng() * canvas.height});
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (algoId) {
            case 'kdTree':
                if (A.SpatialIndex?.buildKdTree && A.SpatialIndex?.kdNearestNeighbor) {
                    const tree = A.SpatialIndex.buildKdTree(points);
                    
                    // Draw all points
                    ctx.fillStyle = '#808080';
                    points.forEach(p => {
                        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
                    });
                    
                    // Pick query point and draw connections
                    const queryX = canvas.width / 2;
                    const queryY = canvas.height / 2;
                    const nearestResult = A.SpatialIndex.kdNearestNeighbor(tree, queryX, queryY);
                    
                    if (nearestResult && nearestResult.point) {
                        ctx.fillStyle = '#ff0000';
                        ctx.fillRect(queryX - 3, queryY - 3, 6, 6);
                        ctx.fillStyle = '#00ffff';
                        ctx.fillRect(nearestResult.point[0] - 3, nearestResult.point[1] - 3, 6, 6);
                        
                        ctx.strokeStyle = '#00ffff';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(queryX, queryY);
                        ctx.lineTo(nearestResult.point[0], nearestResult.point[1]);
                        ctx.stroke();
                    }
                }
                break;
            case 'spatialHash':
                if (A.SpatialIndex?.createSpatialHash && A.SpatialIndex?.findClosePointPairs) {
                    const hash = A.SpatialIndex.createSpatialHash(points, 30);
                    const pairs = A.SpatialIndex.findClosePointPairs(hash, 30);
                    
                    // Draw all points
                    ctx.fillStyle = '#ffffff';
                    points.forEach(p => {
                        ctx.fillRect(p[0] - 1, p[1] - 1, 3, 3);
                    });
                    
                    // Draw connections for close pairs
                    ctx.strokeStyle = '#ff00ff';
                    ctx.lineWidth = 1;
                    pairs.forEach(([i, j]) => {
                        ctx.beginPath();
                        ctx.moveTo(points[i][0], points[i][1]);
                        ctx.lineTo(points[j][0], points[j][1]);
                        ctx.stroke();
                    });
                }
                break;
            default:
                renderFallback(ctx, canvas, `Graphs: ${algoId} - unknown`);
        }
    }

    /**
     * Render optics/interference algorithms
     */
    function renderOptics(algoId, ctx, canvas, values) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (algoId) {
            case 'thinFilm':
                if (A.Optics?.thinFilmColor) {
                    const thickness = values.thickness || 500;
                    const refIndex = values.refIndex || 1.5;
                    
                    for (let y = 0; y < canvas.height; y += 2) {
                        for (let x = 0; x < canvas.width; x += 2) {
                            const angle = Math.atan2(y - cy, x - cx);
                            const incidenceAngle = Math.abs(angle) * 30;
                            const rgb = A.Optics.thinFilmColor(thickness, refIndex, {phaseShift: true});
                            // Convert [0,1] to [0,255]
                            const r = Math.floor(rgb.r * 255);
                            const g = Math.floor(rgb.g * 255);
                            const b = Math.floor(rgb.b * 255);
                            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                            ctx.fillRect(x, y, 2, 2);
                        }
                    }
                }
                break;
            case 'twoBeam':
                if (A.Optics?.twoBeamInterference && A.Optics?.opdToPhase) {
                    const wavelength = values.wavelength || 550;
                    const thickness = values.thickness || 500;
                    
                    for (let y = 0; y < canvas.height; y += 2) {
                        for (let x = 0; x < canvas.width; x += 2) {
                            const opd = thickness * (1 + (x - cx) / canvas.width);
                            const phaseDiff = A.Optics.opdToPhase(opd, wavelength);
                            const intensity = A.Optics.twoBeamInterference(1.0, 1.0, phaseDiff);
                            const normalized = Math.max(0, Math.min(1, intensity / 4)); // Normalize to [0,1]
                            const idx = Math.floor(normalized * (VGA.length - 1));
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 2, 2);
                        }
                    }
                }
                break;
            case 'birefringence':
                if (A.Optics?.birefringentRetardation && A.Optics?.crossedPolarIntensity) {
                    const birefringence = values.birefringence || 0.01;
                    const thickness = values.thickness || 50;
                    
                    for (let y = 0; y < canvas.height; y += 2) {
                        for (let x = 0; x < canvas.width; x += 2) {
                            const angle = Math.atan2(y - cy, x - cx);
                            const retardation = A.Optics.birefringentRetardation(birefringence, thickness);
                            const intensity = A.Optics.crossedPolarIntensity(retardation, angle);
                            const idx = paletteIndex(intensity);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x, y, 2, 2);
                        }
                    }
                }
                break;
            case 'conoscopy':
                if (A.Optics?.conoscopicColor) {
                    const birefringence = values.birefringence || 0.01;
                    const thickness = values.thickness || 50;
                    
                    for (let y = 0; y < canvas.height; y += 2) {
                        for (let x = 0; x < canvas.width; x += 2) {
                            const dx = (x - cx) / cx;
                            const dy = (y - cy) / cy;
                            const theta = Math.sqrt(dx * dx + dy * dy) * 45;
                            const phi = Math.atan2(dy, dx) * 180 / Math.PI;
                            const rgb = A.Optics.conoscopicColor(birefringence, thickness, theta, phi);
                            ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                            ctx.fillRect(x, y, 2, 2);
                        }
                    }
                }
                break;
            default:
                renderFallback(ctx, canvas, `Optics: ${algoId} - unknown`);
        }
    }

    /**
     * Render physics simulation algorithms
     */
    function renderPhysics(algoId, ctx, canvas, values) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        switch (algoId) {
            case 'wave1D':
                if (A.WaveSolver?.initWave1D && A.WaveSolver?.stepWave1D && A.WaveSolver?.impulseWave1D) {
                    const n = 200;
                    const damping = values.damping !== undefined ? values.damping : 0.02;
                    const speed = values.speed || 1.0;
                    
                    // Check if animation exists
                    const animId = `wave1D_${n}_${damping}_${speed}`;
                    const needsInit = !animationState.instance || animationState.instance.algoId !== animId;
                    
                    if (needsInit) {
                        animationState.instance = new AnimatedAlgorithm(
                            animId,
                            // Init
                            (params) => {
                                const waveState = A.WaveSolver.initWave1D(params.n, params.speed, params.damping);
                                A.WaveSolver.impulseWave1D(waveState, Math.floor(params.n / 2), 1.0);
                                return { waveState, step: 0 };
                            },
                            // Step
                            (state) => {
                                A.WaveSolver.stepWave1D(state.waveState);
                                return { ...state, step: state.step + 1 };
                            },
                            // Render
                            (ctx, canvas, state) => {
                                ctx.fillStyle = '#000000';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                
                                const scaleX = canvas.width / n;
                                const scaleY = canvas.height / 4;
                                const baseY = canvas.height / 2;
                                
                                ctx.strokeStyle = '#00ffff';
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                for (let i = 0; i < n; i++) {
                                    const x = i * scaleX;
                                    const y = baseY - state.waveState.u[i] * scaleY;
                                    if (i === 0) ctx.moveTo(x, y);
                                    else ctx.lineTo(x, y);
                                }
                                ctx.stroke();
                                
                                // Draw stats
                                ctx.fillStyle = '#ffffff';
                                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                                ctx.fillText(`Step: ${state.step}`, 10, 20);
                            },
                            // Is complete
                            (state) => state.step >= 200
                        );
                        
                        animationState.instance.init({ n, speed, damping });
                        animationState.frameRate = 30;
                    }
                    
                    // Render current state
                    if (animationState.instance && animationState.instance.state) {
                        animationState.instance.render(ctx, canvas);
                    }
                }
                break;
            case 'wave2D':
                if (A.WaveSolver?.initWave2D && A.WaveSolver?.stepWave2D && A.WaveSolver?.rippleWave2D) {
                    const gridSize = 128;
                    const damping = values.damping !== undefined ? values.damping : 0.01;
                    const speed = values.speed || 1.0;
                    
                    // Check if animation exists
                    const animId = `wave2D_${gridSize}_${damping}_${speed}`;
                    const needsInit = !animationState.instance || animationState.instance.algoId !== animId;
                    
                    if (needsInit) {
                        animationState.instance = new AnimatedAlgorithm(
                            animId,
                            // Init
                            (params) => {
                                const waveState = A.WaveSolver.initWave2D(params.gridSize, params.gridSize, params.speed, params.damping);
                                A.WaveSolver.rippleWave2D(waveState, params.gridSize / 2, params.gridSize / 2, 1.0, 10);
                                return { waveState, step: 0, gridSize: params.gridSize };
                            },
                            // Step
                            (state) => {
                                A.WaveSolver.stepWave2D(state.waveState);
                                return { ...state, step: state.step + 1 };
                            },
                            // Render
                            (ctx, canvas, state) => {
                                ctx.fillStyle = '#000000';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                
                                const cellW = canvas.width / state.gridSize;
                                const cellH = canvas.height / state.gridSize;
                                
                                for (let y = 0; y < state.gridSize; y++) {
                                    for (let x = 0; x < state.gridSize; x++) {
                                        const height = state.waveState.u[y * state.gridSize + x];
                                        const normalized = (height + 1) * 0.5;
                                        const idx = paletteIndex(normalized);
                                        ctx.fillStyle = VGA[idx];
                                        ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                                    }
                                }
                                
                                // Draw stats
                                ctx.fillStyle = '#ffffff';
                                ctx.font = '14px "Atkinson Hyperlegible", monospace';
                                ctx.fillText(`Step: ${state.step}`, 10, 20);
                            },
                            // Is complete
                            (state) => state.step >= 200
                        );
                        
                        animationState.instance.init({ gridSize, speed, damping });
                        animationState.frameRate = 30;
                    }
                    
                    // Render current state
                    if (animationState.instance && animationState.instance.state) {
                        animationState.instance.render(ctx, canvas);
                    }
                }
                break;
            case 'advection':
                if (A.Advection?.advectSemiLagrangian && A.Advection?.rotationalVelocityField) {
                    const dt = values.dt || 0.1;
                    const steps = values.steps || 100;
                    const gridSize = 128;
                    
                    // Initial scalar field (circular blob)
                    let field = new Float32Array(gridSize * gridSize);
                    const cx = gridSize / 2;
                    const cy = gridSize / 2;
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const dx = x - cx;
                            const dy = y - cy;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            field[y * gridSize + x] = dist < 15 ? 1 : 0;
                        }
                    }
                    
                    // Velocity field (rotational)
                    const velocityU = new Float32Array(gridSize * gridSize);
                    const velocityV = new Float32Array(gridSize * gridSize);
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const v = A.Advection.rotationalVelocityField(x, y, cx, cy, 0.5);
                            velocityU[y * gridSize + x] = v[0];
                            velocityV[y * gridSize + x] = v[1];
                        }
                    }
                    
                    // Advect
                    for (let i = 0; i < steps; i++) {
                        field = A.Advection.advectSemiLagrangian(field, velocityU, velocityV, gridSize, gridSize, dt);
                    }
                    
                    // Render result
                    const cellW = canvas.width / gridSize;
                    const cellH = canvas.height / gridSize;
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const val = field[y * gridSize + x];
                            const idx = paletteIndex(val);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                        }
                    }
                }
                break;
            case 'streamline':
                if (A.Advection?.traceStreamline && A.Advection?.rotationalVelocityField) {
                    const dt = values.dt || 0.1;
                    const steps = values.steps || 100;
                    const cx = canvas.width / 2;
                    const cy = canvas.height / 2;
                    
                    // Create velocity field function
                    const velocityFn = (x, y) => A.Advection.rotationalVelocityField(x, y, cx, cy, 2);
                    
                    // Trace multiple streamlines from different starting points
                    const numStreamlines = 16;
                    const streamlines = [];
                    for (let i = 0; i < numStreamlines; i++) {
                        const angle = (i / numStreamlines) * Math.PI * 2;
                        const startX = cx + Math.cos(angle) * 100;
                        const startY = cy + Math.sin(angle) * 100;
                        const line = A.Advection.traceStreamline(velocityFn, startX, startY, dt, steps, canvas.width, canvas.height);
                        streamlines.push(line);
                    }
                    
                    // Draw streamlines
                    ctx.strokeStyle = '#00ffff';
                    ctx.lineWidth = 1;
                    streamlines.forEach(line => {
                        ctx.beginPath();
                        line.forEach((p, i) => {
                            if (i === 0) ctx.moveTo(p[0], p[1]);
                            else ctx.lineTo(p[0], p[1]);
                        });
                        ctx.stroke();
                    });
                }
                break;
            default:
                renderFallback(ctx, canvas, `Physics: ${algoId} - unknown`);
        }
    }

    /**
     * Render reaction-diffusion algorithms
     */
    function renderReactionDiffusion(algoId, ctx, canvas, values) {
        const gridSize = 128;
        
        switch (algoId) {
            case 'grayScott':
                if (A.ReactionDiffusion?.runGrayScott) {
                    const steps = values.steps || 120;
                    const feed = values.feed || 0.055;
                    const kill = values.kill || 0.062;
                    
                    const state = A.ReactionDiffusion.runGrayScott(gridSize, gridSize, {
                        feed,
                        kill,
                        steps
                    });
                    
                    // Render V field (chemical B)
                    const cellW = canvas.width / gridSize;
                    const cellH = canvas.height / gridSize;
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const val = state.v[y * gridSize + x];
                            const idx = paletteIndex(val);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                        }
                    }
                }
                break;
            case 'turing':
                if (A.ReactionDiffusion?.stepTuringPattern) {
                    const steps = values.steps || 120;
                    const activator = values.activator || 1.0;
                    const inhibitor = values.inhibitor || 2.0;
                    
                    // Initialize state
                    const a = new Float32Array(gridSize * gridSize);
                    const b = new Float32Array(gridSize * gridSize);
                    for (let i = 0; i < a.length; i++) {
                        a[i] = Math.random();
                        b[i] = Math.random();
                    }
                    const state = { a, b, width: gridSize, height: gridSize };
                    
                    // Run simulation
                    for (let i = 0; i < steps; i++) {
                        A.ReactionDiffusion.stepTuringPattern(state, activator, inhibitor);
                    }
                    
                    // Render
                    const cellW = canvas.width / gridSize;
                    const cellH = canvas.height / gridSize;
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const val = state.a[y * gridSize + x];
                            const idx = paletteIndex(val);
                            ctx.fillStyle = VGA[idx];
                            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                        }
                    }
                }
                break;
            case 'gameOfLife':
                if (A.ReactionDiffusion?.stepGameOfLife && A.ReactionDiffusion?.initCellularAutomaton) {
                    const seed = values.seed || 0;
                    const steps = values.steps || 50;
                    const rng = A.MathUtils?.seededRandom ? A.MathUtils.seededRandom(seed) : Math.random;
                    
                    const state = A.ReactionDiffusion.initCellularAutomaton(gridSize, gridSize, rng, 0.3);
                    
                    // Run simulation
                    for (let i = 0; i < steps; i++) {
                        A.ReactionDiffusion.stepGameOfLife(state);
                    }
                    
                    // Render
                    const cellW = canvas.width / gridSize;
                    const cellH = canvas.height / gridSize;
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const alive = state.cells[y * gridSize + x];
                            ctx.fillStyle = alive ? '#ffffff' : '#000000';
                            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                        }
                    }
                }
                break;
            case 'cellularAutomaton':
                if (A.ReactionDiffusion?.stepCellularAutomaton && A.ReactionDiffusion?.initCellularAutomaton) {
                    const seed = values.seed || 0;
                    const rule = values.rule || 30;
                    const steps = values.steps || 50;
                    const rng = A.MathUtils?.seededRandom ? A.MathUtils.seededRandom(seed) : Math.random;
                    
                    const state = A.ReactionDiffusion.initCellularAutomaton(gridSize, gridSize, rng, 0.5);
                    
                    // Run simulation
                    for (let i = 0; i < steps; i++) {
                        A.ReactionDiffusion.stepCellularAutomaton(state, rule);
                    }
                    
                    // Render
                    const cellW = canvas.width / gridSize;
                    const cellH = canvas.height / gridSize;
                    for (let y = 0; y < gridSize; y++) {
                        for (let x = 0; x < gridSize; x++) {
                            const alive = state.cells[y * gridSize + x];
                            ctx.fillStyle = alive ? '#ffffff' : '#000000';
                            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
                        }
                    }
                }
                break;
            default:
                renderFallback(ctx, canvas, `Reaction-Diffusion: ${algoId} - unknown`);
        }
    }

    /**
     * Render color/quantization algorithms
     */
    async function renderQuantization(algoId, ctx, canvas, values) {
        // Ensure we have a test image
        let img;
        try {
            img = await ensureTestImage(ctx, canvas);
        } catch (error) {
            renderFallback(ctx, canvas, 'Loading image...');
            return;
        }
        
        // Draw image to canvas to get pixel data
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        switch (algoId) {
            case 'posterize':
                if (A.Posterization?.posterizeImage) {
                    const levels = values.levels || 4;
                    const result = A.Posterization.posterizeImage(imageData, levels);
                    ctx.putImageData(result, 0, 0);
                }
                break;
            case 'posterizeGamma':
                if (A.Posterization?.posterizeGamma) {
                    const levels = values.levels || 4;
                    const gray = new Float32Array(canvas.width * canvas.height);
                    for (let i = 0; i < gray.length; i++) {
                        gray[i] = data[i * 4] / 255;
                    }
                    const result = A.Posterization.posterizeGamma(gray, levels, 2.2);
                    
                    for (let i = 0; i < gray.length; i++) {
                        const val = Math.floor(result[i] * 255);
                        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = val;
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
                break;
            case 'dither':
                if (A.Posterization?.posterizeDither) {
                    const threshold = values.threshold || 0.5;
                    const gray = new Float32Array(canvas.width * canvas.height);
                    for (let i = 0; i < gray.length; i++) {
                        gray[i] = data[i * 4] / 255;
                    }
                    const result = A.Posterization.posterizeDither(gray, canvas.width, canvas.height, threshold);
                    
                    for (let i = 0; i < gray.length; i++) {
                        const val = result[i] ? 255 : 0;
                        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = val;
                    }
                    ctx.putImageData(imageData, 0, 0);
                }
                break;
            case 'bayerDither':
                if (A.Posterization?.posterizeImageBayer) {
                    const result = A.Posterization.posterizeImageBayer(imageData, 8);
                    ctx.putImageData(result, 0, 0);
                }
                break;
            default:
                renderFallback(ctx, canvas, `Quantization: ${algoId} - unknown`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════

    const DOC_PATHS = {
        'noise.simplex2D': 'blog/ideas/reference documentation/17_Noise_Functions/Simplex_noise.md',
        'noise.fbm2D': 'blog/ideas/reference documentation/17_Noise_Functions/Fractional_Brownian_Motion.md',
        'noise.domainWarp2D': 'blog/ideas/reference documentation/17_Noise_Functions/Domain_warping.md',
        'sampling.poissonDisk': 'blog/ideas/reference documentation/04_Sampling_Point_Distribution/Poisson_disk_sampling.md',
        'sampling.haltonSequence': 'blog/ideas/reference documentation/04_Sampling_Point_Distribution/Halton_sequence.md',
        'space.hilbert': 'blog/ideas/reference documentation/05_Space_Filling_Curves/Hilbert_curve.md',
        'tsp.nearestNeighbor': 'blog/ideas/reference documentation/07_TSP_Based_Space_Filling/Nearest_neighbor.md',
        'tsp.twoOpt': 'blog/ideas/reference documentation/07_TSP_Based_Space_Filling/2_opt.md',
        'patterns.truchet': 'blog/ideas/reference documentation/18_Pattern_Generation/Truchet_tiles.md',
        'pde.grayScott': 'blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Gray-Scott_model.md',
        'distance.jfa': 'blog/ideas/reference documentation/13_Distance_Morphology_Topology/Jump_Flooding_Algorithm.md'
    };

    /**
     * Build sidebar tabs for a specific page
     * Structure: Domain tabs → Algorithm blocks → Controls
     * Each page has ≤4 domains, fitting the 4-tab limit
     */
    function buildSidebarForPage(pageId) {
        const page = PAGES.find(p => p.id === pageId) || PAGES[0];
        
        // Each domain becomes a TAB, each algorithm becomes a BLOCK with controls
        return page.domains.map(domain => [
            domain.title.toUpperCase().split(' ')[0], // Short tab name (e.g., "NOISE", "SAMPLING")
            domain.algorithms.map(algo => {
                const fullId = `${page.id}.${domain.id}.${algo.id}`;
                const controls = getControlsForAlgorithm(fullId, algo);
                
                // Use selectableCollapsible if there are controls, otherwise pure selectable
                const mode = controls.length > 0 ? 'selectableCollapsible' : 'selectable';
                
                return [
                    algo.title,  // Block header (selectable algorithm name)
                    controls,  // Algorithm-specific controls
                    { mode, id: fullId, key: 'selectedAlgorithm', defaultCollapsed: false }
                ];
            })
        ]);
    }
    
    // Initial sidebar built for default page
    function buildSidebarTabs() {
        return buildSidebarForPage(state.selectedPageId || 'page1');
    }

    const TOOL_CONFIG = {
        title: 'ALGORITHM TEST LAB',
        useTabs: true,
        canvas: { width: 720, height: 720, displayMode: 'fit', showControls: false },
        canvasTabs: null,  // Canvas tabs are now in sub-sub-header, not managed by ToolBase
        sidebar: buildSidebarTabs(),
        onInit: async function() {
            // Select default algorithm
            state.selectedAlgorithmId = DEFAULT_ALGO;
            
            await updateAboutPanel(this);
            setMode(this, state.viewMode);
        },
        onUpdate: function(key, value) {
            if (key === 'modeTabs') {
                setMode(this, value);
            }
            
            // Handle algorithm selection from selectable block headers
            if (key === 'selectedAlgorithm' && value) {
                const instance = this._algorithmTestLabInstance;
                if (instance) {
                    instance.selectAlgorithm(value);
                }
                return; // Don't redraw yet, selectAlgorithm handles it
            }
            
            // Handle algorithm selection from radio buttons
            if (key.endsWith('_algo') && value) {
                state.selectedAlgorithmId = value;
                if (state.viewMode === 'output') {
                    this.draw();
                } else {
                    updateAboutPanel(this);
                }
            }
            
            // Handle fetch new image button
            if (key.endsWith('_fetchImage')) {
                handleFetchNewImage(key.replace('_fetchImage', ''));
                if (state.viewMode === 'output') {
                    this.draw();
                }
                return;
            }
            
            // Handle randomise button clicks
            if (key.endsWith('_randomise')) {
                const baseKey = key.replace('_randomise', '_seed');
                const randomSeed = Math.floor(Math.random() * 1000);
                // Update the seed value
                if (this.values && typeof this.values === 'object') {
                    this.values[baseKey] = randomSeed;
                }
                // Update the input element if it exists
                const seedInput = this.element.querySelector(`input[data-key="${baseKey}"]`);
                if (seedInput) {
                    seedInput.value = randomSeed;
                    // Trigger change event to update internal state
                    seedInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            
            // Handle animation controls
            if (key.endsWith('_play')) {
                if (animationState.instance) {
                    if (animationState.isPlaying) {
                        stopAnimation();
                    } else {
                        startAnimation(this);
                    }
                } else {
                    // Initialize animation and start
                    this.draw(); // This will create animation instance
                    setTimeout(() => startAnimation(this), 100);
                }
            }
            
            if (key.endsWith('_step')) {
                stopAnimation();
                if (animationState.instance) {
                    animationState.instance.step();
                    this.draw();
                }
            }
            
            if (key.endsWith('_reset')) {
                stopAnimation();
                animationState.instance = null;
                this.draw();
            }
            
            if (state.viewMode === 'output') {
                this.draw();
            } else {
                updateAboutPanel(this);
            }
        },
        onDraw: async function(ctx, canvas, values) {
            if (state.viewMode !== 'output') return;
            await renderAlgorithm(ctx, canvas, values);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════

// AlgorithmsTestLab class definition
export class AlgorithmsTestLab {
    constructor(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.algorithmsReady = false;
        
        // Algorithms are imported and ready
        if (Algorithms && Object.keys(Algorithms).length > 5) {
            this.algorithmsReady = true;
        } else {
            window.addEventListener('algorithmsReady', () => {
                this.algorithmsReady = true;
                console.log('✅ Algorithms ready, tool can now render properly');
            });
        }
    }

        render = function() {
            
            if (!window.ComponentLibrary?.CategoryTabsBar) {
                throw new Error('CategoryTabsBar component not loaded');
            }

            // Show loading message if algorithms not ready
            if (!this.algorithmsReady) {
                this.container.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: \'Atkinson Hyperlegible\', monospace; color: var(--vga-white);">Loading algorithms library...</div>';

                // Wait for algorithms and then render
                const checkReady = () => {
                    if (this.algorithmsReady) {
                        this._actualRender();
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
                return this;
            }

            this._actualRender();
            return this;
        };
    
        _actualRender = function() {
        const F = this.deps.MF?.F || 14;
        
        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column;';
        
        // Create CategoryTabsBar component using PAGES structure
        const defaultPage = PAGES.find(p => p.id === state.selectedPageId) || PAGES[0];
        
        this.categoryBar = new window.ComponentLibrary.CategoryTabsBar({
            categories: PAGES.map(p => ({id: p.id, title: p.title})),
            activeCategory: defaultPage.id,
            enableScrollbar: true,
            onCategoryChange: (pageId) => {
                rebuildToolForPage(this, pageId);
            }
        }, this.deps);
        
        const barElement = this.categoryBar.render();
        this.wrapper.appendChild(barElement);
        
        // Content area for ToolBase
        this.contentArea = document.createElement('div');
        this.contentArea.style.cssText = 'flex: 1; min-height: 0; overflow: hidden;';
        this.wrapper.appendChild(this.contentArea);
        
        this.container.appendChild(this.wrapper);
        
        // Build ToolBase in content area with initial page's domains
        const initialConfig = {
            ...TOOL_CONFIG,
            sidebar: buildSidebarForPage(defaultPage.id)
        };
        
        this.tool = new ToolBase(initialConfig, this.deps);
        
        // Store reference so onInit can access this instance
        this.tool._algorithmTestLabInstance = this;
        
        this.tool.mount(this.contentArea);
        
        // Add OUTPUT/ABOUT tabs above the canvas
        this._addCanvasTabs();
        
        // Setup algorithm selection (make headers clickable)
        this.setupAlgorithmSelection();
        
        this.tool.draw();
        
        return this;
    };
    
    /**
     * Add OUTPUT/ABOUT tabs above the canvas area
     */
    _addCanvasTabs = function() {
        if (!this.tool || !this.tool.canvasArea) return;
        
        const F = this.deps.MF?.F || 14;
        const canvasArea = this.tool.canvasArea;
        
        // Adjust canvas area to have tabs at top (override center alignment for full width tabs)
        canvasArea.style.alignItems = 'stretch';
        
        // Create tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'canvas-mode-tabs';
        tabsContainer.style.cssText = `
            display: flex;
            width: 100%;
            border-bottom: 1px solid var(--c-border);
            flex-shrink: 0;
            align-self: stretch;
        `;
        
        const tabs = [
            { id: 'output', label: 'OUTPUT' },
            { id: 'about', label: 'ABOUT' }
        ];
        
        this.canvasTabButtons = [];
        
        tabs.forEach((tab, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = tab.label;
            const isActive = tab.id === state.viewMode;
            
            btn.style.cssText = `
                flex: 1;
                height: ${F * 2}px;
                padding: 0 ${F}px;
                border: none;
                ${index < tabs.length - 1 ? 'border-right: 1px solid var(--c-border);' : ''}
                background: ${isActive ? 'var(--c-text)' : 'var(--c-bg)'};
                color: ${isActive ? 'var(--c-bg)' : 'var(--c-text)'};
                font-family: 'Atkinson Hyperlegible', monospace;
                font-size: ${F}px;
                text-transform: uppercase;
                cursor: pointer;
            `;
            
            btn.addEventListener('click', () => {
                this._setCanvasTab(tab.id);
            });
            
            btn.addEventListener('mouseenter', () => {
                if (tab.id !== state.viewMode) {
                    btn.style.background = 'var(--vga-gray)';
                }
            });
            
            btn.addEventListener('mouseleave', () => {
                if (tab.id !== state.viewMode) {
                    btn.style.background = 'var(--c-bg)';
                }
            });
            
            this.canvasTabButtons.push({ id: tab.id, element: btn });
            tabsContainer.appendChild(btn);
        });
        
        // Create a canvas wrapper to maintain centering
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'canvas-wrapper';
        canvasWrapper.style.cssText = `
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 0;
            overflow: hidden;
        `;
        
        // Move existing canvas into wrapper
        const canvas = canvasArea.querySelector('canvas');
        if (canvas) {
            canvasWrapper.appendChild(canvas);
        }
        
        // Insert tabs at top, then wrapper
        canvasArea.insertBefore(tabsContainer, canvasArea.firstChild);
        canvasArea.appendChild(canvasWrapper);
        
        this.canvasTabsContainer = tabsContainer;
    };
    
    /**
     * Switch canvas tab (OUTPUT/ABOUT)
     */
    _setCanvasTab = function(tabId) {
        state.viewMode = tabId;
        
        // Update button styles
        if (this.canvasTabButtons) {
            this.canvasTabButtons.forEach(({ id, element }) => {
                const isActive = id === tabId;
                element.style.background = isActive ? 'var(--c-text)' : 'var(--c-bg)';
                element.style.color = isActive ? 'var(--c-bg)' : 'var(--c-text)';
            });
        }
        
        // Trigger mode change
        setMode(this.tool, tabId);
    };

    /**
     * Setup algorithm selection - select default algorithm and apply visual state
     */
        setupAlgorithmSelection = function() {
        if (!this.tool || !this.tool.element) {
            window.debugLog('TOOLS', 'setupAlgorithmSelection: tool or tool.element not available');
            return;
        }
        
        // Select the default algorithm (first in current page)
        if (!state.selectedAlgorithmId) {
            const currentPage = PAGES.find(p => p.id === state.selectedPageId) || PAGES[0];
            if (currentPage.domains.length > 0 && currentPage.domains[0].algorithms.length > 0) {
                const firstAlgo = currentPage.domains[0].algorithms[0];
                const defaultId = `${currentPage.id}.${currentPage.domains[0].id}.${firstAlgo.id}`;
                this.selectAlgorithm(defaultId);
            }
        } else {
            // Re-apply selection state (useful after rebuild)
            this.selectAlgorithm(state.selectedAlgorithmId);
        }
    };

    /**
     * Find algorithm ID by block title (no longer used for click handlers, kept for compatibility)
     * Search across ALL pages since all algorithms are in the DOM
     * Comparison is case-insensitive since headers are uppercase via CSS
     */
        findAlgorithmIdByTitle = function(title) {
        // Normalize for comparison (headers are uppercase via CSS)
        const normalizedTitle = title.toUpperCase().trim();
        
        // Search through ALL pages, not just current page
        for (const page of PAGES) {
            for (const domain of page.domains) {
                const algo = domain.algorithms.find(a => 
                    a.title.toUpperCase().trim() === normalizedTitle
                );
                if (algo) {
                    return `${page.id}.${domain.id}.${algo.id}`;
                }
            }
        }
        
        return null;
    };

    /**
     * Select an algorithm and update UI
     */
        selectAlgorithm = function(algorithmId) {
        if (!algorithmId || !this.tool || !this.tool.element) return;
        
        const F = this.deps.MF?.F || 14;
        
        // Update state
        state.selectedAlgorithmId = algorithmId;
        state.selectedId = algorithmId; // Also update selectedId for compatibility
        
        // Parse algorithm ID
        const parts = algorithmId.split('.');
        if (parts.length >= 3) {
            state.selectedPageId = parts[0];
            state.selectedDomainId = parts[1];
        }
        
        // Update visual feedback for all selectable headers (both modes)
        const blockHeaders = this.tool.element.querySelectorAll('.tool-block-header--selectable, .tool-block-header--selectable-collapsible');
        blockHeaders.forEach(header => {
            const headerId = header.dataset.blockId;
            if (headerId === algorithmId) {
                // Active: INVERTED - Light background, dark text
                header.style.backgroundColor = 'var(--vga-white)';
                header.style.color = 'var(--vga-black)';
                header.style.borderColor = 'var(--vga-white)';
                header.classList.add('active');
            } else {
                // Inactive: Normal - Dark background, light text
                header.style.backgroundColor = 'transparent';
                header.style.color = 'var(--c-text)';
                header.style.borderColor = 'var(--c-border)';
                header.classList.remove('active');
            }
        });
        
        // Trigger canvas re-render if in OUTPUT mode
        if (state.viewMode === 'output' && this.tool) {
            this.tool.draw();
        }
        
        // ALWAYS update ABOUT panel when algorithm changes (not just when in ABOUT mode)
        updateAboutPanel(this.tool);
    };
    

        destroy = function() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Register globally for backward compatibility
if (typeof window !== 'undefined') {
    window.AlgorithmsTestLab = AlgorithmsTestLab;
    console.log('✅ AlgorithmsTestLab (ES Module) loaded');
}

// Default export for ES module loader (tools_section.js expects default or *Tool named export)
export default AlgorithmsTestLab;
