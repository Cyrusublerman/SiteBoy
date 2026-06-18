/**
 * Pixel Tiler Tool - ToolBase Declarative Format
 *
 * Creates 2x2 pixel combinations from 4 source images with animation support
 * Each pixel becomes a 2×2 block combining all 4 source images
 *
 * @version 4.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';
import { FrameSequencer } from '../../core/animation-foundation.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let images = {};
let processedImages = {};
let allCombinations = [];
let currentFrame = 0;
let animator = null;
let toolInstance = null;

// PixelTiler class definition

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════════════

    const TOOL_CONFIG = {
        title: 'PIXEL TILER',
        
        // Animation export config: frame sequence (dynamic length)
        animation: {
            type: 'sequence',
            sequenceLength: 1,  // Updated dynamically when combinations are generated
            defaultFps: 24,
            canPrerender: true
        },
        
        sidebar: [
            ['IMAGES', [
                ['Upload', [
                    ['file', 'Image A (TL)', 'image/*', { key: 'imageA', buttonText: 'Choose' }],
                    ['file', 'Image B (TR)', 'image/*', { key: 'imageB', buttonText: 'Choose' }],
                    ['file', 'Image C (BL)', 'image/*', { key: 'imageC', buttonText: 'Choose' }],
                    ['file', 'Image D (BR)', 'image/*', { key: 'imageD', buttonText: 'Choose' }],
                ]],
            ]],
            ['PROCESS', [
                ['Mode', [
                    ['dropdown', 'Combination', ['Single (1)', 'Permutations (24)', 'All (256)'], { key: 'mode', value: 'Single (1)' }],
                    ['button', 'Process', null, { key: 'process' }],
                ]],
                ['Animation', [
                    ['slider', 'FPS', 1, 60, 1, { value: 24, withNumber: true, key: 'fps' }],
                    ['button', 'Play/Pause', null, { key: 'playPause' }],
                    ['button', 'Previous', null, { key: 'prev' }],
                    ['button', 'Next', null, { key: 'next' }],
                ]],
                ['Export', [
                    ['button', 'Download PNG', null, { key: 'downloadPng' }],
                ]],
                ['Status', [
                    ['label', 'Upload 4 images to begin', { key: 'status', variant: 'body' }],
                    ['label', 'Frame: --/--', { key: 'frameInfo', variant: 'caption' }],
                ]],
            ]],
        ],
        
        canvas: { size: 420 },
        
        onInit: function(values) {
            toolInstance = this;
            
            // Wire up buttons
            wireButton(this, 'process', processImages);
            wireButton(this, 'playPause', toggleAnimation);
            wireButton(this, 'prev', previousFrame);
            wireButton(this, 'next', nextFrame);
            wireButton(this, 'downloadPng', downloadCurrentImage);
            
            // Draw empty state
            drawEmptyState(this.getContext(), this.getCanvas());
        },
        
        onUpdate: function(key, value, allValues) {
            // Handle file uploads
            if (key === 'imageA' || key === 'imageB' || key === 'imageC' || key === 'imageD') {
                if (value && value instanceof File) {
                    loadImage(key.replace('image', ''), value);
                }
            }
            
            // Handle FPS change
            if (key === 'fps' && animator) {
                animator.fps = value;
            }
        },
        
        // Pre-render support: render a specific frame for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            if (allCombinations.length === 0) return;
            
            var ctx = this.ctx;
            var canvas = this.canvas;
            var exportFrame = frameIndex % allCombinations.length;
            createTiledImage(ctx, canvas, allCombinations[exportFrame]);
        },
        
        onDraw: function(ctx, canvas, values) {
            if (allCombinations.length === 0) {
                drawEmptyState(ctx, canvas);
                return;
            }
            
            createTiledImage(ctx, canvas, allCombinations[currentFrame]);
        },
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function wireButton(tool, key, handler) {
        const btn = tool.getComponent(key);
        if (btn && btn.element) {
            btn.element.addEventListener('click', handler);
        }
    }

    function updateStatus(message) {
        if (!toolInstance) return;
        const statusComp = toolInstance.getComponent('status');
        if (statusComp && statusComp.element) {
            statusComp.element.textContent = message;
        }
    }

    function updateFrameInfo() {
        if (!toolInstance) return;
        const frameComp = toolInstance.getComponent('frameInfo');
        if (frameComp && frameComp.element) {
            if (allCombinations.length > 0) {
                const combo = allCombinations[currentFrame].join('-');
                frameComp.element.textContent = 'Frame ' + (currentFrame + 1) + '/' + allCombinations.length + ': ' + combo;
            } else {
                frameComp.element.textContent = 'Frame: --/--';
            }
        }
    }

    function loadImage(letter, file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                images[letter] = img;
                checkReadyState();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function checkReadyState() {
        const ready = ['A', 'B', 'C', 'D'].every(function(letter) {
            return images[letter];
        });
        
        const count = Object.keys(images).length;
        if (ready) {
            updateStatus('All images loaded - Ready to process!');
        } else {
            updateStatus('Images loaded: ' + count + '/4');
        }
    }

    function drawEmptyState(ctx, canvas) {
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#333333';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText('PIXEL TILER', w / 2, h / 2 - 30);
        ctx.fillText('Each pixel becomes a 2×2 block', w / 2, h / 2);
        ctx.fillText('Upload 4 images to begin', w / 2, h / 2 + 30);
    }

    function processImages() {
        const ready = ['A', 'B', 'C', 'D'].every(function(letter) {
            return images[letter];
        });
        
        if (!ready) {
            updateStatus('Please upload all 4 images first');
            return;
        }
        
        updateStatus('Processing images...');
        prepareImages();
        
        const values = toolInstance.getValues();
        const mode = values.mode || 'Single (1)';
        
        if (mode === 'Single (1)') {
            allCombinations = [['A', 'B', 'C', 'D']];
            updateStatus('Complete - Single combination');
        } else if (mode === 'Permutations (24)') {
            allCombinations = generatePermutations(['A', 'B', 'C', 'D']);
            updateStatus('24 permutations ready!');
        } else {
            allCombinations = generateAllCombinations(['A', 'B', 'C', 'D']);
            updateStatus('256 combinations ready!');
        }
        
        currentFrame = 0;
        updateFrameInfo();
        initAnimator();
        toolInstance.draw();
    }

    function prepareImages() {
        const minWidth = Math.min.apply(null, Object.values(images).map(function(img) { return img.width; }));
        const minHeight = Math.min.apply(null, Object.values(images).map(function(img) { return img.height; }));
        
        processedImages = {};
        ['A', 'B', 'C', 'D'].forEach(function(letter) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = minWidth;
            canvas.height = minHeight;
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(images[letter], 0, 0, minWidth, minHeight);
            processedImages[letter] = canvas;
        });
    }

    function generatePermutations(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];
        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const perms = generatePermutations(remaining);
            for (let j = 0; j < perms.length; j++) {
                result.push([current].concat(perms[j]));
            }
        }
        return result;
    }

    function generateAllCombinations(arr) {
        const result = [];
        for (let a = 0; a < arr.length; a++) {
            for (let b = 0; b < arr.length; b++) {
                for (let c = 0; c < arr.length; c++) {
                    for (let d = 0; d < arr.length; d++) {
                        result.push([arr[a], arr[b], arr[c], arr[d]]);
                    }
                }
            }
        }
        return result;
    }

    function createTiledImage(ctx, canvas, combination) {
        if (!processedImages['A']) return;
        
        const width = processedImages['A'].width;
        const height = processedImages['A'].height;
        
        const imageData = {};
        ['A', 'B', 'C', 'D'].forEach(function(letter) {
            const imgCtx = processedImages[letter].getContext('2d');
            imageData[letter] = imgCtx.getImageData(0, 0, width, height).data;
        });
        
        // Resize canvas to fit tiled result
        canvas.width = width * 2;
        canvas.height = height * 2;
        
        const resultData = ctx.createImageData(width * 2, height * 2);
        const result = resultData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sourceIndex = (y * width + x) * 4;
                
                const colors = combination.map(function(letter) {
                    return [
                        imageData[letter][sourceIndex],
                        imageData[letter][sourceIndex + 1],
                        imageData[letter][sourceIndex + 2],
                        imageData[letter][sourceIndex + 3]
                    ];
                });
                
                const resultX = x * 2;
                const resultY = y * 2;
                const resultWidth = width * 2;
                
                const positions = [
                    [resultX, resultY],
                    [resultX + 1, resultY],
                    [resultX, resultY + 1],
                    [resultX + 1, resultY + 1]
                ];
                
                positions.forEach(function(pos, i) {
                    const idx = (pos[1] * resultWidth + pos[0]) * 4;
                    result[idx] = colors[i][0];
                    result[idx + 1] = colors[i][1];
                    result[idx + 2] = colors[i][2];
                    result[idx + 3] = colors[i][3];
                });
            }
        }
        
        ctx.putImageData(resultData, 0, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION
    // ═══════════════════════════════════════════════════════════════════════════════

    function initAnimator() {
        if (animator) {
            animator.destroy();
        }
        
        if (FrameSequencer) {
            const values = toolInstance.getValues();
            animator = new FrameSequencer({
                frameCount: allCombinations.length,
                onFrame: function(frameIndex) {
                    currentFrame = frameIndex;
                    updateFrameInfo();
                    toolInstance.draw();
                },
                fps: values.fps || 24,
                loop: true
            });
        }
    }

    function toggleAnimation() {
        if (!animator) return;
        
        if (animator.isRunning) {
            animator.stop();
            updateStatus('Animation paused');
        } else {
            animator.start();
            updateStatus('Animation playing');
        }
    }

    function previousFrame() {
        if (allCombinations.length === 0) return;
        if (animator && animator.isRunning) animator.stop();
        
        currentFrame = (currentFrame - 1 + allCombinations.length) % allCombinations.length;
        updateFrameInfo();
        toolInstance.draw();
    }

    function nextFrame() {
        if (allCombinations.length === 0) return;
        if (animator && animator.isRunning) animator.stop();
        
        currentFrame = (currentFrame + 1) % allCombinations.length;
        updateFrameInfo();
        toolInstance.draw();
    }

    function downloadCurrentImage() {
        if (!toolInstance) return;
        
        const canvas = toolInstance.getCanvas();
        if (!canvas || allCombinations.length === 0) {
            updateStatus('No image to download. Please process first.');
            return;
        }
        
        const link = document.createElement('a');
        const combo = allCombinations[currentFrame].join('');
        link.download = 'pixel-tiled-' + combo + '-frame-' + String(currentFrame + 1).padStart(3, '0') + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        updateStatus('Image downloaded!');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CLASS
    // ═══════════════════════════════════════════════════════════════════════════════

// PixelTiler class definition
export class PixelTiler {
    constructor(container, deps) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...(deps || {})
        };
        this.tool = null;
        this.render();
    }
    
    render() {
        try {
            this.tool = new ToolBase(TOOL_CONFIG, this.deps);
            this.tool.mount(this.container);
            this.tool.draw();
        } catch (error) {
            console.error('PixelTiler error:', error);
            console.error('PixelTiler error stack:', error.stack);
            this.container.innerHTML = '<p style="color: var(--c-text); padding: 20px;">Error: ' + error.message + '</p>';
        }
    };
    
    destroy() {
        if (animator) {
            animator.destroy();
            animator = null;
        }
        
        images = {};
        processedImages = {};
        allCombinations = [];
        currentFrame = 0;
        toolInstance = null;
        
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
    }
}

// Export as default for tools_section.js
export default PixelTiler;

window.debugLog('TOOLS', '✅ PixelTiler loaded (ES Module)');
