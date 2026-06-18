/**
 * Image23D Tool - 3D Image Manipulation Tool
 *
 * Creates 3D visual effects and transformations from 2D images
 * Supports depth mapping, perspective transformations, and 3D rendering techniques
 *
 * @version 2.0.0 - ES Module conversion
 */

// ES Module imports
import { ToolBase } from '../core/tool-base.js';
import ComponentLibrary from '../../shared/component-library.js';

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let sourceImage = null;
let depthMap = null;
let processedImage = null;
let toolInstance = null;
let animator = null;

// Image23DTool class definition

    // 3D transformation parameters
    let transformParams = {
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        scale: 1,
        depth: 0.5,
        perspective: 1000,
        lighting: {
            enabled: true,
            intensity: 0.8,
            direction: { x: 1, y: 1, z: 1 }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL CONFIG
    // ═══════════════════════════════════════════════════════════════════════════════

    const TOOL_CONFIG = {
        title: 'IMAGE 2→3D',

        // Animation export config
        animation: {
            type: 'rotation',
            defaultFps: 30,
            canPrerender: true
        },

        sidebar: [
            ['SOURCE', [
                ['Input', [
                    ['file', 'Source Image', 'image/*', { key: 'sourceImage', buttonText: 'Upload Image' }],
                    ['file', 'Depth Map (Optional)', 'image/*', { key: 'depthMap', buttonText: 'Upload Depth' }],
                ]],
                ['Transform', [
                    ['slider', 'X Rotation', -180, 180, 1, { value: 0, withNumber: true, key: 'rotationX' }],
                    ['slider', 'Y Rotation', -180, 180, 1, { value: 0, withNumber: true, key: 'rotationY' }],
                    ['slider', 'Z Rotation', -180, 180, 1, { value: 0, withNumber: true, key: 'rotationZ' }],
                    ['slider', 'Scale', 0.1, 3.0, 0.1, { value: 1.0, withNumber: true, key: 'scale' }],
                ]],
            ]],
            ['3D EFFECTS', [
                ['Depth & View', [
                    ['slider', 'Depth Strength', 0, 1, 0.01, { value: 0.5, withNumber: true, key: 'depth' }],
                    ['slider', 'Perspective', 100, 2000, 50, { value: 1000, withNumber: true, key: 'perspective' }],
                ]],
                ['Lighting', [
                    ['toggle', 'Enable Lighting', ['Off', 'On'], { value: 'On', key: 'lightingEnabled' }],
                    ['slider', 'Light Intensity', 0, 2, 0.1, { value: 0.8, withNumber: true, key: 'lightIntensity' }],
                    ['slider', 'Light X', -1, 1, 0.1, { value: 1, withNumber: true, key: 'lightX' }],
                    ['slider', 'Light Y', -1, 1, 0.1, { value: 1, withNumber: true, key: 'lightY' }],
                ]],
            ]],
            ['ANIMATION', [
                ['Controls', [
                    ['slider', 'FPS', 1, 60, 1, { value: 30, withNumber: true, key: 'fps' }],
                    ['button', 'Play Rotation', null, { key: 'playRotation' }],
                    ['button', 'Stop', null, { key: 'stopAnimation' }],
                    ['button', 'Reset View', null, { key: 'resetView' }],
                ]],
                ['Export', [
                    ['dropdown', 'Format', ['PNG', 'JPEG', 'WEBP'], { value: 'PNG', key: 'exportFormat' }],
                    ['slider', 'Quality', 0.1, 1.0, 0.1, { value: 0.9, withNumber: true, key: 'exportQuality' }],
                    ['button', 'Download Image', null, { key: 'downloadImage' }],
                    ['button', 'Download Animation', null, { key: 'downloadAnimation' }],
                ]],
            ]],
            ['STATUS', [
                ['Info', [
                    ['label', 'Upload an image to begin 3D transformation', { key: 'status', variant: 'body' }],
                    ['label', 'Resolution: --x--', { key: 'resolution', variant: 'caption' }],
                ]],
            ]],
        ],

        canvas: { size: 420 },

        onInit: function(values) {
            toolInstance = this;

            // Wire up buttons
            wireButton(this, 'playRotation', startRotationAnimation);
            wireButton(this, 'stopAnimation', stopAnimation);
            wireButton(this, 'resetView', resetView);
            wireButton(this, 'downloadImage', downloadCurrentImage);
            wireButton(this, 'downloadAnimation', downloadAnimation);

            // Draw initial state
            drawEmptyState(this.getContext(), this.getCanvas());
        },

        onUpdate: function(key, value, allValues) {
            // Handle file uploads
            if (key === 'sourceImage' && value instanceof File) {
                loadSourceImage(value);
            }
            if (key === 'depthMap' && value instanceof File) {
                loadDepthMap(value);
            }

            // Update transformation parameters
            updateTransformParams(key, value);

            // Update lighting parameters
            if (key.startsWith('light')) {
                updateLightingParams(key, value);
            }

            // Handle animation FPS
            if (key === 'fps' && animator) {
                animator.fps = value;
            }

            // Redraw when parameters change
            if (sourceImage && (key.includes('rotation') || key.includes('scale') ||
                key.includes('depth') || key.includes('perspective') || key.includes('light'))) {
                processAndDraw();
            }
        },

        // Pre-render support for animation export
        onRenderFrame: function(frameIndex, totalFrames) {
            if (!sourceImage) return;

            // Calculate rotation for this frame (full 360° rotation)
            const rotationY = (frameIndex / totalFrames) * 360;

            // Temporarily set rotation and render
            const originalRotation = transformParams.rotationY;
            transformParams.rotationY = rotationY;
            render3DImage(this.ctx, this.canvas, sourceImage, depthMap, transformParams);
            transformParams.rotationY = originalRotation;
        },

        onDraw: function(ctx, canvas, values) {
            if (!sourceImage) {
                drawEmptyState(ctx, canvas);
                return;
            }

            render3DImage(ctx, canvas, sourceImage, depthMap, transformParams);
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

    function updateResolution() {
        if (!toolInstance || !sourceImage) return;
        const resComp = toolInstance.getComponent('resolution');
        if (resComp && resComp.element) {
            resComp.element.textContent = `Resolution: ${sourceImage.width}x${sourceImage.height}`;
        }
    }

    function updateTransformParams(key, value) {
        switch(key) {
            case 'rotationX': transformParams.rotationX = value; break;
            case 'rotationY': transformParams.rotationY = value; break;
            case 'rotationZ': transformParams.rotationZ = value; break;
            case 'scale': transformParams.scale = value; break;
            case 'depth': transformParams.depth = value; break;
            case 'perspective': transformParams.perspective = value; break;
        }
    }

    function updateLightingParams(key, value) {
        switch(key) {
            case 'lightingEnabled':
                transformParams.lighting.enabled = value === 'On';
                break;
            case 'lightIntensity':
                transformParams.lighting.intensity = value;
                break;
            case 'lightX':
                transformParams.lighting.direction.x = value;
                break;
            case 'lightY':
                transformParams.lighting.direction.y = value;
                break;
            case 'lightZ':
                transformParams.lighting.direction.z = value;
                break;
        }
    }

    function loadSourceImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                sourceImage = img;
                updateStatus('Source image loaded. Upload depth map for better 3D effect.');
                updateResolution();
                processAndDraw();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function loadDepthMap(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                depthMap = img;
                updateStatus('Depth map loaded. Adjust parameters for 3D effect.');
                processAndDraw();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function processAndDraw() {
        if (!toolInstance || !sourceImage) return;
        processedImage = create3DProjection(sourceImage, depthMap, transformParams);
        toolInstance.redraw();
    }

    function drawEmptyState(ctx, canvas) {
        ctx.fillStyle = 'var(--vga-black)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'var(--vga-green)';
        ctx.font = '16px Space Mono';
        ctx.textAlign = 'center';
        ctx.fillText('UPLOAD IMAGE TO BEGIN', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('3D TRANSFORMATION', canvas.width / 2, canvas.height / 2 + 10);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // 3D RENDERING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function create3DProjection(sourceImg, depthImg, params) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = sourceImg.width;
        canvas.height = sourceImg.height;

        // Draw source image
        ctx.drawImage(sourceImg, 0, 0);

        // Apply 3D transformation if depth map exists
        if (depthImg) {
            applyDepthTransformation(ctx, canvas, depthImg, params);
        }

        return canvas;
    }

    function applyDepthTransformation(ctx, canvas, depthImg, params) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const depthData = getDepthData(depthImg, canvas.width, canvas.height);

        // Apply depth-based displacement
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const depth = depthData[y * canvas.width + x] * params.depth;
                const displacement = depth * 10; // Scale displacement

                // Simple depth-based darkening for lighting effect
                if (params.lighting.enabled) {
                    const lightingFactor = Math.max(0.3, 1 - depth * params.lighting.intensity);
                    const idx = (y * canvas.width + x) * 4;
                    imageData.data[idx] *= lightingFactor;     // R
                    imageData.data[idx + 1] *= lightingFactor; // G
                    imageData.data[idx + 2] *= lightingFactor; // B
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function getDepthData(depthImg, targetWidth, targetHeight) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(depthImg, 0, 0, targetWidth, targetHeight);

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const depthData = new Float32Array(targetWidth * targetHeight);

        for (let i = 0; i < depthData.length; i++) {
            // Convert RGB to grayscale for depth
            const r = imageData.data[i * 4];
            const g = imageData.data[i * 4 + 1];
            const b = imageData.data[i * 4 + 2];
            depthData[i] = (r + g + b) / (255 * 3); // Normalize to 0-1
        }

        return depthData;
    }

    function render3DImage(ctx, canvas, sourceImg, depthImg, params) {
        // Clear canvas
        ctx.fillStyle = 'var(--vga-black)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create 3D projection
        const projected = create3DProjection(sourceImg, depthImg, params);

        // Apply perspective and rotation transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply rotations
        ctx.rotate(params.rotationZ * Math.PI / 180);
        ctx.scale(params.scale, params.scale);

        // Draw the projected image
        ctx.drawImage(projected, -projected.width / 2, -projected.height / 2);

        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ANIMATION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function startRotationAnimation() {
        if (!sourceImage || !toolInstance) return;

        stopAnimation(); // Stop any existing animation

        let rotation = transformParams.rotationY;
        const fps = toolInstance.getValue('fps') || 30;

        animator = toolInstance.animate({
            duration: 1000 / fps,
            loop: true,
            onFrame: function(progress) {
                rotation += 2; // 2 degrees per frame
                if (rotation >= 360) rotation -= 360;
                transformParams.rotationY = rotation;
                toolInstance.redraw();
            }
        });

        updateStatus('Rotation animation playing...');
    }

    function stopAnimation() {
        if (animator) {
            animator.destroy();
            animator = null;
            updateStatus('Animation stopped.');
        }
    }

    function resetView() {
        transformParams.rotationX = 0;
        transformParams.rotationY = 0;
        transformParams.rotationZ = 0;
        transformParams.scale = 1.0;
        transformParams.depth = 0.5;
        transformParams.perspective = 1000;

        // Update UI components
        if (toolInstance) {
            toolInstance.setValue('rotationX', 0);
            toolInstance.setValue('rotationY', 0);
            toolInstance.setValue('rotationZ', 0);
            toolInstance.setValue('scale', 1.0);
            toolInstance.setValue('depth', 0.5);
            toolInstance.setValue('perspective', 1000);
            toolInstance.redraw();
        }

        updateStatus('View reset to default.');
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // EXPORT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function downloadCurrentImage() {
        if (!toolInstance || !sourceImage) {
            updateStatus('No image to download.');
            return;
        }

        const canvas = toolInstance.getCanvas();
        const format = toolInstance.getValue('exportFormat') || 'PNG';
        const quality = toolInstance.getValue('exportQuality') || 0.9;

        const mimeType = format === 'JPEG' ? 'image/jpeg' :
                        format === 'WEBP' ? 'image/webp' : 'image/png';

        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `image3d.${format.toLowerCase()}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, mimeType, quality);

        updateStatus(`Downloaded current view as ${format}.`);
    }

    function downloadAnimation() {
        if (!toolInstance || !sourceImage) {
            updateStatus('No image to animate.');
            return;
        }

        updateStatus('Generating animation...');

        // Create animation with 60 frames (6 seconds at 10fps)
        toolInstance.exportAnimation({
            frameCount: 60,
            filename: 'image3d-rotation.gif',
            fps: toolInstance.getValue('fps') || 30,
            onComplete: function() {
                updateStatus('Animation exported successfully.');
            },
            onError: function(error) {
                updateStatus('Animation export failed: ' + error);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOOL INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

// Image23DTool class definition
export class Image23DTool {
    constructor(container, deps = {}) {
        this.container = container;
        this.deps = {
            ComponentLibrary,
            ...deps
        };
        this.tool = null;
        this.config = TOOL_CONFIG;

        this.initialize();
    }

    initialize() {
        // Use imported ToolBase (ES module)
        this.tool = new ToolBase(this.config, this.deps);
        if (this.container) {
            this.tool.mount(this.container);
        }
    }

    render() {
        if (this.tool) {
            this.tool.draw();
        }
    }

    destroy() {
        if (this.tool) {
            this.tool.destroy();
            this.tool = null;
        }
        // Clean up global state
        sourceImage = null;
        depthMap = null;
        processedImage = null;
        toolInstance = null;
        if (animator) {
            animator.destroy();
            animator = null;
        }
    }
}

// Export config for direct ToolBase usage
export { TOOL_CONFIG as Image23DToolConfig };

window.debugLog('TOOLS', '🖼️ Image23D Tool (ES Module) ready');
